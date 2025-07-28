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
  SelectChangeEvent,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { MedicalRecord, medicalRecordService } from '../../services/medicalRecordService';
import { Doctor, doctorService } from '../../services/doctorService';
import { Hospital, hospitalService } from '../../services/hospitalService';
import { Box } from '@mui/system';

interface AddMedicalRecordDialogProps {
  open: boolean;
  patientId: number;
  onClose: () => void;
  onSuccess: () => void;
  onError: (error: any) => void;
}

const AddMedicalRecordDialog: React.FC<AddMedicalRecordDialogProps> = ({
  open,
  patientId,
  onClose,
  onSuccess,
  onError,
}) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<number>(0);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [formData, setFormData] = useState<Omit<MedicalRecord, 'id'>>({
    patientId,
    diagnosis: '',
    treatment: '',
    prescriptions: '',
    notes: '',
    visitDate: new Date().toISOString(),
    treatingDoctor: {
      id: 0,
      name: '',
      specialization: '',
      email: ''
    },
    recordType: ''
  });

  useEffect(() => {
    if (open) {
      loadHospitals();
    }
  }, [open]);

  const loadHospitals = async () => {
    try {
      const response = await hospitalService.getAllHospitals();
      setHospitals(response.data);
    } catch (error) {
      console.error('Error loading hospitals:', error);
      onError(error);
    }
  };

  const loadDoctors = async () => {
    try {
      const response = await doctorService.getAllDoctors();
      setDoctors(response.data);
    } catch (error) {
      console.error('Error loading doctors:', error);
      onError(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await medicalRecordService.createMedicalRecord(patientId, formData);
      onSuccess();
    } catch (error) {
      onError(error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        visitDate: date.toISOString()
      }));
    }
  };

  const handleDoctorChange = (doctorId: number) => {
    const selectedDoctor = doctors.find(doctor => doctor.id === doctorId);
    if (selectedDoctor) {
      setFormData(prev => ({
        ...prev,
        treatingDoctor: {
          id: selectedDoctor.id!,
          name: selectedDoctor.name,
          specialization: selectedDoctor.specialization,
          email: selectedDoctor.email
        }
      }));
    }
  };

  const handleHospitalChange = (event: SelectChangeEvent<number>) => {
    const hospitalId = event.target.value as number;
    setSelectedHospital(hospitalId);
    if (hospitalId > 0) {
      loadDoctors();
    } else {
      setDoctors([]);
    }
    // Reset doctor selection when hospital changes
    setFormData(prev => ({
      ...prev,
      treatingDoctor: {
        id: 0,
        name: '',
        specialization: '',
        email: ''
      }
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Medical Record</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: '200px' }}>
                <FormControl fullWidth required>
                  <InputLabel>Hospital</InputLabel>
                  <Select
                    value={selectedHospital}
                    onChange={handleHospitalChange}
                    label="Hospital"
                  >
                    <MenuItem value={0}>Select Hospital</MenuItem>
                    {hospitals.map((hospital) => (
                      <MenuItem key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1, minWidth: '200px' }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Visit Date & Time"
                    value={new Date(formData.visitDate)}
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
            </Box>

            <FormControl fullWidth required>
              <InputLabel>Doctor</InputLabel>
              <Select
                value={formData.treatingDoctor.id}
                onChange={(e) => handleDoctorChange(e.target.value as number)}
                label="Doctor"
                disabled={!selectedHospital}
              >
                <MenuItem value={0}>Select Doctor</MenuItem>
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialization}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Record Type</InputLabel>
              <Select
                value={formData.recordType}
                onChange={(e) => setFormData(prev => ({ ...prev, recordType: e.target.value as string }))}
                label="Record Type"
              >
                <MenuItem value="">Select Record Type</MenuItem>
                <MenuItem value="CONSULTATION">Consultation</MenuItem>
                <MenuItem value="FOLLOW_UP">Follow Up</MenuItem>
                <MenuItem value="EMERGENCY">Emergency</MenuItem>
                <MenuItem value="ROUTINE_CHECKUP">Routine Checkup</MenuItem>
                <MenuItem value="DIAGNOSTIC">Diagnostic</MenuItem>
                <MenuItem value="SURGERY">Surgery</MenuItem>
                <MenuItem value="THERAPY">Therapy</MenuItem>
                <MenuItem value="VACCINATION">Vaccination</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Diagnosis"
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              required
              multiline
              rows={3}
            />

            <TextField
              fullWidth
              label="Treatment"
              name="treatment"
              value={formData.treatment}
              onChange={handleChange}
              required
              multiline
              rows={3}
            />

            <TextField
              fullWidth
              label="Prescriptions"
              name="prescriptions"
              value={formData.prescriptions}
              onChange={handleChange}
              multiline
              rows={3}
            />

            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Save Record
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddMedicalRecordDialog;
