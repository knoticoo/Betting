import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ModelInfo, ModelPerformance, TrainingRequest, PredictionRequest } from '../../types';
import { apiService } from '../../services/api';

interface ModelsState {
  data: ModelInfo[];
  selectedModel?: ModelInfo;
  modelPerformance?: ModelPerformance;
  isLoading: boolean;
  error?: string;
  trainingStatus: {
    [modelName: string]: {
      status: 'idle' | 'training' | 'completed' | 'error';
      message?: string;
    };
  };
}

const initialState: ModelsState = {
  data: [],
  isLoading: false,
  trainingStatus: {},
};

// Async thunks
export const fetchModels = createAsyncThunk(
  'models/fetchModels',
  async () => {
    const response = await apiService.getModels();
    return response.data;
  }
);

export const fetchModelPerformance = createAsyncThunk(
  'models/fetchModelPerformance',
  async (modelName: string) => {
    const response = await apiService.getModelPerformance(modelName);
    return response.data;
  }
);

export const trainModel = createAsyncThunk(
  'models/trainModel',
  async (data: TrainingRequest) => {
    const response = await apiService.trainModel(data);
    return { modelName: data.model_name, response: response.data };
  }
);

export const checkTrainingStatus = createAsyncThunk(
  'models/checkTrainingStatus',
  async (modelName: string) => {
    const response = await apiService.getTrainingStatus(modelName);
    return { modelName, status: response.data };
  }
);

export const predictMatch = createAsyncThunk(
  'models/predictMatch',
  async (data: PredictionRequest) => {
    const response = await apiService.predictMatch(data);
    return response.data;
  }
);

export const activateModel = createAsyncThunk(
  'models/activateModel',
  async (modelName: string) => {
    const response = await apiService.activateModel(modelName);
    return { modelName, response: response.data };
  }
);

export const deleteModel = createAsyncThunk(
  'models/deleteModel',
  async (modelName: string) => {
    await apiService.deleteModel(modelName);
    return modelName;
  }
);

const modelsSlice = createSlice({
  name: 'models',
  initialState,
  reducers: {
    setSelectedModel: (state, action: PayloadAction<ModelInfo | undefined>) => {
      state.selectedModel = action.payload;
    },
    clearError: (state) => {
      state.error = undefined;
    },
    clearTrainingStatus: (state, action: PayloadAction<string>) => {
      delete state.trainingStatus[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch models
      .addCase(fetchModels.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(fetchModels.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchModels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Fetch model performance
      .addCase(fetchModelPerformance.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(fetchModelPerformance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.modelPerformance = action.payload;
      })
      .addCase(fetchModelPerformance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Train model
      .addCase(trainModel.pending, (state, action) => {
        state.isLoading = true;
        state.error = undefined;
        state.trainingStatus[action.meta.arg.model_name] = {
          status: 'training',
          message: 'Training started...'
        };
      })
      .addCase(trainModel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trainingStatus[action.payload.modelName] = {
          status: 'completed',
          message: 'Training completed successfully'
        };
      })
      .addCase(trainModel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
        state.trainingStatus[action.meta.arg.model_name] = {
          status: 'error',
          message: action.error.message
        };
      })
      // Check training status
      .addCase(checkTrainingStatus.fulfilled, (state, action) => {
        const { modelName, status } = action.payload;
        state.trainingStatus[modelName] = {
          status: status.status === 'completed' ? 'completed' : 'training',
          message: status.message || status.status
        };
      })
      // Predict match
      .addCase(predictMatch.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(predictMatch.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(predictMatch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Activate model
      .addCase(activateModel.fulfilled, (state, action) => {
        // Update the model's active status in the data array
        const modelIndex = state.data.findIndex(model => model.name === action.payload.modelName);
        if (modelIndex !== -1) {
          state.data[modelIndex].is_active = true;
        }
      })
      // Delete model
      .addCase(deleteModel.fulfilled, (state, action) => {
        state.data = state.data.filter(model => model.name !== action.payload);
        if (state.selectedModel?.name === action.payload) {
          state.selectedModel = undefined;
        }
      });
  },
});

export const { setSelectedModel, clearError, clearTrainingStatus } = modelsSlice.actions;
export default modelsSlice.reducer;
