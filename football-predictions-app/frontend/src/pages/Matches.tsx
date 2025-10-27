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
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchMatches } from '../store/slices/matchesSlice';

const Matches: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: matches, isLoading, error } = useSelector((state: RootState) => state.matches);

  useEffect(() => {
    dispatch(fetchMatches());
  }, [dispatch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finished':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'scheduled':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
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
        <Typography variant="h4">Matches</Typography>
        <Button variant="contained" startIcon={<Add />}>
          Add Match
        </Button>
      </Box>

      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Match</TableCell>
                <TableCell>League</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Result</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {matches.map((match) => (
                <TableRow key={match.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {match.home_team_name} vs {match.away_team_name}
                    </Typography>
                    {match.venue && (
                      <Typography variant="body2" color="text.secondary">
                        {match.venue}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{match.league}</TableCell>
                  <TableCell>
                    {new Date(match.match_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={match.status}
                      color={getStatusColor(match.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {match.result ? (
                      <Typography variant="h6">
                        {match.home_score} - {match.away_score}
                      </Typography>
                    ) : (
                      <Typography color="text.secondary">-</Typography>
                    )}
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

export default Matches;
