"""
Team API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.team import Team
from pydantic import BaseModel

router = APIRouter()

# Pydantic models for request/response
class TeamCreate(BaseModel):
    name: str
    league: str
    country: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None

class TeamUpdate(BaseModel):
    name: Optional[str] = None
    league: Optional[str] = None
    country: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None

class TeamResponse(BaseModel):
    id: int
    name: str
    league: str
    country: Optional[str]
    matches_played: int
    wins: int
    draws: int
    losses: int
    goals_for: int
    goals_against: int
    win_percentage: float
    goals_per_match: float
    goals_against_per_match: float
    description: Optional[str]
    logo_url: Optional[str]
    website: Optional[str]
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

@router.get("/", response_model=List[TeamResponse])
async def get_teams(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    league: Optional[str] = None,
    country: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get teams with optional filtering"""
    query = db.query(Team)
    
    if league:
        query = query.filter(Team.league == league)
    if country:
        query = query.filter(Team.country == country)
    
    teams = query.offset(skip).limit(limit).all()
    
    return [
        TeamResponse(
            id=team.id,
            name=team.name,
            league=team.league,
            country=team.country,
            matches_played=team.matches_played,
            wins=team.wins,
            draws=team.draws,
            losses=team.losses,
            goals_for=team.goals_for,
            goals_against=team.goals_against,
            win_percentage=team.win_percentage,
            goals_per_match=team.goals_per_match,
            goals_against_per_match=team.goals_against_per_match,
            description=team.description,
            logo_url=team.logo_url,
            website=team.website,
            created_at=team.created_at.isoformat(),
            updated_at=team.updated_at.isoformat()
        )
        for team in teams
    ]

@router.get("/{team_id}", response_model=TeamResponse)
async def get_team(team_id: int, db: Session = Depends(get_db)):
    """Get a specific team by ID"""
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    return TeamResponse(
        id=team.id,
        name=team.name,
        league=team.league,
        country=team.country,
        matches_played=team.matches_played,
        wins=team.wins,
        draws=team.draws,
        losses=team.losses,
        goals_for=team.goals_for,
        goals_against=team.goals_against,
        win_percentage=team.win_percentage,
        goals_per_match=team.goals_per_match,
        goals_against_per_match=team.goals_against_per_match,
        description=team.description,
        logo_url=team.logo_url,
        website=team.website,
        created_at=team.created_at.isoformat(),
        updated_at=team.updated_at.isoformat()
    )

@router.post("/", response_model=TeamResponse)
async def create_team(team: TeamCreate, db: Session = Depends(get_db)):
    """Create a new team"""
    # Check if team name already exists
    existing_team = db.query(Team).filter(Team.name == team.name).first()
    if existing_team:
        raise HTTPException(status_code=400, detail="Team with this name already exists")
    
    db_team = Team(**team.dict())
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    
    return TeamResponse(
        id=db_team.id,
        name=db_team.name,
        league=db_team.league,
        country=db_team.country,
        matches_played=db_team.matches_played,
        wins=db_team.wins,
        draws=db_team.draws,
        losses=db_team.losses,
        goals_for=db_team.goals_for,
        goals_against=db_team.goals_against,
        win_percentage=db_team.win_percentage,
        goals_per_match=db_team.goals_per_match,
        goals_against_per_match=db_team.goals_against_per_match,
        description=db_team.description,
        logo_url=db_team.logo_url,
        website=db_team.website,
        created_at=db_team.created_at.isoformat(),
        updated_at=db_team.updated_at.isoformat()
    )

@router.put("/{team_id}", response_model=TeamResponse)
async def update_team(
    team_id: int, 
    team_update: TeamUpdate, 
    db: Session = Depends(get_db)
):
    """Update a team"""
    db_team = db.query(Team).filter(Team.id == team_id).first()
    if not db_team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Check if new name conflicts with existing team
    if team_update.name and team_update.name != db_team.name:
        existing_team = db.query(Team).filter(Team.name == team_update.name).first()
        if existing_team:
            raise HTTPException(status_code=400, detail="Team with this name already exists")
    
    # Update fields
    for field, value in team_update.dict(exclude_unset=True).items():
        setattr(db_team, field, value)
    
    db.commit()
    db.refresh(db_team)
    
    return TeamResponse(
        id=db_team.id,
        name=db_team.name,
        league=db_team.league,
        country=db_team.country,
        matches_played=db_team.matches_played,
        wins=db_team.wins,
        draws=db_team.draws,
        losses=db_team.losses,
        goals_for=db_team.goals_for,
        goals_against=db_team.goals_against,
        win_percentage=db_team.win_percentage,
        goals_per_match=db_team.goals_per_match,
        goals_against_per_match=db_team.goals_against_per_match,
        description=db_team.description,
        logo_url=db_team.logo_url,
        website=db_team.website,
        created_at=db_team.created_at.isoformat(),
        updated_at=db_team.updated_at.isoformat()
    )

@router.delete("/{team_id}")
async def delete_team(team_id: int, db: Session = Depends(get_db)):
    """Delete a team"""
    db_team = db.query(Team).filter(Team.id == team_id).first()
    if not db_team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    db.delete(db_team)
    db.commit()
    
    return {"message": "Team deleted successfully"}
