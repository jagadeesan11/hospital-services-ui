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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Doctor, doctorService } from '../../services/doctorService';
import { Hospital, hospitalService } from '../../services/hospitalService';
import { Department, departmentService } from '../../services/departmentService';
import AddDoctorDialog from './AddDoctorDialog';
import EditDoctorDialog from './EditDoctorDialog';
import { SelectChangeEvent } from '@mui/material/Select';

const DoctorList: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<number | ''>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    loadHospitals();
  }, []); // Remove loadDoctors from initial useEffect

  useEffect(() => {
    if (selectedHospital) {
      loadDoctors();
    }
  }, [selectedHospital]); // Add new useEffect to watch for hospital selection

  const loadHospitals = async () => {
    try {
      const response = await hospitalService.getAllHospitals();
      setHospitals(response.data);
    } catch (error) {
      console.error('Error loading hospitals:', error);
    }
  };

  const loadDoctors = async () => {
    if (!selectedHospital) {
      setDoctors([]);
      return;
    }
    try {
      const response = await doctorService.getAllDoctors();
      setDoctors(response.data);

      // Also load departments for the selected hospital
      const deptResponse = await departmentService.getDepartmentsByHospital(Number(selectedHospital));
      setDepartments(deptResponse.data);
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const handleHospitalChange = (event: SelectChangeEvent<number | ''>) => {
    const hospitalId = event.target.value as number | '';
    setSelectedHospital(hospitalId);
    setDepartments([]); // Clear departments when hospital changes
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await doctorService.deleteDoctor(id);
        loadDoctors();
      } catch (error) {
        console.error('Error deleting doctor:', error);
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsAddDialogOpen(true)}
        >
          Add New Doctor
        </Button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <FormControl style={{ minWidth: 200 }}>
          <InputLabel>Select Hospital</InputLabel>
          <Select
            value={selectedHospital}
            label="Select Hospital"
            onChange={handleHospitalChange}
          >
            <MenuItem value="">
              <em>Select a Hospital</em>
            </MenuItem>
            {hospitals.map((hospital) => (
              <MenuItem key={hospital.id} value={hospital.id}>
                {hospital.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {doctors.length === 0 && selectedHospital && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          No doctors found for this hospital
        </div>
      )}

      {!selectedHospital && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Please select a hospital to view doctors
        </div>
      )}

      {(doctors.length > 0 || selectedHospital) && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Specialization</TableCell>
                <TableCell>Hospital</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {doctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell>{doctor.name}</TableCell>
                  <TableCell>{doctor.email}</TableCell>
                  <TableCell>{doctor.specialization}</TableCell>
                  <TableCell>
                    {hospitals.find(h => h.id === doctor.hospitalId)?.name || '-'}
                  </TableCell>
                  <TableCell>
                    {departments.find(d => d.id === doctor.departmentId)?.name || '-'}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => setEditDoctor(doctor)}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(doctor.id!)}
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
      )}

      <AddDoctorDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={() => {
          setIsAddDialogOpen(false);
          loadDoctors();
        }}
      />

      {editDoctor && (
        <EditDoctorDialog
          open={!!editDoctor}
          doctor={editDoctor}
          onClose={() => setEditDoctor(null)}
          onSuccess={() => {
            setEditDoctor(null);
            loadDoctors();
          }}
        />
      )}
    </div>
  );
};

export default DoctorList;
