import React, { useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { Psychology, TrendingUp, CheckCircle, Cancel } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchPredictions, fetchPredictionAccuracy } from '../store/slices/predictionsSlice';

const Predictions: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: predictions, isLoading, error, accuracy } = useSelector((state: RootState) => state.predictions);

  useEffect(() => {
    dispatch(fetchPredictions());
    dispatch(fetchPredictionAccuracy());
  }, [dispatch]);

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'H':
        return 'success';
      case 'A':
        return 'error';
      case 'D':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getOutcomeLabel = (outcome: string) => {
    switch (outcome) {
      case 'H':
        return 'Home Win';
      case 'A':
        return 'Away Win';
      case 'D':
        return 'Draw';
      default:
        return outcome;
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.6) return 'success';
    if (accuracy >= 0.5) return 'warning';
    return 'error';
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h4">Predictions</Typography>
        <Button variant="contained" startIcon={<Psychology />}>
          Make Prediction
        </Button>
      </Box>

      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {/* Prediction Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Predictions
              </Typography>
              <Typography variant="h4">
                {predictions.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Accuracy
              </Typography>
              <Typography variant="h4" color={getAccuracyColor(accuracy?.accuracy || 0)}>
                {accuracy ? `${(accuracy.accuracy * 100).toFixed(1)}%` : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Correct Predictions
              </Typography>
              <Typography variant="h4">
                {accuracy?.correct_predictions || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Models Used
              </Typography>
              <Typography variant="h4">
                {new Set(predictions.map(p => p.model_name)).size}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Match</TableCell>
                <TableCell>Prediction</TableCell>
                <TableCell>Confidence</TableCell>
                <TableCell>Model</TableCell>
                <TableCell>Result</TableCell>
                <TableCell>Correct</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {predictions.map((prediction) => (
                <TableRow key={prediction.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {prediction.home_team_name} vs {prediction.away_team_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(prediction.match_date).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Chip
                        label={getOutcomeLabel(prediction.predicted_outcome)}
                        color={getOutcomeColor(prediction.predicted_outcome) as any}
                        size="small"
                      />
                      {prediction.predicted_home_score !== null && prediction.predicted_away_score !== null && (
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {prediction.predicted_home_score} - {prediction.predicted_away_score}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {(prediction.overall_confidence * 100).toFixed(1)}%
                      </Typography>
                      <Box sx={{ width: 60, height: 8, bgcolor: 'grey.200', borderRadius: 1 }}>
                        <Box 
                          sx={{ 
                            width: `${prediction.overall_confidence * 100}%`, 
                            height: '100%', 
                            bgcolor: prediction.overall_confidence > 0.7 ? 'success.main' : 
                                    prediction.overall_confidence > 0.5 ? 'warning.main' : 'error.main',
                            borderRadius: 1
                          }} 
                        />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {prediction.model_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      v{prediction.model_version}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {prediction.actual_outcome ? (
                      <Chip
                        label={getOutcomeLabel(prediction.actual_outcome)}
                        color={getOutcomeColor(prediction.actual_outcome) as any}
                        size="small"
                      />
                    ) : (
                      <Typography color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {prediction.is_correct !== null ? (
                      prediction.is_correct ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Cancel color="error" />
                      )
                    ) : (
                      <CircularProgress size={20} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(prediction.created_at).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default Predictions;
