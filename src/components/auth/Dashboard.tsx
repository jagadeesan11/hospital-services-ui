import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserResponse, authService } from '../../services/authService';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

interface DashboardProps {
  user: UserResponse;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const normalizedRole = authService.normalizeUserRole(user.role);

  const getDashboardContent = () => {
    switch (normalizedRole) {
      case 'ADMIN':
        return (
          <Box>
            <Typography variant="h4" gutterBottom color="primary">
              Administrator Dashboard
            </Typography>
            <Typography variant="body1" paragraph>
              Welcome, {user.name}! You have full administrative access to the hospital management system.
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 3,
                mt: 2
              }}
            >
              <Box sx={{ flex: { xs: '1 0 100%', md: '1 0 calc(33.333% - 16px)' } }}>
                <Card>
                  <CardContent>
                    <AdminPanelSettingsIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6">System Management</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage users, roles, and system settings
                    </Typography>
                    <Button variant="contained" sx={{ mt: 2 }} fullWidth>
                      Access Admin Panel
                    </Button>
                  </CardContent>
                </Card>
              </Box>
              <Box sx={{ flex: { xs: '1 0 100%', md: '1 0 calc(33.333% - 16px)' } }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Hospital Management</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage hospitals, departments, and blocks
                    </Typography>
                    <Button variant="outlined" sx={{ mt: 2 }} fullWidth>
                      Manage Hospitals
                    </Button>
                  </CardContent>
                </Card>
              </Box>
              <Box sx={{ flex: { xs: '1 0 100%', md: '1 0 calc(33.333% - 16px)' } }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Reports & Analytics</Typography>
                    <Typography variant="body2" color="text.secondary">
                      View system reports and analytics
                    </Typography>
                    <Button variant="outlined" sx={{ mt: 2 }} fullWidth>
                      View Reports
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Box>
        );

      case 'MANAGER':
        return (
          <Box>
            <Typography variant="h4" gutterBottom color="primary">
              Manager Dashboard
            </Typography>
            <Typography variant="body1" paragraph>
              Welcome, {user.name}! You have management access to oversee hospital operations.
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 3,
                mt: 2
              }}
            >
              <Box sx={{ flex: { xs: '1 0 100%', sm: '1 0 calc(50% - 12px)', lg: '1 0 calc(33.333% - 16px)' } }}>
                <Card>
                  <CardContent>
                    <SupervisorAccountIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6">Staff Management</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage doctors, nurses, and staff schedules
                    </Typography>
                    <Button variant="contained" sx={{ mt: 2 }} fullWidth>
                      Manage Staff
                    </Button>
                  </CardContent>
                </Card>
              </Box>
              <Box sx={{ flex: { xs: '1 0 100%', sm: '1 0 calc(50% - 12px)', lg: '1 0 calc(33.333% - 16px)' } }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Appointment Oversight</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Monitor and manage patient appointments
                    </Typography>
                    <Button variant="outlined" sx={{ mt: 2 }} fullWidth>
                      View Appointments
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Box>
        );

      case 'USER':
        return (
          <Box>
            <Typography variant="h4" gutterBottom color="primary">
              User Dashboard
            </Typography>
            <Typography variant="body1" paragraph>
              Welcome, {user.name}! You can access patient and appointment management features.
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 3,
                mt: 2
              }}
            >
              <Box sx={{ flex: { xs: '1 0 100%', sm: '1 0 calc(50% - 12px)', lg: '1 0 calc(33.333% - 16px)' } }}>
                <Card>
                  <CardContent>
                    <PersonIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6">Patient Management</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage patient records and information
                    </Typography>
                    <Button variant="contained" sx={{ mt: 2 }} fullWidth>
                      Manage Patients
                    </Button>
                  </CardContent>
                </Card>
              </Box>
              <Box sx={{ flex: { xs: '1 0 100%', sm: '1 0 calc(50% - 12px)', lg: '1 0 calc(33.333% - 16px)' } }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Appointments</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Schedule and manage patient appointments
                    </Typography>
                    <Button variant="outlined" sx={{ mt: 2 }} fullWidth>
                      View Appointments
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Box>
        );

      default:
        return <Navigate to="/login" replace />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {getDashboardContent()}
    </Box>
  );
};

export default Dashboard;
