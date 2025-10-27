"""
Team model for storing team information and statistics
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class Team(Base):
    __tablename__ = "teams"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    league = Column(String(50), nullable=False)
    country = Column(String(50))
    
    # Team statistics
    matches_played = Column(Integer, default=0)
    wins = Column(Integer, default=0)
    draws = Column(Integer, default=0)
    losses = Column(Integer, default=0)
    goals_for = Column(Integer, default=0)
    goals_against = Column(Integer, default=0)
    
    # Calculated statistics
    win_percentage = Column(Float, default=0.0)
    goals_per_match = Column(Float, default=0.0)
    goals_against_per_match = Column(Float, default=0.0)
    
    # Additional info
    description = Column(Text)
    logo_url = Column(String(255))
    website = Column(String(255))
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    home_matches = relationship("Match", foreign_keys="Match.home_team_id", back_populates="home_team")
    away_matches = relationship("Match", foreign_keys="Match.away_team_id", back_populates="away_team")
    
    def __repr__(self):
        return f"<Team(name='{self.name}', league='{self.league}')>"
