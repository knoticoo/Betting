import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Match, MatchCreate } from '../../types';
import { apiService } from '../../services/api';

interface MatchesState {
  data: Match[];
  selectedMatch?: Match;
  isLoading: boolean;
  error?: string;
  filters: {
    league?: string;
    season?: string;
    status?: string;
  };
}

const initialState: MatchesState = {
  data: [],
  isLoading: false,
  filters: {},
};

// Async thunks
export const fetchMatches = createAsyncThunk(
  'matches/fetchMatches',
  async (params?: { league?: string; season?: string; status?: string }) => {
    const response = await apiService.getMatches(params);
    return response.data;
  }
);

export const fetchMatch = createAsyncThunk(
  'matches/fetchMatch',
  async (id: number) => {
    const response = await apiService.getMatch(id);
    return response.data;
  }
);

export const createMatch = createAsyncThunk(
  'matches/createMatch',
  async (matchData: MatchCreate) => {
    const response = await apiService.createMatch(matchData);
    return response.data;
  }
);

export const updateMatch = createAsyncThunk(
  'matches/updateMatch',
  async ({ id, data }: { id: number; data: Partial<Match> }) => {
    const response = await apiService.updateMatch(id, data);
    return response.data;
  }
);

export const deleteMatch = createAsyncThunk(
  'matches/deleteMatch',
  async (id: number) => {
    await apiService.deleteMatch(id);
    return id;
  }
);

const matchesSlice = createSlice({
  name: 'matches',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<{ league?: string; season?: string; status?: string }>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setSelectedMatch: (state, action: PayloadAction<Match | undefined>) => {
      state.selectedMatch = action.payload;
    },
    clearError: (state) => {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch matches
      .addCase(fetchMatches.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Fetch single match
      .addCase(fetchMatch.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(fetchMatch.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedMatch = action.payload;
      })
      .addCase(fetchMatch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Create match
      .addCase(createMatch.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(createMatch.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data.unshift(action.payload);
      })
      .addCase(createMatch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Update match
      .addCase(updateMatch.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(updateMatch.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.data.findIndex(match => match.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
        if (state.selectedMatch?.id === action.payload.id) {
          state.selectedMatch = action.payload;
        }
      })
      .addCase(updateMatch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Delete match
      .addCase(deleteMatch.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(deleteMatch.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = state.data.filter(match => match.id !== action.payload);
        if (state.selectedMatch?.id === action.payload) {
          state.selectedMatch = undefined;
        }
      })
      .addCase(deleteMatch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { setFilters, clearFilters, setSelectedMatch, clearError } = matchesSlice.actions;
export default matchesSlice.reducer;
