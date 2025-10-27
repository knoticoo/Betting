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
  IconButton,
  LinearProgress,
  Chip,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchTeams } from '../store/slices/teamsSlice';

const Teams: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: teams, isLoading, error } = useSelector((state: RootState) => state.teams);

  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

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
        <Typography variant="h4">Teams</Typography>
        <Button variant="contained" startIcon={<Add />}>
          Add Team
        </Button>
      </Box>

      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {/* Team Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Teams
              </Typography>
              <Typography variant="h4">
                {teams.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Leagues
              </Typography>
              <Typography variant="h4">
                {new Set(teams.map(t => t.league)).size}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Countries
              </Typography>
              <Typography variant="h4">
                {new Set(teams.map(t => t.country).filter(Boolean)).size}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Avg Win Rate
              </Typography>
              <Typography variant="h4">
                {teams.length > 0 ? 
                  (teams.reduce((sum, team) => sum + team.win_percentage, 0) / teams.length * 100).toFixed(1) + '%' 
                  : '0%'
                }
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
                <TableCell>Team</TableCell>
                <TableCell>League</TableCell>
                <TableCell>Country</TableCell>
                <TableCell>Matches</TableCell>
                <TableCell>Win Rate</TableCell>
                <TableCell>Goals/Match</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {team.name}
                    </Typography>
                    {team.description && (
                      <Typography variant="body2" color="text.secondary">
                        {team.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip label={team.league} size="small" color="primary" />
                  </TableCell>
                  <TableCell>{team.country || '-'}</TableCell>
                  <TableCell>{team.matches_played}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {(team.win_percentage * 100).toFixed(1)}%
                      </Typography>
                      <Box sx={{ width: 60, height: 8, bgcolor: 'grey.200', borderRadius: 1 }}>
                        <Box 
                          sx={{ 
                            width: `${team.win_percentage * 100}%`, 
                            height: '100%', 
                            bgcolor: 'primary.main',
                            borderRadius: 1
                          }} 
                        />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {team.goals_per_match.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <Visibility />
                    </IconButton>
                    <IconButton size="small">
                      <Edit />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <Delete />
                    </IconButton>
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

export default Teams;
