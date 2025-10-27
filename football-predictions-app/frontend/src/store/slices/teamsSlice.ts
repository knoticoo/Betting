import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Team, TeamCreate } from '../../types';
import { apiService } from '../../services/api';

interface TeamsState {
  data: Team[];
  selectedTeam?: Team;
  isLoading: boolean;
  error?: string;
  filters: {
    league?: string;
    country?: string;
  };
}

const initialState: TeamsState = {
  data: [],
  isLoading: false,
  filters: {},
};

// Async thunks
export const fetchTeams = createAsyncThunk(
  'teams/fetchTeams',
  async (params?: { league?: string; country?: string }) => {
    const response = await apiService.getTeams(params);
    return response.data;
  }
);

export const fetchTeam = createAsyncThunk(
  'teams/fetchTeam',
  async (id: number) => {
    const response = await apiService.getTeam(id);
    return response.data;
  }
);

export const createTeam = createAsyncThunk(
  'teams/createTeam',
  async (teamData: TeamCreate) => {
    const response = await apiService.createTeam(teamData);
    return response.data;
  }
);

export const updateTeam = createAsyncThunk(
  'teams/updateTeam',
  async ({ id, data }: { id: number; data: Partial<Team> }) => {
    const response = await apiService.updateTeam(id, data);
    return response.data;
  }
);

export const deleteTeam = createAsyncThunk(
  'teams/deleteTeam',
  async (id: number) => {
    await apiService.deleteTeam(id);
    return id;
  }
);

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<{ league?: string; country?: string }>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setSelectedTeam: (state, action: PayloadAction<Team | undefined>) => {
      state.selectedTeam = action.payload;
    },
    clearError: (state) => {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch teams
      .addCase(fetchTeams.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Fetch single team
      .addCase(fetchTeam.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(fetchTeam.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedTeam = action.payload;
      })
      .addCase(fetchTeam.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Create team
      .addCase(createTeam.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data.unshift(action.payload);
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Update team
      .addCase(updateTeam.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(updateTeam.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.data.findIndex(team => team.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
        if (state.selectedTeam?.id === action.payload.id) {
          state.selectedTeam = action.payload;
        }
      })
      .addCase(updateTeam.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Delete team
      .addCase(deleteTeam.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = state.data.filter(team => team.id !== action.payload);
        if (state.selectedTeam?.id === action.payload) {
          state.selectedTeam = undefined;
        }
      })
      .addCase(deleteTeam.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { setFilters, clearFilters, setSelectedTeam, clearError } = teamsSlice.actions;
export default teamsSlice.reducer;
