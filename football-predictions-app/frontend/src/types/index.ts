// API Response Types
export interface Match {
  id: number;
  home_team_id: number;
  away_team_id: number;
  home_team_name: string;
  away_team_name: string;
  league: string;
  season: string;
  match_date: string;
  venue?: string;
  referee?: string;
  status: string;
  home_score?: number;
  away_score?: number;
  home_score_ht?: number;
  away_score_ht?: number;
  result?: string;
  attendance?: number;
  weather_condition?: string;
  temperature?: number;
  home_odds?: number;
  draw_odds?: number;
  away_odds?: number;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: number;
  name: string;
  league: string;
  country?: string;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  win_percentage: number;
  goals_per_match: number;
  goals_against_per_match: number;
  description?: string;
  logo_url?: string;
  website?: string;
  created_at: string;
  updated_at: string;
}

export interface Prediction {
  id: number;
  match_id: number;
  home_team_name: string;
  away_team_name: string;
  match_date: string;
  model_name: string;
  model_version: string;
  predicted_outcome: string;
  predicted_home_score?: number;
  predicted_away_score?: number;
  home_win_probability: number;
  draw_probability: number;
  away_win_probability: number;
  overall_confidence: number;
  is_correct?: boolean;
  actual_outcome?: string;
  actual_home_score?: number;
  actual_away_score?: number;
  created_at: string;
}

export interface ModelInfo {
  name: string;
  version: string;
  model_type: string;
  accuracy: number;
  is_active: boolean;
  is_best_model: boolean;
  training_date: string;
  training_samples: number;
}

export interface ModelPerformance {
  model_name: string;
  model_version: string;
  accuracy: number;
  precision: {
    home: number;
    draw: number;
    away: number;
  };
  recall: {
    home: number;
    draw: number;
    away: number;
  };
  f1_score: {
    home: number;
    draw: number;
    away: number;
  };
  additional_metrics: {
    log_loss?: number;
    brier_score?: number;
    calibration_error?: number;
  };
  training_info: {
    training_samples: number;
    validation_samples: number;
    test_samples: number;
    training_duration_seconds: number;
    training_date: string;
  };
  is_active: boolean;
  is_best_model: boolean;
}

// API Request Types
export interface MatchCreate {
  home_team_id: number;
  away_team_id: number;
  league: string;
  season: string;
  match_date: string;
  venue?: string;
  referee?: string;
  home_odds?: number;
  draw_odds?: number;
  away_odds?: number;
}

export interface TeamCreate {
  name: string;
  league: string;
  country?: string;
  description?: string;
  logo_url?: string;
  website?: string;
}

export interface TrainingRequest {
  model_name: string;
  model_type: string;
  league?: string;
  season?: string;
  test_size: number;
  random_state: number;
  hyperparameters?: Record<string, any>;
}

export interface PredictionRequest {
  match_id: number;
  model_name: string;
  model_version?: string;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface ApiState<T> extends LoadingState {
  data: T[];
  selectedItem?: T;
}

// Chart Data Types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface PredictionAccuracy {
  total_predictions: number;
  correct_predictions: number;
  accuracy: number;
  model_name?: string;
  period_days: number;
}
