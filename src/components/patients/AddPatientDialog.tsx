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
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { Patient, patientService } from '../../services/patientService';
import { Hospital, hospitalService } from '../../services/hospitalService';

interface AddPatientDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (error: any) => void;
}

const AddPatientDialog: React.FC<AddPatientDialogProps> = ({
  open,
  onClose,
  onSuccess,
  onError,
}) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [formData, setFormData] = useState<Omit<Patient, 'id'>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: new Date().toISOString(),
    gender: 'MALE',
    bloodGroup: '',
    hospitalId: 0, // Default to 0, should be set by user selection
  });

  useEffect(() => {
    const loadHospitals = async () => {
      try {
        const response = await hospitalService.getAllHospitals();
        const hospitalsData = Array.isArray(response.data) ? response.data : [];
        setHospitals(hospitalsData);
      } catch (error) {
        console.error('Error loading hospitals:', error);
      }
    };

    if (open) {
      loadHospitals();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await patientService.createPatient(formData);
      onSuccess();
    } catch (error) {
      onError(error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        dateOfBirth: date.toISOString()
      }));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Register New Patient</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: '200px' }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Date of Birth"
                    value={new Date(formData.dateOfBirth)}
                    onChange={handleDateChange}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true
                      }
                    }}
                  />
                </LocalizationProvider>
              </Box>
              <Box sx={{ flex: 1, minWidth: '200px' }}>
                <FormControl fullWidth required>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    label="Gender"
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'MALE' | 'FEMALE' | 'OTHER' }))}
                  >
                    <MenuItem value="MALE">Male</MenuItem>
                    <MenuItem value="FEMALE">Female</MenuItem>
                    <MenuItem value="OTHER">Other</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: '200px' }}>
                <TextField
                  fullWidth
                  label="Blood Group"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  required
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: '200px' }}>
                <FormControl fullWidth required>
                  <InputLabel>Hospital</InputLabel>
                  <Select
                    value={formData.hospitalId}
                    label="Hospital"
                    onChange={(e) => setFormData(prev => ({ ...prev, hospitalId: e.target.value as number }))}
                  >
                    {hospitals.map((hospital) => (
                      <MenuItem key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              multiline
              rows={3}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Register Patient
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddPatientDialog;
