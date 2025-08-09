import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  Container,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
  Avatar,
  Divider
} from '@mui/material';
import {
  AdminPanelSettings as AdminPanelSettingsIcon,
  LocalHospital as LocalHospitalIcon,
  ViewModule as ViewModuleIcon,
  MedicalServices as MedicalServicesIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import Home from './components/home/Home';
import Dashboard from './components/auth/Dashboard';
import LoginForm from './components/auth/LoginForm';
import HospitalList from './components/hospitals/HospitalList';
import BlockList from './components/blocks/BlockList';
import DepartmentList from './components/departments/DepartmentList';
import DoctorList from './components/doctors/DoctorList';
import PatientList from './components/patients/PatientList';
import AppointmentList from './components/appointments/AppointmentList';
import BillingList from './components/billing/BillingList';
import ServiceCatalogList from './components/serviceCatalog/ServiceCatalogList';
import ApiDebugger from './components/debug/ApiDebugger';
import NavigationDebugger from './components/debug/NavigationDebugger';
import { authService, UserResponse } from './services/authService';
import chettinadLogo from './assets/chettinad-logo.svg';
import './App.css';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  user: UserResponse | null;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles, user }) => {
  const normalizedRole = user ? authService.normalizeUserRole(user.role) : 'none';

  console.log('🛡️ ProtectedRoute check:', {
    userExists: !!user,
    userRole: user?.role || 'none',
    normalizedRole: normalizedRole,
    requiredRoles: requiredRoles || 'none',
    hasRequiredRole: requiredRoles ? requiredRoles.includes(normalizedRole) : 'no role check',
    willRenderChildren: !!user && (!requiredRoles || requiredRoles.includes(normalizedRole))
  });

  if (!user) {
    console.log('🚫 ProtectedRoute: No user - redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !requiredRoles.includes(normalizedRole)) {
    console.log('🚫 ProtectedRoute: Insufficient role - redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('✅ ProtectedRoute: Access granted - rendering children');
  return <>{children}</>;
};

function App() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const storedUser = authService.getStoredUser();
    if (storedUser && authService.isAuthenticated()) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (userData: UserResponse) => {
    setUser(userData);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setAnchorEl(null);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Helper function to check roles
  const hasRole = (user: UserResponse | null, roles: string[]): boolean => {
    if (!user) return false;
    const normalizedRole = authService.normalizeUserRole(user.role);
    return roles.includes(normalizedRole);
  };

  // If not authenticated, show login form
  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm onLoginSuccess={handleLoginSuccess} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  const normalizedRole = authService.normalizeUserRole(user.role);

  // Authenticated user interface
  return (
    <Router>
      <AppBar position="static">
        <Toolbar sx={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <img
                src={chettinadLogo}
                alt="Chettinad Hospital"
                style={{ height: '40px', marginRight: '16px' }}
              />
            </Box>
          </Link>

          <Box sx={{ flexGrow: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              color="inherit"
              component={Link}
              to="/"
              startIcon={<DashboardIcon />}
            >
              Home
            </Button>

            <Button
              color="inherit"
              component={Link}
              to="/dashboard"
              startIcon={<DashboardIcon />}
            >
              Dashboard
            </Button>

            {(normalizedRole === 'ADMIN' || normalizedRole === 'MANAGER') && (
              <Button
                color="inherit"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                startIcon={<AdminPanelSettingsIcon />}
              >
                Management
              </Button>
            )}

            {(normalizedRole === 'ADMIN' || normalizedRole === 'USER') && (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  to="/patients"
                  startIcon={<PersonIcon />}
                >
                  Patients
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/appointments"
                  startIcon={<MedicalServicesIcon />}
                >
                  Appointments
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/billing"
                  startIcon={<ReceiptIcon />}
                >
                  Billing
                </Button>
              </>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="body2" sx={{ mr: 1 }}>
              {user.name} ({normalizedRole})
            </Typography>
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
            >
              Logout
            </Button>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
          >
            {normalizedRole === 'ADMIN' && (
              [
                <MenuItem key="hospitals" onClick={handleCloseMenu} component={Link} to="/hospitals">
                  <ListItemIcon>
                    <LocalHospitalIcon />
                  </ListItemIcon>
                  Hospitals
                </MenuItem>,
                <MenuItem key="blocks" onClick={handleCloseMenu} component={Link} to="/blocks">
                  <ListItemIcon>
                    <ViewModuleIcon />
                  </ListItemIcon>
                  Blocks
                </MenuItem>,
                <MenuItem key="departments" onClick={handleCloseMenu} component={Link} to="/departments">
                  <ListItemIcon>
                    <MedicalServicesIcon />
                  </ListItemIcon>
                  Departments
                </MenuItem>,
                <MenuItem key="service-catalog" onClick={handleCloseMenu} component={Link} to="/service-catalog">
                  <ListItemIcon>
                    <ViewModuleIcon />
                  </ListItemIcon>
                  Service Catalog
                </MenuItem>,
                <Divider key="divider" />,
                <MenuItem key="doctors" onClick={handleCloseMenu} component={Link} to="/doctors">
                  <ListItemIcon>
                    <GroupIcon />
                  </ListItemIcon>
                  Doctors
                </MenuItem>
              ]
            )}
            {normalizedRole === 'MANAGER' && (
              <MenuItem onClick={handleCloseMenu} component={Link} to="/doctors">
                <ListItemIcon>
                  <GroupIcon />
                </ListItemIcon>
                Doctors
              </MenuItem>
            )}
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <NavigationDebugger user={user} />
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute user={user}>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route path="/dashboard" element={<Dashboard user={user} />} />

          <Route path="/debug" element={<ApiDebugger />} />

          <Route
            path="/hospitals"
            element={
              <ProtectedRoute requiredRoles={['ADMIN']} user={user}>
                <HospitalList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/blocks"
            element={
              <ProtectedRoute requiredRoles={['ADMIN']} user={user}>
                <BlockList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/departments"
            element={
              <ProtectedRoute requiredRoles={['ADMIN']} user={user}>
                <DepartmentList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctors"
            element={
              <ProtectedRoute requiredRoles={['ADMIN', 'MANAGER']} user={user}>
                <DoctorList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patients"
            element={
              <ProtectedRoute requiredRoles={['ADMIN', 'USER']} user={user}>
                <PatientList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/appointments"
            element={
              <ProtectedRoute requiredRoles={['ADMIN', 'USER']} user={user}>
                <AppointmentList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/billing"
            element={
              <ProtectedRoute requiredRoles={['ADMIN', 'USER']} user={user}>
                <BillingList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/service-catalog"
            element={
              <ProtectedRoute requiredRoles={['ADMIN']} user={user}>
                <ServiceCatalogList />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
