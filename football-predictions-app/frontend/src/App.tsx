import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Matches from './pages/Matches';
import Teams from './pages/Teams';
import Predictions from './pages/Predictions';
import MLModels from './pages/MLModels';
import DataImport from './pages/DataImport';

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/ml-models" element={<MLModels />} />
          <Route path="/data-import" element={<DataImport />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
