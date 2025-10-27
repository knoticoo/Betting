import axios from 'axios';
import { Match, Team, Prediction, ModelInfo, MatchCreate, TeamCreate, TrainingRequest, PredictionRequest } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Matches
  getMatches: (params?: { league?: string; season?: string; status?: string }) =>
    api.get<Match[]>('/matches', { params }),
  
  getMatch: (id: number) =>
    api.get<Match>(`/matches/${id}`),
  
  createMatch: (data: MatchCreate) =>
    api.post<Match>('/matches', data),
  
  updateMatch: (id: number, data: Partial<Match>) =>
    api.put<Match>(`/matches/${id}`, data),
  
  deleteMatch: (id: number) =>
    api.delete(`/matches/${id}`),

  // Teams
  getTeams: (params?: { league?: string; country?: string }) =>
    api.get<Team[]>('/teams', { params }),
  
  getTeam: (id: number) =>
    api.get<Team>(`/teams/${id}`),
  
  createTeam: (data: TeamCreate) =>
    api.post<Team>('/teams', data),
  
  updateTeam: (id: number, data: Partial<Team>) =>
    api.put<Team>(`/teams/${id}`, data),
  
  deleteTeam: (id: number) =>
    api.delete(`/teams/${id}`),

  // Predictions
  getPredictions: (params?: { model_name?: string; match_id?: number; is_correct?: boolean }) =>
    api.get<Prediction[]>('/predictions', { params }),
  
  getPrediction: (id: number) =>
    api.get<Prediction>(`/predictions/${id}`),
  
  createPrediction: (data: PredictionRequest) =>
    api.post<Prediction>('/predictions', data),
  
  getPredictionAccuracy: (params?: { model_name?: string; days?: number }) =>
    api.get('/predictions/stats/accuracy', { params }),

  // ML Models
  getModels: () =>
    api.get<ModelInfo[]>('/ml/models'),
  
  getModelPerformance: (modelName: string) =>
    api.get(`/ml/models/${modelName}/performance`),
  
  trainModel: (data: TrainingRequest) =>
    api.post('/ml/train', data),
  
  getTrainingStatus: (modelName: string) =>
    api.get(`/ml/train/status/${modelName}`),
  
  predictMatch: (data: PredictionRequest) =>
    api.post('/ml/predict', data),
  
  predictMatchesBatch: (data: { match_ids: number[]; model_name: string; model_version?: string }) =>
    api.post('/ml/predict/batch', data),
  
  getFeatureImportance: (modelName: string) =>
    api.get(`/ml/features/importance/${modelName}`),
  
  activateModel: (modelName: string) =>
    api.post(`/ml/models/${modelName}/activate`),
  
  deleteModel: (modelName: string) =>
    api.delete(`/ml/models/${modelName}`),
};

export default api;
