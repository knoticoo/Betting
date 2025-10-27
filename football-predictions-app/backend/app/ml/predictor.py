"""
Model prediction for football matches
"""

import pandas as pd
import numpy as np
import pickle
import os
from typing import Dict, Any, List
from sqlalchemy.orm import Session
import torch

from app.models.match import Match
from app.models.prediction import Prediction
from app.ml.feature_engineering import FeatureEngineer

class ModelPredictor:
    """Make predictions using trained ML models"""
    
    def __init__(self, db: Session):
        self.db = db
        self.feature_engineer = FeatureEngineer(db)
        self.models_dir = "./models"
    
    async def predict_match(self, match_id: int, model_name: str, 
                          model_version: str = None) -> Dict[str, Any]:
        """Make prediction for a single match"""
        try:
            # Get match details
            match = self.db.query(Match).filter(Match.id == match_id).first()
            if not match:
                raise ValueError(f"Match {match_id} not found")
            
            # Load model
            model, model_type, feature_columns = self._load_model(model_name, model_version)
            
            # Prepare features
            features = self._prepare_match_features(match, feature_columns)
            
            # Make prediction
            prediction_result = self._make_prediction(model, features, model_type)
            
            # Save prediction to database
            prediction = self._save_prediction(
                match_id, model_name, model_version, prediction_result, features
            )
            
            return {
                "match_id": match_id,
                "home_team": match.home_team.name,
                "away_team": match.away_team.name,
                "match_date": match.match_date.isoformat(),
                "prediction": prediction_result,
                "prediction_id": prediction.id
            }
            
        except Exception as e:
            raise Exception(f"Prediction failed: {str(e)}")
    
    async def predict_matches_batch(self, match_ids: List[int], model_name: str,
                                  model_version: str = None) -> List[Dict[str, Any]]:
        """Make predictions for multiple matches"""
        predictions = []
        
        for match_id in match_ids:
            try:
                prediction = await self.predict_match(match_id, model_name, model_version)
                predictions.append(prediction)
            except Exception as e:
                predictions.append({
                    "match_id": match_id,
                    "error": str(e)
                })
        
        return predictions
    
    def _load_model(self, model_name: str, model_version: str = None):
        """Load trained model from disk"""
        if model_version:
            model_filename = f"{model_name}_{model_version}.pkl"
        else:
            # Find latest version
            model_files = [f for f in os.listdir(self.models_dir) 
                          if f.startswith(f"{model_name}_") and f.endswith(".pkl")]
            if not model_files:
                raise ValueError(f"No model found for {model_name}")
            model_filename = sorted(model_files)[-1]  # Latest version
        
        model_path = os.path.join(self.models_dir, model_filename)
        
        if not os.path.exists(model_path):
            raise ValueError(f"Model file not found: {model_path}")
        
        with open(model_path, 'rb') as f:
            model_data = pickle.load(f)
        
        return model_data['model'], model_data['model_type'], model_data['feature_columns']
    
    def _prepare_match_features(self, match: Match, feature_columns: List[str]) -> pd.DataFrame:
        """Prepare features for a single match"""
        # Create match data
        match_data = {
            'id': match.id,
            'home_team_id': match.home_team_id,
            'away_team_id': match.away_team_id,
            'league': match.league,
            'season': match.season,
            'match_date': match.match_date,
            'home_score': match.home_score,
            'away_score': match.away_score,
            'result': match.result
        }
        
        # Convert to DataFrame
        df = pd.DataFrame([match_data])
        
        # Create features
        df_with_features = self.feature_engineer.create_features(df)
        
        # Select only required feature columns
        features = df_with_features[feature_columns].fillna(0)
        
        return features
    
    def _make_prediction(self, model, features: pd.DataFrame, model_type: str) -> Dict[str, Any]:
        """Make prediction using the model"""
        # Make prediction based on model type
        if model_type == 'logistic_regression':
            features_scaled = model.scaler.transform(features)
            prediction_proba = model.predict_proba(features_scaled)[0]
            prediction_class = model.predict(features_scaled)[0]
        elif model_type == 'neural_network':
            with torch.no_grad():
                features_tensor = torch.FloatTensor(features.values)
                outputs = model(features_tensor)
                prediction_proba = torch.softmax(outputs, dim=1).numpy()[0]
                prediction_class = np.argmax(prediction_proba)
        else:
            prediction_proba = model.predict_proba(features)[0]
            prediction_class = model.predict(features)[0]
        
        # Convert prediction to outcome
        outcome_map = {0: 'H', 1: 'A', 2: 'D'}
        predicted_outcome = outcome_map[prediction_class]
        
        # Calculate confidence
        max_prob = np.max(prediction_proba)
        
        # Get individual probabilities
        home_prob = prediction_proba[0]  # Home win
        away_prob = prediction_proba[1]  # Away win
        draw_prob = prediction_proba[2]  # Draw
        
        # Predict scores (simplified)
        predicted_home_score = int(round(home_prob * 3))  # Rough estimate
        predicted_away_score = int(round(away_prob * 3))
        
        return {
            'predicted_outcome': predicted_outcome,
            'predicted_home_score': predicted_home_score,
            'predicted_away_score': predicted_away_score,
            'home_win_probability': float(home_prob),
            'draw_probability': float(draw_prob),
            'away_win_probability': float(away_prob),
            'overall_confidence': float(max_prob)
        }
    
    def _save_prediction(self, match_id: int, model_name: str, model_version: str,
                        prediction_result: Dict[str, Any], features: pd.DataFrame) -> Prediction:
        """Save prediction to database"""
        prediction = Prediction(
            match_id=match_id,
            model_name=model_name,
            model_version=model_version,
            predicted_outcome=prediction_result['predicted_outcome'],
            predicted_home_score=prediction_result['predicted_home_score'],
            predicted_away_score=prediction_result['predicted_away_score'],
            home_win_probability=prediction_result['home_win_probability'],
            draw_probability=prediction_result['draw_probability'],
            away_win_probability=prediction_result['away_win_probability'],
            overall_confidence=prediction_result['overall_confidence'],
            prediction_features=features.to_json(),
            model_metadata=f"Model: {model_name}, Version: {model_version}"
        )
        
        self.db.add(prediction)
        self.db.commit()
        self.db.refresh(prediction)
        
        return prediction
