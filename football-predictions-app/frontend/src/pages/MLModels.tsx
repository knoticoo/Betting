import React, { useEffect, useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { 
  Add, 
  PlayArrow, 
  Stop, 
  Delete, 
  Visibility, 
  CheckCircle,
  Error as ErrorIcon,
  SmartToy 
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { 
  fetchModels, 
  trainModel, 
  activateModel, 
  deleteModel,
  checkTrainingStatus 
} from '../store/slices/modelsSlice';

const MLModels: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: models, isLoading, error, trainingStatus } = useSelector((state: RootState) => state.models);
  
  const [trainDialogOpen, setTrainDialogOpen] = useState(false);
  const [trainingForm, setTrainingForm] = useState({
    model_name: '',
    model_type: 'random_forest',
    league: '',
    season: '',
    test_size: 0.2,
    random_state: 42,
  });

  useEffect(() => {
    dispatch(fetchModels());
  }, [dispatch]);

  const handleTrainModel = () => {
    dispatch(trainModel(trainingForm));
    setTrainDialogOpen(false);
    setTrainingForm({
      model_name: '',
      model_type: 'random_forest',
      league: '',
      season: '',
      test_size: 0.2,
      random_state: 42,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'training':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle />;
      case 'training':
        return <LinearProgress size={20} />;
      case 'error':
        return <ErrorIcon />;
      default:
        return null;
    }
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
        <Typography variant="h4">ML Models</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => setTrainDialogOpen(true)}
        >
          Train New Model
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Model Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Models
              </Typography>
              <Typography variant="h4">
                {models.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Active Models
              </Typography>
              <Typography variant="h4">
                {models.filter(m => m.is_active).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Best Model
                  </Typography>
                  <Typography variant="h4">
                    {models.filter(m => m.is_best_model).length > 0 ? 
                      `${(Math.max(...models.map(m => m.accuracy)) * 100).toFixed(1)}%` : 
                      'N/A'
                    }
                  </Typography>
                </CardContent>
              </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Model Types
              </Typography>
              <Typography variant="h4">
                {new Set(models.map(m => m.model_type)).size}
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
                <TableCell>Model</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Accuracy</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Training Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.name} hover>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {model.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      v{model.version}
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      {model.is_active && (
                        <Chip label="Active" size="small" color="success" sx={{ mr: 1 }} />
                      )}
                      {model.is_best_model && (
                        <Chip label="Best" size="small" color="primary" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={model.model_type} size="small" />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {(model.accuracy * 100).toFixed(1)}%
                      </Typography>
                      <Box sx={{ width: 60, height: 8, bgcolor: 'grey.200', borderRadius: 1 }}>
                        <Box 
                          sx={{ 
                            width: `${model.accuracy * 100}%`, 
                            height: '100%', 
                            bgcolor: model.accuracy > 0.6 ? 'success.main' : 
                                    model.accuracy > 0.5 ? 'warning.main' : 'error.main',
                            borderRadius: 1
                          }} 
                        />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {trainingStatus[model.name] ? (
                      <Box display="flex" alignItems="center">
                        {getStatusIcon(trainingStatus[model.name].status)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {trainingStatus[model.name].message}
                        </Typography>
                      </Box>
                    ) : (
                      <Chip 
                        label={model.is_active ? 'Ready' : 'Inactive'} 
                        color={model.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(model.training_date).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small"
                      onClick={() => dispatch(activateModel(model.name))}
                      disabled={model.is_active}
                    >
                      <PlayArrow />
                    </IconButton>
                    <IconButton size="small">
                      <Visibility />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => dispatch(deleteModel(model.name))}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Train Model Dialog */}
      <Dialog open={trainDialogOpen} onClose={() => setTrainDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Train New Model</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Model Name"
              value={trainingForm.model_name}
              onChange={(e) => setTrainingForm({...trainingForm, model_name: e.target.value})}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Model Type</InputLabel>
              <Select
                value={trainingForm.model_type}
                onChange={(e) => setTrainingForm({...trainingForm, model_type: e.target.value})}
              >
                <MenuItem value="random_forest">Random Forest</MenuItem>
                <MenuItem value="xgboost">XGBoost</MenuItem>
                <MenuItem value="logistic_regression">Logistic Regression</MenuItem>
                <MenuItem value="neural_network">Neural Network</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="League (optional)"
              value={trainingForm.league}
              onChange={(e) => setTrainingForm({...trainingForm, league: e.target.value})}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Season (optional)"
              value={trainingForm.season}
              onChange={(e) => setTrainingForm({...trainingForm, season: e.target.value})}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Test Size"
              type="number"
              value={trainingForm.test_size}
              onChange={(e) => setTrainingForm({...trainingForm, test_size: parseFloat(e.target.value)})}
              inputProps={{ min: 0.1, max: 0.5, step: 0.1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTrainDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleTrainModel} 
            variant="contained"
            disabled={!trainingForm.model_name}
          >
            Train Model
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MLModels;
