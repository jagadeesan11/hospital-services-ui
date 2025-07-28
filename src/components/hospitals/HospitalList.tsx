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
  Alert,
  Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Hospital, hospitalService } from '../../services/hospitalService';
import AddHospitalDialog from './AddHospitalDialog';
import EditHospitalDialog from './EditHospitalDialog';

const HospitalList: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    console.log('🏥 HospitalList component mounted - about to call loadHospitals API');
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    console.log('📡 loadHospitals function called - making API request to /api/hospitals');
    try {
      console.log('🔄 About to call hospitalService.getAllHospitals()...');
      const response = await hospitalService.getAllHospitals();
      console.log('✅ API call successful:', response.status, response.data);
      setHospitals(response.data);
    } catch (error) {
      console.error('❌ Error loading hospitals:', error);
      setErrorMessage('Failed to load hospitals. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await hospitalService.deleteHospital(id);
      loadHospitals();
      setSuccessMessage('Hospital deleted successfully');
    } catch (error) {
      console.error('Error deleting hospital:', error);
      setErrorMessage('Failed to delete hospital. Please try again.');
    }
  };

  const handleEdit = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    loadHospitals();
    setSuccessMessage('Hospital updated successfully');
  };

  const handleAddSuccess = () => {
    loadHospitals();
    setSuccessMessage('Hospital added successfully');
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Button
          variant="contained"
          color="primary"
          style={{ margin: '16px' }}
          onClick={() => setIsAddDialogOpen(true)}
        >
          Add New Hospital
        </Button>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hospitals.map((hospital) => (
              <TableRow key={hospital.id}>
                <TableCell>{hospital.name}</TableCell>
                <TableCell>{hospital.email}</TableCell>
                <TableCell>{hospital.address}</TableCell>
                <TableCell>{hospital.phoneNumber}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleEdit(hospital)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => hospital.id && handleDelete(hospital.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <AddHospitalDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={handleAddSuccess}
      />

      <EditHospitalDialog
        open={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedHospital(null);
        }}
        onSuccess={handleEditSuccess}
        hospital={selectedHospital}
      />

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert severity="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage('')}
      >
        <Alert severity="error" onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default HospitalList;
