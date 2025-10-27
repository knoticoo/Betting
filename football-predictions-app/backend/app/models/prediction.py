"""
Prediction model for storing ML model predictions
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class Prediction(Base):
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("matches.id"), nullable=False)
    model_name = Column(String(100), nullable=False)
    model_version = Column(String(50), nullable=False)
    
    # Predictions
    predicted_outcome = Column(String(1), nullable=False)  # H, A, D
    predicted_home_score = Column(Integer)
    predicted_away_score = Column(Integer)
    
    # Confidence scores
    home_win_probability = Column(Float, nullable=False)
    draw_probability = Column(Float, nullable=False)
    away_win_probability = Column(Float, nullable=False)
    overall_confidence = Column(Float, nullable=False)
    
    # Additional prediction data
    prediction_features = Column(Text)  # JSON string of features used
    model_metadata = Column(Text)  # JSON string of model parameters
    
    # Validation
    is_correct = Column(Boolean, default=None)  # Will be updated after match
    actual_outcome = Column(String(1), default=None)
    actual_home_score = Column(Integer, default=None)
    actual_away_score = Column(Integer, default=None)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    match = relationship("Match", back_populates="predictions")
    
    def __repr__(self):
        return f"<Prediction(match_id={self.match_id}, outcome='{self.predicted_outcome}', confidence={self.overall_confidence:.2f})>"
