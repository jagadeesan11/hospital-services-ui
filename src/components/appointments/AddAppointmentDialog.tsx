import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { Department, departmentService } from '../../services/departmentService';
import { Hospital, hospitalService } from '../../services/hospitalService';
import { Appointment, appointmentService } from '../../services/appointmentService';
import { Doctor, doctorService } from '../../services/doctorService';
import { emailService, AppointmentConfirmationData } from '../../services/emailService';

interface AddAppointmentDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (error: any) => void;
}

const AddAppointmentDialog: React.FC<AddAppointmentDialogProps> = ({
  open,
  onClose,
  onSuccess,
  onError,
}) => {
  const [formData, setFormData] = useState<Omit<Appointment, 'id'>>({
    patient: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      gender: 'MALE',
      bloodGroup: '',
      hospitalId: 0,
    },
    doctor: {
      id: 0,
      name: '',
      email: '',
      specialization: '',
      department: {
        id: 0,
        name: ''
      }
    },
    appointmentTime: (() => {
      const date = new Date();
      date.setHours(date.getHours() + 1);
      date.setMinutes(0);
      date.setSeconds(0);
      date.setMilliseconds(0);
      return date.toISOString();
    })(),
    status: 'SCHEDULED'
  });

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    if (open) {
      loadHospitals();
    }
  }, [open]);

  // Add new useEffect to reload doctors when department changes
  useEffect(() => {
    if (selectedHospital && formData.doctor?.department?.id) {
      loadDoctors(selectedHospital);
    }
  }, [formData.doctor?.department?.id]);

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
      const response = await departmentService.getDepartmentsByHospital(hospitalId);
      setDepartments(response.data);
    } catch (err) {
      console.error('Error loading departments:', err);
      setError('Failed to load departments');
    }
  };

  const loadDoctors = async (hospitalId: number) => {
    try {
      const response = await doctorService.getAllDoctors();
      const filteredDoctors = response.data.filter(
        (doctor: Doctor) => doctor.department?.id === formData.doctor?.department?.id
      );
      setDoctors(filteredDoctors);
    } catch (err) {
      console.error('Error loading doctors:', err);
      setError('Failed to load doctors');
    }
  };

  const handleHospitalChange = (event: SelectChangeEvent<number>) => {
    const hospitalId = event.target.value as number;
    setSelectedHospital(hospitalId);
    setFormData(prev => ({
      ...prev,
      doctor: {
        ...prev.doctor,
        id: 0,
        name: '',
        department: { id: 0, name: '' }
      }
    }));
    loadDepartments(hospitalId);
  };

  const handleDepartmentChange = (event: SelectChangeEvent<number>) => {
    const departmentId = event.target.value as number;
    const selectedDepartment = departments.find(dept => dept.id === departmentId);
    setFormData(prev => ({
      ...prev,
      doctor: {
        ...prev.doctor,
        id: 0,
        name: '',
        department: {
          id: departmentId,
          name: selectedDepartment?.name || ''
        }
      }
    }));
  };

  const handleDoctorChange = (event: SelectChangeEvent<number>) => {
    const doctorId = event.target.value as number;
    const selectedDoctor = doctors.find(doc => doc.id === doctorId);
    if (selectedDoctor) {
      setFormData(prev => ({
        ...prev,
        doctor: {
          ...selectedDoctor
        }
      }));
    }
  };

  const handleDateTimeChange = (newValue: Date | null) => {
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        appointmentTime: newValue.toISOString()
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('patient.')) {
      const patientField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        patient: {
          ...prev.patient,
          [patientField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.patient.firstName) {
      newErrors.firstName = 'Patient first name is required';
    }
    if (!formData.patient.lastName) {
      newErrors.lastName = 'Patient last name is required';
    }
    if (!formData.patient.email) {
      newErrors.patientEmail = 'Patient email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.patient.email)) {
      newErrors.patientEmail = 'Invalid email format';
    }
    if (!formData.patient.phone) {
      newErrors.patientPhone = 'Patient phone number is required';
    }
    if (!formData.doctor.id) {
      newErrors.doctor = 'Doctor selection is required';
    }
    if (!selectedHospital) {
      newErrors.hospital = 'Hospital selection is required';
    }
    if (!formData.doctor?.department?.id) {
      newErrors.department = 'Department selection is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendConfirmationEmail = async () => {
    try {
      const selectedHospitalData = hospitals.find(h => h.id === selectedHospital);
      const appointmentDate = new Date(formData.appointmentTime);

      const emailData: AppointmentConfirmationData = {
        patientEmail: formData.patient.email,
        patientName: `${formData.patient.firstName} ${formData.patient.lastName}`,
        doctorName: formData.doctor.name,
        appointmentDate: appointmentDate.toLocaleDateString(),
        appointmentTime: appointmentDate.toLocaleTimeString(),
        hospitalName: selectedHospitalData?.name || 'Hospital'
      };

      await emailService.sendAppointmentConfirmation(emailData);
      console.log('Confirmation email sent successfully');
    } catch (emailErr) {
      console.error('Failed to send confirmation email:', emailErr);
      // Don't fail the appointment creation if email fails
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      // Create the appointment
      await appointmentService.createAppointment(formData);

      // Send confirmation email
      await sendConfirmationEmail();

      setSuccessMessage('Appointment created successfully! Confirmation email sent.');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error creating appointment:', err);
      onError(err);
      setError('Failed to create appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Schedule New Appointment</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {successMessage && <Alert severity="success">{successMessage}</Alert>}

          <TextField
            name="patient.firstName"
            label="Patient First Name"
            value={formData.patient.firstName}
            onChange={handleInputChange}
            error={!!errors.firstName}
            helperText={errors.firstName}
            required
          />

          <TextField
            name="patient.lastName"
            label="Patient Last Name"
            value={formData.patient.lastName}
            onChange={handleInputChange}
            error={!!errors.lastName}
            helperText={errors.lastName}
            required
          />

          <TextField
            name="patient.email"
            label="Patient Email"
            type="email"
            value={formData.patient.email}
            onChange={handleInputChange}
            error={!!errors.patientEmail}
            helperText={errors.patientEmail}
            required
          />

          <TextField
            name="patient.phone"
            label="Patient Phone"
            value={formData.patient.phone}
            onChange={handleInputChange}
            error={!!errors.patientPhone}
            helperText={errors.patientPhone}
            required
          />

          <FormControl fullWidth required error={!!errors.patientGender}>
            <InputLabel>Patient Gender</InputLabel>
            <Select
              name="patient.gender"
              value={formData.patient.gender}
              label="Patient Gender"
              onChange={(e) => setFormData(prev => ({
                ...prev,
                patient: {
                  ...prev.patient,
                  gender: e.target.value as 'MALE' | 'FEMALE' | 'OTHER'
                }
              }))}
            >
              <MenuItem value="MALE">Male</MenuItem>
              <MenuItem value="FEMALE">Female</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </Select>
          </FormControl>

          <FormControl error={!!errors.hospital}>
            <InputLabel>Hospital</InputLabel>
            <Select
              value={selectedHospital}
              onChange={handleHospitalChange}
              label="Hospital"
            >
              <MenuItem value={0}>Select Hospital</MenuItem>
              {hospitals.map(hospital => (
                <MenuItem key={hospital.id} value={hospital.id}>
                  {hospital.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl error={!!errors.department}>
            <InputLabel>Department</InputLabel>
            <Select
              value={formData.doctor?.department?.id || 0}
              onChange={handleDepartmentChange}
              label="Department"
              disabled={!selectedHospital}
            >
              <MenuItem value={0}>Select Department</MenuItem>
              {departments.map(department => (
                <MenuItem key={department.id} value={department.id}>
                  {department.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl error={!!errors.doctor}>
            <InputLabel>Doctor</InputLabel>
            <Select
              value={formData.doctor.id}
              onChange={handleDoctorChange}
              label="Doctor"
              disabled={!formData.doctor?.department?.id}
            >
              <MenuItem value={0}>Select Doctor</MenuItem>
              {doctors.map(doctor => (
                <MenuItem key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Appointment Time"
              value={new Date(formData.appointmentTime)}
              onChange={handleDateTimeChange}
              disablePast
            />
          </LocalizationProvider>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
        >
          Schedule Appointment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddAppointmentDialog;
