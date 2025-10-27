"""
Prediction API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.prediction import Prediction
from app.models.match import Match
from pydantic import BaseModel

router = APIRouter()

# Pydantic models for request/response
class PredictionResponse(BaseModel):
    id: int
    match_id: int
    home_team_name: str
    away_team_name: str
    match_date: datetime
    model_name: str
    model_version: str
    predicted_outcome: str
    predicted_home_score: Optional[int]
    predicted_away_score: Optional[int]
    home_win_probability: float
    draw_probability: float
    away_win_probability: float
    overall_confidence: float
    is_correct: Optional[bool]
    actual_outcome: Optional[str]
    actual_home_score: Optional[int]
    actual_away_score: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

class PredictionCreate(BaseModel):
    match_id: int
    model_name: str
    model_version: str
    predicted_outcome: str
    predicted_home_score: Optional[int] = None
    predicted_away_score: Optional[int] = None
    home_win_probability: float
    draw_probability: float
    away_win_probability: float
    overall_confidence: float
    prediction_features: Optional[str] = None
    model_metadata: Optional[str] = None

@router.get("/", response_model=List[PredictionResponse])
async def get_predictions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    model_name: Optional[str] = None,
    match_id: Optional[int] = None,
    is_correct: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Get predictions with optional filtering"""
    query = db.query(Prediction).join(Match)
    
    if model_name:
        query = query.filter(Prediction.model_name == model_name)
    if match_id:
        query = query.filter(Prediction.match_id == match_id)
    if is_correct is not None:
        query = query.filter(Prediction.is_correct == is_correct)
    
    predictions = query.offset(skip).limit(limit).all()
    
    result = []
    for pred in predictions:
        match = db.query(Match).filter(Match.id == pred.match_id).first()
        result.append(PredictionResponse(
            id=pred.id,
            match_id=pred.match_id,
            home_team_name=match.home_team.name,
            away_team_name=match.away_team.name,
            match_date=match.match_date,
            model_name=pred.model_name,
            model_version=pred.model_version,
            predicted_outcome=pred.predicted_outcome,
            predicted_home_score=pred.predicted_home_score,
            predicted_away_score=pred.predicted_away_score,
            home_win_probability=pred.home_win_probability,
            draw_probability=pred.draw_probability,
            away_win_probability=pred.away_win_probability,
            overall_confidence=pred.overall_confidence,
            is_correct=pred.is_correct,
            actual_outcome=pred.actual_outcome,
            actual_home_score=pred.actual_home_score,
            actual_away_score=pred.actual_away_score,
            created_at=pred.created_at
        ))
    
    return result

@router.get("/{prediction_id}", response_model=PredictionResponse)
async def get_prediction(prediction_id: int, db: Session = Depends(get_db)):
    """Get a specific prediction by ID"""
    pred = db.query(Prediction).filter(Prediction.id == prediction_id).first()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")
    
    match = db.query(Match).filter(Match.id == pred.match_id).first()
    
    return PredictionResponse(
        id=pred.id,
        match_id=pred.match_id,
        home_team_name=match.home_team.name,
        away_team_name=match.away_team.name,
        match_date=match.match_date,
        model_name=pred.model_name,
        model_version=pred.model_version,
        predicted_outcome=pred.predicted_outcome,
        predicted_home_score=pred.predicted_home_score,
        predicted_away_score=pred.predicted_away_score,
        home_win_probability=pred.home_win_probability,
        draw_probability=pred.draw_probability,
        away_win_probability=pred.away_win_probability,
        overall_confidence=pred.overall_confidence,
        is_correct=pred.is_correct,
        actual_outcome=pred.actual_outcome,
        actual_home_score=pred.actual_home_score,
        actual_away_score=pred.actual_away_score,
        created_at=pred.created_at
    )

@router.post("/", response_model=PredictionResponse)
async def create_prediction(prediction: PredictionCreate, db: Session = Depends(get_db)):
    """Create a new prediction"""
    # Verify match exists
    match = db.query(Match).filter(Match.id == prediction.match_id).first()
    if not match:
        raise HTTPException(status_code=400, detail="Match not found")
    
    db_prediction = Prediction(**prediction.dict())
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)
    
    return PredictionResponse(
        id=db_prediction.id,
        match_id=db_prediction.match_id,
        home_team_name=match.home_team.name,
        away_team_name=match.away_team.name,
        match_date=match.match_date,
        model_name=db_prediction.model_name,
        model_version=db_prediction.model_version,
        predicted_outcome=db_prediction.predicted_outcome,
        predicted_home_score=db_prediction.predicted_home_score,
        predicted_away_score=db_prediction.predicted_away_score,
        home_win_probability=db_prediction.home_win_probability,
        draw_probability=db_prediction.draw_probability,
        away_win_probability=db_prediction.away_win_probability,
        overall_confidence=db_prediction.overall_confidence,
        is_correct=db_prediction.is_correct,
        actual_outcome=db_prediction.actual_outcome,
        actual_home_score=db_prediction.actual_home_score,
        actual_away_score=db_prediction.actual_away_score,
        created_at=db_prediction.created_at
    )

@router.get("/stats/accuracy")
async def get_prediction_accuracy(
    model_name: Optional[str] = None,
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Get prediction accuracy statistics"""
    from datetime import datetime, timedelta
    
    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    query = db.query(Prediction).filter(
        Prediction.created_at >= start_date,
        Prediction.is_correct.isnot(None)  # Only completed predictions
    )
    
    if model_name:
        query = query.filter(Prediction.model_name == model_name)
    
    predictions = query.all()
    
    if not predictions:
        return {
            "total_predictions": 0,
            "correct_predictions": 0,
            "accuracy": 0.0,
            "model_name": model_name,
            "period_days": days
        }
    
    correct_predictions = sum(1 for p in predictions if p.is_correct)
    total_predictions = len(predictions)
    accuracy = correct_predictions / total_predictions if total_predictions > 0 else 0.0
    
    return {
        "total_predictions": total_predictions,
        "correct_predictions": correct_predictions,
        "accuracy": round(accuracy, 3),
        "model_name": model_name,
        "period_days": days
    }
