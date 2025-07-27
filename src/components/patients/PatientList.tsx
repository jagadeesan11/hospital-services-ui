import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Box,
  Snackbar,
  Alert,
  TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import { Patient, patientService } from '../../services/patientService';
import AddPatientDialog from './AddPatientDialog';
import EditPatientDialog from './EditPatientDialog';
import ViewMedicalRecordsDialog from './ViewMedicalRecordsDialog';

const PatientList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchPatientId, setSearchPatientId] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMedicalRecordsOpen, setIsMedicalRecordsOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const response = await patientService.getAllPatients();
      setPatients(response.data);
      setFilteredPatients(response.data); // Initialize filteredPatients
    } catch (error) {
      console.error('Error loading patients:', error);
      showErrorMessage('Failed to load patients');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await patientService.deletePatient(id);
        showSuccessMessage('Patient deleted successfully');
        loadPatients();
      } catch (error) {
        console.error('Error deleting patient:', error);
        showErrorMessage('Failed to delete patient');
      }
    }
  };

  const showSuccessMessage = (message: string) => {
    setSnackbar({
      open: true,
      message,
      severity: 'success'
    });
  };

  const showErrorMessage = (message: string) => {
    setSnackbar({
      open: true,
      message,
      severity: 'error'
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleSearch = () => {
    if (searchPatientId.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient =>
        patient.id?.toString().includes(searchPatientId)
      );
      setFilteredPatients(filtered);
    }
  };

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <h2>Patients</h2>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsAddDialogOpen(true)}
          >
            New Patient
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            placeholder="Search by Patient ID"
            value={searchPatientId}
            onChange={(e) => setSearchPatientId(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            size="small"
          >
            Search
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient ID</TableCell>
              <TableCell>FirstName</TableCell>
              <TableCell>LastName</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Date of Birth</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Blood Group</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPatients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>{patient.id}</TableCell>
                <TableCell>{`${patient.firstName}`}</TableCell>
                <TableCell>{`${patient.lastName}`}</TableCell>
                <TableCell>{patient.email}</TableCell>
                <TableCell>{patient.phone}</TableCell>
                <TableCell>{formatDate(patient.dateOfBirth)}</TableCell>
                <TableCell>{patient.gender}</TableCell>
                <TableCell>{patient.bloodGroup}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => {
                      setSelectedPatient(patient);
                      setIsMedicalRecordsOpen(true);
                    }}
                    color="primary"
                    size="small"
                    title="View Medical Records"
                  >
                    <MedicalInformationIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setSelectedPatient(patient);
                      setIsEditDialogOpen(true);
                    }}
                    color="primary"
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(patient.id!)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <AddPatientDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={() => {
          setIsAddDialogOpen(false);
          showSuccessMessage('Patient added successfully');
          loadPatients();
        }}
        onError={(error) => showErrorMessage(error.message)}
      />

      {selectedPatient && (
        <>
          <EditPatientDialog
            open={isEditDialogOpen}
            patient={selectedPatient}
            onClose={() => {
              setIsEditDialogOpen(false);
              setSelectedPatient(null);
            }}
            onSuccess={() => {
              setIsEditDialogOpen(false);
              setSelectedPatient(null);
              showSuccessMessage('Patient updated successfully');
              loadPatients();
            }}
            onError={(error) => showErrorMessage(error.message)}
          />

          <ViewMedicalRecordsDialog
            open={isMedicalRecordsOpen}
            patient={selectedPatient}
            onClose={() => {
              setIsMedicalRecordsOpen(false);
              setSelectedPatient(null);
            }}
          />
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default PatientList;
