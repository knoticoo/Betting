"""
Model training for football predictions
"""

import pandas as pd
import numpy as np
import json
import pickle
import os
from datetime import datetime
from typing import Dict, Any, Tuple
from sqlalchemy.orm import Session
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.preprocessing import StandardScaler
import xgboost as xgb
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

from app.models.match import Match
from app.models.model_performance import ModelPerformance
from app.ml.feature_engineering import FeatureEngineer

class ModelTrainer:
    """Train ML models for football predictions"""
    
    def __init__(self, db: Session):
        self.db = db
        self.feature_engineer = FeatureEngineer(db)
        self.models_dir = "./models"
        os.makedirs(self.models_dir, exist_ok=True)
    
    def train_model(self, training_config: Dict[str, Any]) -> Dict[str, Any]:
        """Train a model with given configuration"""
        start_time = datetime.now()
        
        try:
            # Get training data
            X, y, feature_columns = self._get_training_data(training_config)
            
            if len(X) == 0:
                raise ValueError("No training data available")
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, 
                test_size=training_config.get('test_size', 0.2),
                random_state=training_config.get('random_state', 42),
                stratify=y
            )
            
            # Train model based on type
            model_type = training_config['model_type']
            model = self._train_model_by_type(
                model_type, X_train, y_train, training_config
            )
            
            # Evaluate model
            metrics = self._evaluate_model(model, X_test, y_test, model_type)
            
            # Save model
            model_version = self._save_model(
                model, training_config['model_name'], model_type, feature_columns
            )
            
            # Save performance metrics
            self._save_performance_metrics(
                training_config['model_name'], model_version, model_type,
                metrics, len(X_train), len(X_test), 
                datetime.now() - start_time, training_config
            )
            
            return {
                "status": "success",
                "model_name": training_config['model_name'],
                "model_version": model_version,
                "accuracy": metrics['accuracy'],
                "training_time": str(datetime.now() - start_time)
            }
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "model_name": training_config['model_name']
            }
    
    def _get_training_data(self, config: Dict[str, Any]) -> Tuple[pd.DataFrame, pd.Series, list]:
        """Get and prepare training data"""
        # Query matches with results
        query = self.db.query(Match).filter(
            Match.home_score.isnot(None),
            Match.away_score.isnot(None)
        )
        
        if config.get('league'):
            query = query.filter(Match.league == config['league'])
        if config.get('season'):
            query = query.filter(Match.season == config['season'])
        
        matches = query.all()
        
        if not matches:
            return pd.DataFrame(), pd.Series(dtype=int), []
        
        # Convert to DataFrame
        matches_data = []
        for match in matches:
            matches_data.append({
                'id': match.id,
                'home_team_id': match.home_team_id,
                'away_team_id': match.away_team_id,
                'league': match.league,
                'season': match.season,
                'match_date': match.match_date,
                'home_score': match.home_score,
                'away_score': match.away_score,
                'result': match.result
            })
        
        df = pd.DataFrame(matches_data)
        
        # Prepare features
        X, y, feature_columns = self.feature_engineer.prepare_training_data(df)
        
        return X, y, feature_columns
    
    def _train_model_by_type(self, model_type: str, X_train: pd.DataFrame, 
                           y_train: pd.Series, config: Dict[str, Any]):
        """Train model based on type"""
        hyperparams = config.get('hyperparameters', {})
        
        if model_type == 'random_forest':
            return RandomForestClassifier(
                n_estimators=hyperparams.get('n_estimators', 100),
                max_depth=hyperparams.get('max_depth', 10),
                random_state=config.get('random_state', 42)
            ).fit(X_train, y_train)
        
        elif model_type == 'xgboost':
            return xgb.XGBClassifier(
                n_estimators=hyperparams.get('n_estimators', 100),
                max_depth=hyperparams.get('max_depth', 6),
                learning_rate=hyperparams.get('learning_rate', 0.1),
                random_state=config.get('random_state', 42)
            ).fit(X_train, y_train)
        
        elif model_type == 'logistic_regression':
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            model = LogisticRegression(
                random_state=config.get('random_state', 42),
                max_iter=hyperparams.get('max_iter', 1000)
            ).fit(X_train_scaled, y_train)
            # Store scaler with model
            model.scaler = scaler
            return model
        
        elif model_type == 'neural_network':
            return self._train_neural_network(X_train, y_train, hyperparams)
        
        else:
            raise ValueError(f"Unknown model type: {model_type}")
    
    def _train_neural_network(self, X_train: pd.DataFrame, y_train: pd.Series, 
                            hyperparams: Dict[str, Any]) -> nn.Module:
        """Train neural network model"""
        # Convert to tensors
        X_tensor = torch.FloatTensor(X_train.values)
        y_tensor = torch.LongTensor(y_train.values)
        
        # Create dataset
        dataset = TensorDataset(X_tensor, y_tensor)
        dataloader = DataLoader(dataset, batch_size=32, shuffle=True)
        
        # Define model
        input_size = X_train.shape[1]
        hidden_size = hyperparams.get('hidden_size', 64)
        num_classes = 3
        
        model = nn.Sequential(
            nn.Linear(input_size, hidden_size),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_size, hidden_size // 2),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(hidden_size // 2, num_classes)
        )
        
        # Training
        criterion = nn.CrossEntropyLoss()
        optimizer = optim.Adam(model.parameters(), lr=hyperparams.get('learning_rate', 0.001))
        
        epochs = hyperparams.get('epochs', 100)
        for epoch in range(epochs):
            for batch_X, batch_y in dataloader:
                optimizer.zero_grad()
                outputs = model(batch_X)
                loss = criterion(outputs, batch_y)
                loss.backward()
                optimizer.step()
        
        return model
    
    def _evaluate_model(self, model, X_test: pd.DataFrame, y_test: pd.Series, 
                       model_type: str) -> Dict[str, Any]:
        """Evaluate model performance"""
        # Make predictions
        if model_type == 'logistic_regression':
            X_test_scaled = model.scaler.transform(X_test)
            y_pred = model.predict(X_test_scaled)
            y_pred_proba = model.predict_proba(X_test_scaled)
        elif model_type == 'neural_network':
            with torch.no_grad():
                X_test_tensor = torch.FloatTensor(X_test.values)
                outputs = model(X_test_tensor)
                y_pred_proba = torch.softmax(outputs, dim=1).numpy()
                y_pred = np.argmax(y_pred_proba, axis=1)
        else:
            y_pred = model.predict(X_test)
            y_pred_proba = model.predict_proba(X_test)
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        
        # Classification report
        report = classification_report(y_test, y_pred, output_dict=True)
        
        # Confusion matrix
        cm = confusion_matrix(y_test, y_pred)
        
        return {
            'accuracy': accuracy,
            'precision_home': report['0']['precision'],
            'precision_draw': report['2']['precision'],
            'precision_away': report['1']['precision'],
            'recall_home': report['0']['recall'],
            'recall_draw': report['2']['recall'],
            'recall_away': report['1']['recall'],
            'f1_score_home': report['0']['f1-score'],
            'f1_score_draw': report['2']['f1-score'],
            'f1_score_away': report['1']['f1-score'],
            'confusion_matrix': cm.tolist()
        }
    
    def _save_model(self, model, model_name: str, model_type: str, 
                   feature_columns: list) -> str:
        """Save trained model"""
        model_version = datetime.now().strftime("%Y%m%d_%H%M%S")
        model_filename = f"{model_name}_{model_version}.pkl"
        model_path = os.path.join(self.models_dir, model_filename)
        
        # Save model and metadata
        model_data = {
            'model': model,
            'model_type': model_type,
            'feature_columns': feature_columns,
            'version': model_version,
            'created_at': datetime.now().isoformat()
        }
        
        with open(model_path, 'wb') as f:
            pickle.dump(model_data, f)
        
        return model_version
    
    def _save_performance_metrics(self, model_name: str, model_version: str, 
                                model_type: str, metrics: Dict[str, Any],
                                training_samples: int, test_samples: int,
                                training_duration, config: Dict[str, Any]):
        """Save model performance to database"""
        performance = ModelPerformance(
            model_name=model_name,
            model_version=model_version,
            accuracy=metrics['accuracy'],
            precision_home=metrics['precision_home'],
            precision_draw=metrics['precision_draw'],
            precision_away=metrics['precision_away'],
            recall_home=metrics['recall_home'],
            recall_draw=metrics['recall_draw'],
            recall_away=metrics['recall_away'],
            f1_score_home=metrics['f1_score_home'],
            f1_score_draw=metrics['f1_score_draw'],
            f1_score_away=metrics['f1_score_away'],
            training_samples=training_samples,
            test_samples=test_samples,
            training_duration_seconds=training_duration.total_seconds(),
            model_parameters=json.dumps({
                'model_type': model_type,
                'hyperparameters': config.get('hyperparameters', {}),
                'test_size': config.get('test_size', 0.2),
                'random_state': config.get('random_state', 42)
            }),
            is_active=False  # New models are not active by default
        )
        
        self.db.add(performance)
        self.db.commit()
