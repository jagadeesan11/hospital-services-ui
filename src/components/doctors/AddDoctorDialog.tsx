import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
} from '@mui/material';
import { Doctor, doctorService } from '../../services/doctorService';
import { Hospital, hospitalService } from '../../services/hospitalService';
import { Department, departmentService } from '../../services/departmentService';

interface AddDoctorDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddDoctorDialog: React.FC<AddDoctorDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<Omit<Doctor, 'id'>>({
    name: '',
    email: '',
    specialization: '',
    hospitalId: 0,
    departmentId: 0,
  });

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    try {
      const response = await hospitalService.getAllHospitals();
      setHospitals(response.data);
    } catch (err) {
      console.error('Error loading hospitals:', err);
      setError('Failed to load hospitals');
    }
  };

  const loadDepartments = async (hospitalId: number) => {
    try {
      const response = await departmentService.getAllDepartments(hospitalId);
      setDepartments(response.data);
    } catch (err) {
      console.error('Error loading departments:', err);
      setError('Failed to load departments');
    }
  };

  const handleHospitalChange = async (event: any) => {
    const hospitalId = event.target.value;
    setFormData(prev => ({
      ...prev,
      hospitalId,
      departmentId: 0
    }));
    if (hospitalId) {
      await loadDepartments(hospitalId);
    } else {
      setDepartments([]);
    }
  };

  const handleDepartmentChange = (event: any) => {
    const departmentId = event.target.value;
    setFormData(prev => ({
      ...prev,
      departmentId
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.specialization.trim()) {
      newErrors.specialization = 'Specialization is required';
    }

    if (!formData.hospitalId) {
      newErrors.hospitalId = 'Hospital is required';
    }

    if (!formData.departmentId) {
      newErrors.departmentId = 'Department is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await doctorService.createDoctor(formData);
      onSuccess();
      setFormData({
        name: '',
        email: '',
        specialization: '',
        hospitalId: 0,
        departmentId: 0,
      });
    } catch (err) {
      console.error('Error creating doctor:', err);
      setError('Failed to create doctor. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Doctor</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
            />

            <TextField
              fullWidth
              label="Specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              error={!!errors.specialization}
              helperText={errors.specialization}
            />

            <FormControl fullWidth error={!!errors.hospitalId}>
              <InputLabel>Hospital</InputLabel>
              <Select
                value={formData.hospitalId}
                label="Hospital"
                onChange={handleHospitalChange}
              >
                <MenuItem value={0}>Select a Hospital</MenuItem>
                {hospitals.map((hospital) => (
                  <MenuItem key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.hospitalId && (
                <span style={{ color: 'red', fontSize: '0.75rem', marginTop: '3px' }}>
                  {errors.hospitalId}
                </span>
              )}
            </FormControl>

            <FormControl fullWidth error={!!errors.departmentId}>
              <InputLabel>Department</InputLabel>
              <Select
                value={formData.departmentId}
                label="Department"
                onChange={handleDepartmentChange}
                disabled={!formData.hospitalId}
              >
                <MenuItem value={0}>Select a Department</MenuItem>
                {departments.map((department) => (
                  <MenuItem key={department.id} value={department.id}>
                    {department.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.departmentId && (
                <span style={{ color: 'red', fontSize: '0.75rem', marginTop: '3px' }}>
                  {errors.departmentId}
                </span>
              )}
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Doctor'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddDoctorDialog;
