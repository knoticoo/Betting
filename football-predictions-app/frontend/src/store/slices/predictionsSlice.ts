import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Prediction, PredictionRequest } from '../../types';
import { apiService } from '../../services/api';

interface PredictionsState {
  data: Prediction[];
  selectedPrediction?: Prediction;
  isLoading: boolean;
  error?: string;
  filters: {
    model_name?: string;
    match_id?: number;
    is_correct?: boolean;
  };
  accuracy: {
    total_predictions: number;
    correct_predictions: number;
    accuracy: number;
    model_name?: string;
    period_days: number;
  } | null;
}

const initialState: PredictionsState = {
  data: [],
  isLoading: false,
  filters: {},
  accuracy: null,
};

// Async thunks
export const fetchPredictions = createAsyncThunk(
  'predictions/fetchPredictions',
  async (params?: { model_name?: string; match_id?: number; is_correct?: boolean }) => {
    const response = await apiService.getPredictions(params);
    return response.data;
  }
);

export const fetchPrediction = createAsyncThunk(
  'predictions/fetchPrediction',
  async (id: number) => {
    const response = await apiService.getPrediction(id);
    return response.data;
  }
);

export const createPrediction = createAsyncThunk(
  'predictions/createPrediction',
  async (data: PredictionRequest) => {
    const response = await apiService.createPrediction(data);
    return response.data;
  }
);

export const fetchPredictionAccuracy = createAsyncThunk(
  'predictions/fetchPredictionAccuracy',
  async (params?: { model_name?: string; days?: number }) => {
    const response = await apiService.getPredictionAccuracy(params);
    return response.data;
  }
);

const predictionsSlice = createSlice({
  name: 'predictions',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<{ model_name?: string; match_id?: number; is_correct?: boolean }>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setSelectedPrediction: (state, action: PayloadAction<Prediction | undefined>) => {
      state.selectedPrediction = action.payload;
    },
    clearError: (state) => {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch predictions
      .addCase(fetchPredictions.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(fetchPredictions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchPredictions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Fetch single prediction
      .addCase(fetchPrediction.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(fetchPrediction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedPrediction = action.payload;
      })
      .addCase(fetchPrediction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Create prediction
      .addCase(createPrediction.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(createPrediction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data.unshift(action.payload);
      })
      .addCase(createPrediction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Fetch prediction accuracy
      .addCase(fetchPredictionAccuracy.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(fetchPredictionAccuracy.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accuracy = action.payload;
      })
      .addCase(fetchPredictionAccuracy.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { setFilters, clearFilters, setSelectedPrediction, clearError } = predictionsSlice.actions;
export default predictionsSlice.reducer;
