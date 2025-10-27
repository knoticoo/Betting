"""
Feature engineering for football match predictions
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

class FeatureEngineer:
    """Feature engineering for football match data"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_features(self, matches_df: pd.DataFrame) -> pd.DataFrame:
        """Create comprehensive features for model training"""
        df = matches_df.copy()
        
        # Basic match features
        df = self._add_basic_features(df)
        
        # Team form features
        df = self._add_form_features(df)
        
        # Head-to-head features
        df = self._add_h2h_features(df)
        
        # Seasonal features
        df = self._add_seasonal_features(df)
        
        # Statistical features
        df = self._add_statistical_features(df)
        
        # Time-based features
        df = self._add_time_features(df)
        
        return df
    
    def _add_basic_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add basic match features"""
        # Home advantage
        df['is_home'] = 1  # All matches are from home team perspective
        
        # Match importance (based on league)
        league_importance = {
            'Premier League': 5, 'La Liga': 5, 'Bundesliga': 5, 'Serie A': 5, 'Ligue 1': 5,
            'Champions League': 6, 'Europa League': 4, 'Championship': 3, 'League One': 2
        }
        df['league_importance'] = df['league'].map(league_importance).fillna(3)
        
        return df
    
    def _add_form_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add team form features (last 5, 10 matches)"""
        # This would be implemented with actual data
        # For now, adding placeholder features
        df['home_form_5'] = 0.5
        df['away_form_5'] = 0.5
        df['home_form_10'] = 0.5
        df['away_form_10'] = 0.5
        
        return df
    
    def _add_h2h_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add head-to-head features"""
        # Placeholder for H2H features
        df['h2h_home_wins'] = 0
        df['h2h_away_wins'] = 0
        df['h2h_draws'] = 0
        df['h2h_goals_home'] = 0
        df['h2h_goals_away'] = 0
        
        return df
    
    def _add_seasonal_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add seasonal features"""
        # Season progress (0-1)
        df['season_progress'] = 0.5  # Placeholder
        
        # Days since last match
        df['days_since_last_match_home'] = 7
        df['days_since_last_match_away'] = 7
        
        return df
    
    def _add_statistical_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add statistical features"""
        # Goals per match
        df['home_goals_per_match'] = 1.5
        df['away_goals_per_match'] = 1.5
        
        # Goals against per match
        df['home_goals_against_per_match'] = 1.2
        df['away_goals_against_per_match'] = 1.2
        
        # Win percentage
        df['home_win_percentage'] = 0.4
        df['away_win_percentage'] = 0.4
        
        return df
    
    def _add_time_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add time-based features"""
        if 'match_date' in df.columns:
            df['match_date'] = pd.to_datetime(df['match_date'])
            df['day_of_week'] = df['match_date'].dt.dayofweek
            df['month'] = df['match_date'].dt.month
            df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        
        return df
    
    def get_feature_columns(self) -> List[str]:
        """Get list of feature columns for model training"""
        return [
            'is_home', 'league_importance', 'home_form_5', 'away_form_5',
            'home_form_10', 'away_form_10', 'h2h_home_wins', 'h2h_away_wins',
            'h2h_draws', 'h2h_goals_home', 'h2h_goals_away', 'season_progress',
            'days_since_last_match_home', 'days_since_last_match_away',
            'home_goals_per_match', 'away_goals_per_match',
            'home_goals_against_per_match', 'away_goals_against_per_match',
            'home_win_percentage', 'away_win_percentage', 'day_of_week',
            'month', 'is_weekend'
        ]
    
    def prepare_training_data(self, matches_df: pd.DataFrame) -> tuple:
        """Prepare data for model training"""
        # Create features
        df_with_features = self.create_features(matches_df)
        
        # Get feature columns
        feature_columns = self.get_feature_columns()
        
        # Prepare X and y
        X = df_with_features[feature_columns].fillna(0)
        
        # Create target variable (H/A/D)
        y = df_with_features['result'].map({'H': 0, 'A': 1, 'D': 2})
        
        return X, y, feature_columns
