import React, { useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  Psychology,
  SportsSoccer,
  Groups,
  Assessment,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchMatches } from '../store/slices/matchesSlice';
import { fetchTeams } from '../store/slices/teamsSlice';
import { fetchPredictions } from '../store/slices/predictionsSlice';
import { fetchModels } from '../store/slices/modelsSlice';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: matches, isLoading: matchesLoading } = useSelector((state: RootState) => state.matches);
  const { data: teams, isLoading: teamsLoading } = useSelector((state: RootState) => state.teams);
  const { data: predictions, isLoading: predictionsLoading } = useSelector((state: RootState) => state.predictions);
  const { data: models, isLoading: modelsLoading } = useSelector((state: RootState) => state.models);

  useEffect(() => {
    dispatch(fetchMatches());
    dispatch(fetchTeams());
    dispatch(fetchPredictions());
    dispatch(fetchModels());
  }, [dispatch]);

  const stats = [
    {
      title: 'Total Matches',
      value: matches.length,
      icon: <SportsSoccer />,
      color: '#1976d2',
      loading: matchesLoading,
    },
    {
      title: 'Teams',
      value: teams.length,
      icon: <Groups />,
      color: '#2e7d32',
      loading: teamsLoading,
    },
    {
      title: 'Predictions',
      value: predictions.length,
      icon: <Psychology />,
      color: '#ed6c02',
      loading: predictionsLoading,
    },
    {
      title: 'ML Models',
      value: models.length,
      icon: <Assessment />,
      color: '#9c27b0',
      loading: modelsLoading,
    },
  ];

  const recentMatches = matches.slice(0, 5);
  const activeModels = models.filter(model => model.is_active);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome to your AI-powered football predictions dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="h6">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {stat.loading ? (
                        <LinearProgress sx={{ width: 60, height: 8, borderRadius: 4 }} />
                      ) : (
                        stat.value
                      )}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: stat.color,
                      color: 'white',
                      borderRadius: '50%',
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Matches */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Matches
            </Typography>
            {matchesLoading ? (
              <LinearProgress />
            ) : recentMatches.length > 0 ? (
              recentMatches.map((match) => (
                <Box key={match.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {match.home_team_name} vs {match.away_team_name}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      {new Date(match.match_date).toLocaleDateString()}
                    </Typography>
                    <Chip
                      label={match.status}
                      size="small"
                      color={match.status === 'finished' ? 'success' : 'default'}
                    />
                  </Box>
                  {match.result && (
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      {match.home_score} - {match.away_score}
                    </Typography>
                  )}
                </Box>
              ))
            ) : (
              <Typography color="text.secondary">No matches found</Typography>
            )}
          </Paper>
        </Grid>

        {/* Active Models */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Active ML Models
            </Typography>
            {modelsLoading ? (
              <LinearProgress />
            ) : activeModels.length > 0 ? (
              activeModels.map((model) => (
                <Box key={model.name} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {model.name}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      {model.model_type} • v{model.version}
                    </Typography>
                    <Chip
                      label={`${(model.accuracy * 100).toFixed(1)}% accuracy`}
                      size="small"
                      color="primary"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Trained: {new Date(model.training_date).toLocaleDateString()}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography color="text.secondary">No active models</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Button variant="contained" startIcon={<TrendingUp />}>
            Train New Model
          </Button>
          <Button variant="outlined" startIcon={<Psychology />}>
            Make Predictions
          </Button>
          <Button variant="outlined" startIcon={<SportsSoccer />}>
            Add Match
          </Button>
          <Button variant="outlined" startIcon={<Groups />}>
            Add Team
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard;
