import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  Container,
  Box,
  Menu,
  MenuItem,
  ListItemIcon
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import HospitalList from './components/hospitals/HospitalList';
import BlockList from './components/blocks/BlockList';
import DepartmentList from './components/departments/DepartmentList';
import AppointmentList from './components/appointments/AppointmentList';
import DoctorList from './components/doctors/DoctorList';
import Home from './components/home/Home';
import PatientList from './components/patients/PatientList';
import chettinadLogo from './assets/chettinad-logo.svg';
import './App.css';

function App() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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
              onClick={(e) => setAnchorEl(e.currentTarget)}
              startIcon={<AdminPanelSettingsIcon />}
            >
              Administrator
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem component={Link} to="/hospitals" onClick={() => setAnchorEl(null)}>
                <ListItemIcon>
                  <LocalHospitalIcon fontSize="small" />
                </ListItemIcon>
                Hospitals
              </MenuItem>
              <MenuItem component={Link} to="/blocks" onClick={() => setAnchorEl(null)}>
                <ListItemIcon>
                  <ViewModuleIcon fontSize="small" />
                </ListItemIcon>
                Blocks
              </MenuItem>
              <MenuItem component={Link} to="/departments" onClick={() => setAnchorEl(null)}>
                <ListItemIcon>
                  <MedicalServicesIcon fontSize="small" />
                </ListItemIcon>
                Departments
              </MenuItem>
              <MenuItem component={Link} to="/doctors" onClick={() => setAnchorEl(null)}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                Doctors
              </MenuItem>
              <MenuItem component={Link} to="/patients" onClick={() => setAnchorEl(null)}>
                <ListItemIcon>
                  <GroupIcon fontSize="small" />
                </ListItemIcon>
                Patients
              </MenuItem>
            </Menu>
            <Button color="inherit" component={Link} to="/appointments">
              Appointments
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Routes>
            <Route path="/hospitals" element={<HospitalList />} />
            <Route path="/blocks" element={<BlockList />} />
            <Route path="/departments" element={<DepartmentList />} />
            <Route path="/doctors" element={<DoctorList />} />
            <Route path="/appointments" element={<AppointmentList />} />
            <Route path="/patients" element={<PatientList />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </Box>
      </Container>
    </Router>
  );
}

export default App;
