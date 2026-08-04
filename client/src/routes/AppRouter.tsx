import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DataTableDemo from '@/pages/DataTableDemo';

/**
 * Enterprise Application Router Component (Module 4 - Step 4.2).
 *
 * Routing entry point mapping paths to layouts and page modules.
 */
export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Homepage route containing navigation link to Demo */}
      <Route
        path="/"
        element={
          <Container maxWidth="md" sx={{ py: 8 }}>
            <Stack spacing={4} alignItems="center" textAlign="center">
              <Box>
                <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                  Enterprise React Frontend
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  React Router v7 Infrastructure Layer
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="center"
                  flexWrap="wrap"
                  gap={1}
                  sx={{ mb: 4 }}
                >
                  <Chip label="BrowserRouter Initialized ✅" color="primary" variant="outlined" />
                  <Chip label="RouteProvider Composed ✅" color="success" variant="outlined" />
                  <Chip label="Routing Initialized ✅" color="info" variant="outlined" />
                </Stack>

                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/demo/table"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                >
                  View Data Table Demo
                </Button>
              </Box>

              <Alert severity="info" variant="filled" sx={{ width: '100%' }}>
                React Router infrastructure initialized successfully inside AppProviders hierarchy.
              </Alert>
            </Stack>
          </Container>
        }
      />

      {/* Demo Page route */}
      <Route path="/demo/table" element={<DataTableDemo />} />

      {/* Fallback route */}
      <Route
        path="*"
        element={
          <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
              404 — Page Not Found
            </Typography>
            <Button variant="contained" component={Link} to="/">
              Return Home
            </Button>
          </Container>
        }
      />
    </Routes>
  );
};

export default AppRouter;
