import React, { useEffect, useState } from 'react';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  TableHead,
  TableRow,
  TableContainer,
  TableCell,
  Table,
  TableBody,
  Paper,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  TextField,
  Box,
  Snackbar,
  Alert,
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PersonIcon from '@mui/icons-material/Person';
import { Appointment, appointmentService } from '../../services/appointmentService';
import { Department, departmentService } from '../../services/departmentService';
import { Block, blockService } from '../../services/blockService';
import { Hospital, hospitalService } from '../../services/hospitalService';
import { Doctor, doctorService } from '../../services/doctorService';
import AddAppointmentDialog from './AddAppointmentDialog';
import RescheduleAppointmentDialog from './RescheduleAppointmentDialog';

// Add interface for error response
interface ErrorResponse {
  timestamp?: string;
  status?: number;
  code?: string;
  error?: string;
  message?: string;
  details?: string;
  validationErrors?: Record<string, string>;
}

const AppointmentList: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<number | ''>('');
  const [selectedDepartment, setSelectedDepartment] = useState<number | ''>('');
  const [selectedDoctor, setSelectedDoctor] = useState<number | ''>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [selectedAppointmentForReschedule, setSelectedAppointmentForReschedule] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadDepartments = async (hospitalId: number) => {
    try {
      const response = await departmentService.getDepartmentsByHospital(hospitalId);
      setDepartments(response.data);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadDoctors = async (hospitalId: number) => {
    try {
      const response = await doctorService.getAllDoctors();
      setDoctors(response.data || []);
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const loadInitialData = async () => {
    try {
      // Load hospitals
      const hospitalResponse = await hospitalService.getAllHospitals();
      setHospitals(hospitalResponse.data);

      // Load all appointments
      const appointmentsResponse = await appointmentService.getAllAppointments();
      setAppointments(appointmentsResponse.data || []);

      // If we have hospitals, load departments and doctors for the first hospital
      if (hospitalResponse.data.length > 0) {
        const firstHospital = hospitalResponse.data[0];
        await loadDepartments(firstHospital.id);
        const doctorResponse = await doctorService.getAllDoctors();
        setDoctors(doctorResponse.data || []);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load appointments',
        severity: 'error'
      });
    }
  };

  const loadAppointments = async () => {
    try {
      if (selectedDoctor && selectedDoctor !== 0) {
        // Load appointments for specific doctor
        const response = await appointmentService.getAppointmentsByDoctor(Number(selectedDoctor));
        setAppointments(response.data || []);
      } else if (selectedDepartment && selectedDepartment !== 0) {
        // Load appointments for all doctors in department
        const departmentDoctors = doctors.filter(doctor => {
          const doctorDeptId = doctor.departmentId || doctor.department?.id;
          return doctorDeptId === Number(selectedDepartment);
        });

        if (departmentDoctors.length > 0) {
          const appointmentPromises = departmentDoctors.map(doctor =>
            appointmentService.getAppointmentsByDoctor(Number(doctor.id))
          );
          const responses = await Promise.all(appointmentPromises);
          const allAppointments = responses.flatMap(response => response.data || []);
          setAppointments(allAppointments);
        } else {
          setAppointments([]);
        }
      } else if (selectedHospital) {
        // Load appointments for all doctors in the hospital
        const appointmentPromises = doctors.map(doctor =>
          appointmentService.getAppointmentsByDoctor(Number(doctor.id))
        );
        const responses = await Promise.all(appointmentPromises);
        const allAppointments = responses.flatMap(response => response.data || []);
        setAppointments(allAppointments);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
      setSnackbar({
        open: true,
        message: 'Failed to load appointments',
        severity: 'error'
      });
    }
  };

  const handleHospitalChange = async (event: SelectChangeEvent<number | ''>) => {
    const hospitalId = event.target.value as number | '';
    setSelectedHospital(hospitalId);
    setSelectedDepartment('');
    setSelectedDoctor('');
    setAppointments([]);
    if (hospitalId) {
      await loadDepartments(hospitalId);
      await loadDoctors(hospitalId);
    } else {
      setDepartments([]);
      setDoctors([]);
    }
  };

  const handleDepartmentChange = (event: SelectChangeEvent<number | ''>) => {
    const departmentId = event.target.value as number | '';
    setSelectedDepartment(departmentId);
    setSelectedDoctor('');
    setAppointments([]);

    // Load appointments for the selected department
    if (departmentId && departmentId !== 0) {
      setTimeout(() => loadAppointments(), 100); // Small delay to ensure state is updated
    }
  };

  const handleDoctorChange = (event: SelectChangeEvent<number | ''>) => {
    const doctorId = event.target.value as number | '';
    setSelectedDoctor(doctorId);
    if (doctorId) {
      loadAppointments();
    } else {
      setAppointments([]);
    }
  };

  const showErrorMessage = (error: any) => {
    let errorMessage = 'An error occurred';

    if (error.response?.data) {
      const errorData: ErrorResponse = error.response.data;
      // Use the specific error message if available
      errorMessage = errorData.message || errorData.error || errorData.details || 'An error occurred';

      // Format the message to be more user-friendly
      errorMessage = errorMessage.replace('Failed to create appointment: ', '');
    }

    setSnackbar({
      open: true,
      message: errorMessage,
      severity: 'error'
    });
  };

  const handleStatusChange = async (id: number, appointment: Appointment, newStatus: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED') => {
    try {
      await appointmentService.updateAppointment(id, { ...appointment, status: newStatus });
      showSuccessMessage('Appointment status updated successfully');
      loadAppointments();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      showErrorMessage(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await appointmentService.deleteAppointment(id);
        showSuccessMessage('Appointment deleted successfully');
        loadAppointments();
      } catch (error) {
        console.error('Error deleting appointment:', error);
        showErrorMessage(error);
      }
    }
  };

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  // Filter appointments based on selected date and time
  const filterAppointmentsByDateTime = (appointments: Appointment[]) => {
    let filteredAppointments = [...appointments];

    // Only filter out past appointments if no date is selected
    if (!selectedDate) {
      const now = new Date();
      filteredAppointments = filteredAppointments.filter(appointment => {
        const appointmentDateTime = new Date(appointment.appointmentTime);
        return appointmentDateTime > now;
      });
    }

    // Filter by date if selected
    if (selectedDate) {
      filteredAppointments = filteredAppointments.filter(appointment => {
        const appointmentDate = new Date(appointment.appointmentTime);
        const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        const appointmentDateOnly = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
        return appointmentDateOnly.getTime() === selectedDateOnly.getTime();
      });
    }

    // Filter by time if selected
    if (selectedTime) {
      filteredAppointments = filteredAppointments.filter(appointment => {
        const appointmentDateTime = new Date(appointment.appointmentTime);
        const selectedTimeHours = selectedTime.getHours();
        const selectedTimeMinutes = selectedTime.getMinutes();
        const appointmentHours = appointmentDateTime.getHours();
        const appointmentMinutes = appointmentDateTime.getMinutes();

        const appointmentTotalMinutes = appointmentHours * 60 + appointmentMinutes;
        const selectedTotalMinutes = selectedTimeHours * 60 + selectedTimeMinutes;
        const timeDifference = Math.abs(appointmentTotalMinutes - selectedTotalMinutes);

        return timeDifference <= 15;
      });
    }

    // Filter by status if selected
    if (selectedStatus) {
      filteredAppointments = filteredAppointments.filter(appointment =>
        appointment.status === selectedStatus
      );
    }

    return filteredAppointments;
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedStatus('');
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const showSuccessMessage = (message: string) => {
    setSnackbar({
      open: true,
      message,
      severity: 'success'
    });
  };

  const refreshAppointments = async () => {
    try {
      // Load hospitals if not already loaded
      if (hospitals.length === 0) {
        const hospitalResponse = await hospitalService.getAllHospitals();
        setHospitals(hospitalResponse.data);
      }

      // Load all appointments
      const appointmentsResponse = await appointmentService.getAllAppointments();
      setAppointments(appointmentsResponse.data);

      // Load departments and doctors based on current selection or first hospital
      const hospitalId = selectedHospital || (hospitals[0]?.id);
      if (hospitalId) {
        await loadDepartments(hospitalId);
        await loadDoctors(hospitalId);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      showErrorMessage(error);
    }
  };

  // Add the refresh call to useEffect
  useEffect(() => {
    refreshAppointments();
  }, []); // This will load appointments when component mounts

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsAddDialogOpen(true)}
          >
            New Appointment
          </Button>
        </Box>
        <Button
          variant="outlined"
          onClick={refreshAppointments}
          startIcon={<RefreshIcon />}
          sx={{ ml: 2 }}
        >
          Refresh
        </Button>
      </Box>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '16px' }}>
        <FormControl style={{ minWidth: 200 }}>
          <InputLabel>Hospital</InputLabel>
          <Select
            value={selectedHospital}
            label="Hospital"
            onChange={handleHospitalChange}
            MenuProps={{
              disablePortal: true,
            }}
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

        {selectedHospital && (
          <FormControl style={{ minWidth: 200 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={selectedDepartment}
              label="Department"
              onChange={handleDepartmentChange}
              MenuProps={{
                disablePortal: true,
              }}
            >
              <MenuItem value="">
                <em>Select a Department</em>
              </MenuItem>
              {departments.map((department) => (
                <MenuItem key={department.id} value={department.id}>
                  {department.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {selectedHospital && (
          <FormControl style={{ minWidth: 200 }}>
            <InputLabel>Doctor</InputLabel>
            <Select
              value={selectedDoctor}
              label="Doctor"
              onChange={handleDoctorChange}
              MenuProps={{
                disablePortal: true,
              }}
            >
              <MenuItem value="">
                <em>Select a Doctor</em>
              </MenuItem>
              {(() => {
                let availableDoctors = doctors;

                // Filter by department if one is selected
                if (selectedDepartment !== '' && selectedDepartment !== 0) {
                  const selectedDeptId = Number(selectedDepartment);
                  availableDoctors = doctors.filter(doctor => {
                    // Handle both departmentId field and nested department object
                    const doctorDeptId = doctor.departmentId || doctor.department?.id;
                    return doctorDeptId !== undefined && doctorDeptId !== null && doctorDeptId === selectedDeptId;
                  });

                  console.log('=== DEPARTMENT FILTERING DEBUG ===');
                  console.log('Selected Department (raw):', selectedDepartment, 'Type:', typeof selectedDepartment);
                  console.log('Selected Department (converted):', selectedDeptId, 'Type:', typeof selectedDeptId);
                  console.log('Total doctors loaded:', doctors.length);
                  console.log('All doctors with their dept IDs:', doctors.map(d => ({
                    id: d.id,
                    name: d.name,
                    departmentId: d.departmentId,
                    departmentFromNested: d.department?.id,
                    departmentName: d.department?.name
                  })));
                  console.log('Filtered doctors:', availableDoctors.length);
                  console.log('Matching doctors:', availableDoctors.map(d => d.name));
                  console.log('=====================================');
                }

                // If no doctors available after filtering and department is selected, show appropriate message
                if (availableDoctors.length === 0 && selectedDepartment !== '' && selectedDepartment !== 0) {

                  return [
                    <MenuItem key="no-doctors" value="" disabled>
                      <em>No doctors available in this department</em>
                    </MenuItem>
                  ];
                }

                return availableDoctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialization}
                  </MenuItem>
                ));
              })()}
            </Select>
          </FormControl>
        )}
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Filter by Date"
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
            slotProps={{
              textField: {
                style: { minWidth: 200 }
              }
            }}
          />

          <TimePicker
            label="Filter by Time (±15 min)"
            value={selectedTime}
            onChange={(newValue) => setSelectedTime(newValue)}
            slotProps={{
              textField: {
                style: { minWidth: 200 }
              }
            }}
          />
        </LocalizationProvider>

        <FormControl style={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={selectedStatus}
            label="Status"
            onChange={(e) => setSelectedStatus(e.target.value)}
            MenuProps={{
              disablePortal: true,
            }}
          >
            <MenuItem value="">
              <em>All Statuses</em>
            </MenuItem>
            <MenuItem value="SCHEDULED">SCHEDULED</MenuItem>
            <MenuItem value="COMPLETED">COMPLETED</MenuItem>
            <MenuItem value="CANCELLED">CANCELLED</MenuItem>
          </Select>
        </FormControl>

        {(selectedDate || selectedTime || selectedStatus) && (
          <Button
            variant="outlined"
            onClick={clearAllFilters}
            size="medium"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {!selectedDoctor && appointments.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          No appointments found
        </div>
      )}

      {selectedDoctor && appointments.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          No appointments found for this doctor
        </div>
      )}

      {appointments.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filterAppointmentsByDateTime(appointments).map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{`${appointment.patient.firstName} ${appointment.patient.lastName}`}</TableCell>
                  <TableCell>{appointment.patient.email}</TableCell>
                  <TableCell>
                    {departments.find(d => d.id === appointment.doctor?.department?.id)?.name || '-'}
                  </TableCell>
                  <TableCell>
                    {appointment.doctor ?
                      `${appointment.doctor.name}${appointment.doctor.specialization ? ` - ${appointment.doctor.specialization}` : ''}`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {new Date(appointment.appointmentTime).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <FormControl size="small">
                      <Select
                        value={appointment.status}
                        onChange={(e) => handleStatusChange(appointment.id!, appointment, e.target.value as any)}
                        renderValue={(value) => (
                          <Chip
                            label={value}
                            size="small"
                            color={getStatusChipColor(value) as any}
                          />
                        )}
                        MenuProps={{
                          disablePortal: true,
                        }}
                      >
                        <MenuItem value="SCHEDULED">SCHEDULED</MenuItem>
                        <MenuItem value="COMPLETED">COMPLETED</MenuItem>
                        <MenuItem value="CANCELLED">CANCELLED</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleDelete(appointment.id!)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        setSelectedAppointmentForReschedule(appointment);
                        setIsRescheduleDialogOpen(true);
                      }}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <AddAppointmentDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={() => {
          setIsAddDialogOpen(false);
          showSuccessMessage('Appointment created successfully');
          loadAppointments();
        }}
        onError={(error) => {
          showErrorMessage(error);
        }}
      />

      <RescheduleAppointmentDialog
        open={isRescheduleDialogOpen}
        appointment={selectedAppointmentForReschedule}
        onClose={() => {
          setIsRescheduleDialogOpen(false);
          setSelectedAppointmentForReschedule(null);
        }}
        onSuccess={() => {
          setIsRescheduleDialogOpen(false);
          setSelectedAppointmentForReschedule(null);
          showSuccessMessage('Appointment rescheduled successfully');
          loadAppointments();
        }}
        onError={(error) => {
          showErrorMessage(error);
        }}
      />

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

export default AppointmentList;
