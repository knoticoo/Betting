"""
ML API endpoints for model training and predictions
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import json

from app.database import get_db
from app.models.match import Match
from app.models.prediction import Prediction
from app.models.model_performance import ModelPerformance
from app.ml.trainer import ModelTrainer
from app.ml.predictor import ModelPredictor

router = APIRouter()

# Pydantic models for ML requests
class TrainingRequest(BaseModel):
    model_name: str
    model_type: str  # 'random_forest', 'xgboost', 'neural_network', 'logistic_regression'
    league: Optional[str] = None
    season: Optional[str] = None
    test_size: float = 0.2
    random_state: int = 42
    hyperparameters: Optional[Dict[str, Any]] = None

class PredictionRequest(BaseModel):
    match_id: int
    model_name: str
    model_version: Optional[str] = None

class BatchPredictionRequest(BaseModel):
    match_ids: List[int]
    model_name: str
    model_version: Optional[str] = None

class ModelInfo(BaseModel):
    name: str
    version: str
    model_type: str
    accuracy: float
    is_active: bool
    is_best_model: bool
    training_date: str
    training_samples: int

@router.get("/models", response_model=List[ModelInfo])
async def get_models(db: Session = Depends(get_db)):
    """Get all available models"""
    models = db.query(ModelPerformance).all()
    
    return [
        ModelInfo(
            name=model.model_name,
            version=model.model_version,
            model_type=json.loads(model.model_parameters).get('model_type', 'unknown'),
            accuracy=model.accuracy,
            is_active=model.is_active,
            is_best_model=model.is_best_model,
            training_date=model.training_date.isoformat(),
            training_samples=model.training_samples
        )
        for model in models
    ]

@router.get("/models/{model_name}/performance")
async def get_model_performance(
    model_name: str,
    db: Session = Depends(get_db)
):
    """Get detailed performance metrics for a specific model"""
    model = db.query(ModelPerformance).filter(
        ModelPerformance.model_name == model_name
    ).order_by(ModelPerformance.training_date.desc()).first()
    
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    return {
        "model_name": model.model_name,
        "model_version": model.model_version,
        "accuracy": model.accuracy,
        "precision": {
            "home": model.precision_home,
            "draw": model.precision_draw,
            "away": model.precision_away
        },
        "recall": {
            "home": model.recall_home,
            "draw": model.recall_draw,
            "away": model.recall_away
        },
        "f1_score": {
            "home": model.f1_score_home,
            "draw": model.f1_score_draw,
            "away": model.f1_score_away
        },
        "additional_metrics": {
            "log_loss": model.log_loss,
            "brier_score": model.brier_score,
            "calibration_error": model.calibration_error
        },
        "training_info": {
            "training_samples": model.training_samples,
            "validation_samples": model.validation_samples,
            "test_samples": model.test_samples,
            "training_duration_seconds": model.training_duration_seconds,
            "training_date": model.training_date.isoformat()
        },
        "is_active": model.is_active,
        "is_best_model": model.is_best_model
    }

@router.post("/train")
async def train_model(
    training_request: TrainingRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Train a new ML model"""
    try:
        # Initialize trainer
        trainer = ModelTrainer(db)
        
        # Start training in background
        background_tasks.add_task(
            trainer.train_model,
            training_request.dict()
        )
        
        return {
            "message": "Model training started",
            "model_name": training_request.model_name,
            "model_type": training_request.model_type,
            "status": "training"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

@router.get("/train/status/{model_name}")
async def get_training_status(
    model_name: str,
    db: Session = Depends(get_db)
):
    """Get training status for a model"""
    # Check if model exists in performance table
    model = db.query(ModelPerformance).filter(
        ModelPerformance.model_name == model_name
    ).order_by(ModelPerformance.training_date.desc()).first()
    
    if model:
        return {
            "status": "completed",
            "model_name": model_name,
            "accuracy": model.accuracy,
            "training_date": model.training_date.isoformat()
        }
    else:
        return {
            "status": "training",
            "model_name": model_name,
            "message": "Model is still being trained"
        }

@router.post("/predict")
async def predict_match(
    prediction_request: PredictionRequest,
    db: Session = Depends(get_db)
):
    """Make a prediction for a single match"""
    try:
        # Get match details
        match = db.query(Match).filter(Match.id == prediction_request.match_id).first()
        if not match:
            raise HTTPException(status_code=404, detail="Match not found")
        
        # Initialize predictor
        predictor = ModelPredictor(db)
        
        # Make prediction
        prediction = await predictor.predict_match(
            match_id=prediction_request.match_id,
            model_name=prediction_request.model_name,
            model_version=prediction_request.model_version
        )
        
        return prediction
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.post("/predict/batch")
async def predict_matches_batch(
    batch_request: BatchPredictionRequest,
    db: Session = Depends(get_db)
):
    """Make predictions for multiple matches"""
    try:
        # Initialize predictor
        predictor = ModelPredictor(db)
        
        # Make batch predictions
        predictions = await predictor.predict_matches_batch(
            match_ids=batch_request.match_ids,
            model_name=batch_request.model_name,
            model_version=batch_request.model_version
        )
        
        return {
            "predictions": predictions,
            "total_matches": len(batch_request.match_ids),
            "model_name": batch_request.model_name
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")

@router.get("/features/importance/{model_name}")
async def get_feature_importance(
    model_name: str,
    db: Session = Depends(get_db)
):
    """Get feature importance for a model"""
    model = db.query(ModelPerformance).filter(
        ModelPerformance.model_name == model_name
    ).order_by(ModelPerformance.training_date.desc()).first()
    
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    if not model.feature_importance:
        raise HTTPException(status_code=404, detail="Feature importance not available")
    
    try:
        importance_data = json.loads(model.feature_importance)
        return {
            "model_name": model_name,
            "feature_importance": importance_data
        }
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid feature importance data")

@router.post("/models/{model_name}/activate")
async def activate_model(
    model_name: str,
    db: Session = Depends(get_db)
):
    """Activate a specific model version"""
    # Deactivate all models of this name
    db.query(ModelPerformance).filter(
        ModelPerformance.model_name == model_name
    ).update({"is_active": False})
    
    # Activate the latest version
    latest_model = db.query(ModelPerformance).filter(
        ModelPerformance.model_name == model_name
    ).order_by(ModelPerformance.training_date.desc()).first()
    
    if not latest_model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    latest_model.is_active = True
    db.commit()
    
    return {
        "message": f"Model {model_name} activated",
        "version": latest_model.model_version
    }

@router.delete("/models/{model_name}")
async def delete_model(
    model_name: str,
    db: Session = Depends(get_db)
):
    """Delete a model and all its predictions"""
    # Delete predictions
    db.query(Prediction).filter(
        Prediction.model_name == model_name
    ).delete()
    
    # Delete model performance records
    db.query(ModelPerformance).filter(
        ModelPerformance.model_name == model_name
    ).delete()
    
    db.commit()
    
    return {"message": f"Model {model_name} and all its predictions deleted"}
