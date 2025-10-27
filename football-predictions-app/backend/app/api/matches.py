"""
Match API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date

from app.database import get_db
from app.models.match import Match, MatchStatus
from app.models.team import Team
from pydantic import BaseModel

router = APIRouter()

# Pydantic models for request/response
class MatchCreate(BaseModel):
    home_team_id: int
    away_team_id: int
    league: str
    season: str
    match_date: datetime
    venue: Optional[str] = None
    referee: Optional[str] = None
    home_odds: Optional[float] = None
    draw_odds: Optional[float] = None
    away_odds: Optional[float] = None

class MatchUpdate(BaseModel):
    home_score: Optional[int] = None
    away_score: Optional[int] = None
    home_score_ht: Optional[int] = None
    away_score_ht: Optional[int] = None
    status: Optional[MatchStatus] = None
    attendance: Optional[int] = None
    weather_condition: Optional[str] = None
    temperature: Optional[float] = None

class MatchResponse(BaseModel):
    id: int
    home_team_id: int
    away_team_id: int
    home_team_name: str
    away_team_name: str
    league: str
    season: str
    match_date: datetime
    venue: Optional[str]
    referee: Optional[str]
    status: str
    home_score: Optional[int]
    away_score: Optional[int]
    home_score_ht: Optional[int]
    away_score_ht: Optional[int]
    result: Optional[str]
    attendance: Optional[int]
    weather_condition: Optional[str]
    temperature: Optional[float]
    home_odds: Optional[float]
    draw_odds: Optional[float]
    away_odds: Optional[float]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

@router.get("/", response_model=List[MatchResponse])
async def get_matches(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    league: Optional[str] = None,
    season: Optional[str] = None,
    status: Optional[MatchStatus] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Get matches with optional filtering"""
    query = db.query(Match)
    
    if league:
        query = query.filter(Match.league == league)
    if season:
        query = query.filter(Match.season == season)
    if status:
        query = query.filter(Match.status == status)
    if date_from:
        query = query.filter(Match.match_date >= date_from)
    if date_to:
        query = query.filter(Match.match_date <= date_to)
    
    matches = query.offset(skip).limit(limit).all()
    
    # Convert to response format
    result = []
    for match in matches:
        result.append(MatchResponse(
            id=match.id,
            home_team_id=match.home_team_id,
            away_team_id=match.away_team_id,
            home_team_name=match.home_team.name,
            away_team_name=match.away_team.name,
            league=match.league,
            season=match.season,
            match_date=match.match_date,
            venue=match.venue,
            referee=match.referee,
            status=match.status,
            home_score=match.home_score,
            away_score=match.away_score,
            home_score_ht=match.home_score_ht,
            away_score_ht=match.away_score_ht,
            result=match.result,
            attendance=match.attendance,
            weather_condition=match.weather_condition,
            temperature=match.temperature,
            home_odds=match.home_odds,
            draw_odds=match.draw_odds,
            away_odds=match.away_odds,
            created_at=match.created_at,
            updated_at=match.updated_at
        ))
    
    return result

@router.get("/{match_id}", response_model=MatchResponse)
async def get_match(match_id: int, db: Session = Depends(get_db)):
    """Get a specific match by ID"""
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    return MatchResponse(
        id=match.id,
        home_team_id=match.home_team_id,
        away_team_id=match.away_team_id,
        home_team_name=match.home_team.name,
        away_team_name=match.away_team.name,
        league=match.league,
        season=match.season,
        match_date=match.match_date,
        venue=match.venue,
        referee=match.referee,
        status=match.status,
        home_score=match.home_score,
        away_score=match.away_score,
        home_score_ht=match.home_score_ht,
        away_score_ht=match.away_score_ht,
        result=match.result,
        attendance=match.attendance,
        weather_condition=match.weather_condition,
        temperature=match.temperature,
        home_odds=match.home_odds,
        draw_odds=match.draw_odds,
        away_odds=match.away_odds,
        created_at=match.created_at,
        updated_at=match.updated_at
    )

@router.post("/", response_model=MatchResponse)
async def create_match(match: MatchCreate, db: Session = Depends(get_db)):
    """Create a new match"""
    # Verify teams exist
    home_team = db.query(Team).filter(Team.id == match.home_team_id).first()
    away_team = db.query(Team).filter(Team.id == match.away_team_id).first()
    
    if not home_team:
        raise HTTPException(status_code=400, detail="Home team not found")
    if not away_team:
        raise HTTPException(status_code=400, detail="Away team not found")
    
    db_match = Match(**match.dict())
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    
    return MatchResponse(
        id=db_match.id,
        home_team_id=db_match.home_team_id,
        away_team_id=db_match.away_team_id,
        home_team_name=home_team.name,
        away_team_name=away_team.name,
        league=db_match.league,
        season=db_match.season,
        match_date=db_match.match_date,
        venue=db_match.venue,
        referee=db_match.referee,
        status=db_match.status,
        home_score=db_match.home_score,
        away_score=db_match.away_score,
        home_score_ht=db_match.home_score_ht,
        away_score_ht=db_match.away_score_ht,
        result=db_match.result,
        attendance=db_match.attendance,
        weather_condition=db_match.weather_condition,
        temperature=db_match.temperature,
        home_odds=db_match.home_odds,
        draw_odds=db_match.draw_odds,
        away_odds=db_match.away_odds,
        created_at=db_match.created_at,
        updated_at=db_match.updated_at
    )

@router.put("/{match_id}", response_model=MatchResponse)
async def update_match(
    match_id: int, 
    match_update: MatchUpdate, 
    db: Session = Depends(get_db)
):
    """Update a match"""
    db_match = db.query(Match).filter(Match.id == match_id).first()
    if not db_match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Update fields
    for field, value in match_update.dict(exclude_unset=True).items():
        setattr(db_match, field, value)
    
    db.commit()
    db.refresh(db_match)
    
    return MatchResponse(
        id=db_match.id,
        home_team_id=db_match.home_team_id,
        away_team_id=db_match.away_team_id,
        home_team_name=db_match.home_team.name,
        away_team_name=db_match.away_team.name,
        league=db_match.league,
        season=db_match.season,
        match_date=db_match.match_date,
        venue=db_match.venue,
        referee=db_match.referee,
        status=db_match.status,
        home_score=db_match.home_score,
        away_score=db_match.away_score,
        home_score_ht=db_match.home_score_ht,
        away_score_ht=db_match.away_score_ht,
        result=db_match.result,
        attendance=db_match.attendance,
        weather_condition=db_match.weather_condition,
        temperature=db_match.temperature,
        home_odds=db_match.home_odds,
        draw_odds=db_match.draw_odds,
        away_odds=db_match.away_odds,
        created_at=db_match.created_at,
        updated_at=db_match.updated_at
    )

@router.delete("/{match_id}")
async def delete_match(match_id: int, db: Session = Depends(get_db)):
    """Delete a match"""
    db_match = db.query(Match).filter(Match.id == match_id).first()
    if not db_match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    db.delete(db_match)
    db.commit()
    
    return {"message": "Match deleted successfully"}
