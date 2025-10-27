"""
Model performance tracking for ML models
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from app.database import Base
from datetime import datetime

class ModelPerformance(Base):
    __tablename__ = "model_performance"
    
    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False)
    model_version = Column(String(50), nullable=False)
    
    # Performance metrics
    accuracy = Column(Float, nullable=False)
    precision_home = Column(Float)
    precision_draw = Column(Float)
    precision_away = Column(Float)
    recall_home = Column(Float)
    recall_draw = Column(Float)
    recall_away = Column(Float)
    f1_score_home = Column(Float)
    f1_score_draw = Column(Float)
    f1_score_away = Column(Float)
    
    # Additional metrics
    log_loss = Column(Float)
    brier_score = Column(Float)
    calibration_error = Column(Float)
    
    # Training data info
    training_samples = Column(Integer)
    validation_samples = Column(Integer)
    test_samples = Column(Integer)
    training_duration_seconds = Column(Float)
    
    # Model metadata
    model_parameters = Column(Text)  # JSON string
    feature_importance = Column(Text)  # JSON string
    training_date = Column(DateTime, default=datetime.utcnow)
    
    # Status
    is_active = Column(Boolean, default=False)
    is_best_model = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<ModelPerformance(model='{self.model_name}', accuracy={self.accuracy:.3f})>"
