import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  LinearProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  CloudUpload,
  Description,
  TableChart,
  CheckCircle,
  Error as ErrorIcon,
  Info,
} from '@mui/icons-material';

const DataImport: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus('idle');

    // Simulate file upload
    setTimeout(() => {
      setUploading(false);
      setUploadStatus('success');
      setUploadMessage(`Successfully imported ${file.name}`);
    }, 2000);
  };

  const supportedFormats = [
    { format: 'CSV', description: 'Comma-separated values', icon: <TableChart /> },
    { format: 'JSON', description: 'JavaScript Object Notation', icon: <Description /> },
    { format: 'Excel', description: 'Microsoft Excel files', icon: <TableChart /> },
  ];

  const importSteps = [
    'Prepare your data file with match results',
    'Include columns: home_team, away_team, home_score, away_score, date, league',
    'Upload the file using the button below',
    'Review imported data in the Matches section',
    'Train ML models with the imported data',
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Data Import
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Import historical match data to train your prediction models
      </Typography>

      <Grid container spacing={3}>
        {/* Upload Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Upload Data File
            </Typography>
            
            <Box
              sx={{
                border: '2px dashed #ccc',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                mb: 3,
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Drop your file here or click to browse
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Supported formats: CSV, JSON, Excel
              </Typography>
              <input
                type="file"
                accept=".csv,.json,.xlsx,.xls"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="contained" component="span" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Choose File'}
                </Button>
              </label>
            </Box>

            {uploading && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Processing your file...
                </Typography>
              </Box>
            )}

            {uploadStatus === 'success' && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {uploadMessage}
              </Alert>
            )}

            {uploadStatus === 'error' && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {uploadMessage}
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Supported Formats */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Supported Formats
            </Typography>
            <List>
              {supportedFormats.map((format, index) => (
                <ListItem key={index}>
                  <ListItemIcon>{format.icon}</ListItemIcon>
                  <ListItemText
                    primary={format.format}
                    secondary={format.description}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Import Steps */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              How to Import Data
            </Typography>
            <List>
              {importSteps.map((step, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: 'primary.main',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {index + 1}
                      </Box>
                    </ListItemIcon>
                    <ListItemText primary={step} />
                  </ListItem>
                  {index < importSteps.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Sample Data Format */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sample Data Format
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Your CSV file should include these columns:
            </Typography>
            <Box
              component="pre"
              sx={{
                backgroundColor: 'grey.100',
                p: 2,
                borderRadius: 1,
                overflow: 'auto',
                fontSize: '0.875rem',
              }}
            >
{`home_team,away_team,home_score,away_score,date,league,season
Manchester United,Arsenal,2,1,2023-10-15,Premier League,2023-24
Barcelona,Real Madrid,1,3,2023-10-16,La Liga,2023-24
Bayern Munich,Borussia Dortmund,4,0,2023-10-17,Bundesliga,2023-24`}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DataImport;
