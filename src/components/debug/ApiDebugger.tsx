import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { checkServiceHealth, apiConfig } from '../../services/api';

const ApiDebugger: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<Record<string, boolean>>({});
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkHealth = async () => {
    setIsChecking(true);
    try {
      const status = await checkServiceHealth();
      setHealthStatus(status);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Auto-check on component mount
    checkHealth();
  }, []);

  const getStatusColor = (isHealthy: boolean) => {
    return isHealthy ? 'success' : 'error';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        API Service Health Monitor
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        This tool helps debug backend API connectivity issues. Check if your backend services are running on the configured ports.
      </Alert>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          onClick={checkHealth}
          disabled={isChecking}
          startIcon={isChecking ? <CircularProgress size={20} /> : null}
        >
          {isChecking ? 'Checking...' : 'Check Service Health'}
        </Button>
        {lastCheck && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Last checked: {lastCheck.toLocaleTimeString()}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {Object.entries(apiConfig).map(([serviceName, url]) => (
          <Card key={serviceName} sx={{ minWidth: 300 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">
                  {serviceName.replace('_SERVICE', '')}
                </Typography>
                <Chip
                  label={healthStatus[serviceName] ? 'Healthy' : 'Unavailable'}
                  color={getStatusColor(healthStatus[serviceName])}
                  size="small"
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                {url}
              </Typography>
              {!healthStatus[serviceName] && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  Service not responding. Make sure the backend is running on this port.
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current Environment Configuration:
        </Typography>
        <Typography variant="body2">
          Environment: {process.env.NODE_ENV || 'development'}
        </Typography>
        <Typography variant="body2">
          Custom Environment: {process.env.REACT_APP_ENV || 'not set'}
        </Typography>
      </Box>
    </Box>
  );
};

export default ApiDebugger;
