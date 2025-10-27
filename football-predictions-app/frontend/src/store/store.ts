import { configureStore } from '@reduxjs/toolkit';
import matchesReducer from './slices/matchesSlice';
import teamsReducer from './slices/teamsSlice';
import predictionsReducer from './slices/predictionsSlice';
import modelsReducer from './slices/modelsSlice';

export const store = configureStore({
  reducer: {
    matches: matchesReducer,
    teams: teamsReducer,
    predictions: predictionsReducer,
    models: modelsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
