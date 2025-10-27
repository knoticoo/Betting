"""
Match model for storing match information and results
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
from enum import Enum

class MatchStatus(str, Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    FINISHED = "finished"
    CANCELLED = "cancelled"
    POSTPONED = "postponed"

class Match(Base):
    __tablename__ = "matches"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Teams
    home_team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    away_team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    
    # Match details
    league = Column(String(50), nullable=False)
    season = Column(String(20), nullable=False)
    match_date = Column(DateTime, nullable=False)
    venue = Column(String(100))
    referee = Column(String(100))
    
    # Match status
    status = Column(String(20), default=MatchStatus.SCHEDULED)
    
    # Results
    home_score = Column(Integer, default=None)
    away_score = Column(Integer, default=None)
    home_score_ht = Column(Integer, default=None)  # Half-time score
    away_score_ht = Column(Integer, default=None)
    
    # Additional match data
    attendance = Column(Integer)
    weather_condition = Column(String(50))
    temperature = Column(Float)
    
    # Betting odds (if available)
    home_odds = Column(Float)
    draw_odds = Column(Float)
    away_odds = Column(Float)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    home_team = relationship("Team", foreign_keys=[home_team_id], back_populates="home_matches")
    away_team = relationship("Team", foreign_keys=[away_team_id], back_populates="away_matches")
    predictions = relationship("Prediction", back_populates="match")
    
    @property
    def result(self):
        """Get match result as string"""
        if self.home_score is None or self.away_score is None:
            return None
        
        if self.home_score > self.away_score:
            return "H"  # Home win
        elif self.away_score > self.home_score:
            return "A"  # Away win
        else:
            return "D"  # Draw
    
    def __repr__(self):
        return f"<Match({self.home_team.name} vs {self.away_team.name}, {self.match_date})>"
