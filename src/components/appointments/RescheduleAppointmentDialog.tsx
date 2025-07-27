import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Appointment, appointmentService } from '../../services/appointmentService';

interface RescheduleAppointmentDialogProps {
  open: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const RescheduleAppointmentDialog: React.FC<RescheduleAppointmentDialogProps> = ({
  open,
  appointment,
  onClose,
  onSuccess,
  onError,
}) => {
  const [newDateTime, setNewDateTime] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  const handleSubmit = async () => {
    if (!appointment?.id) {
      onError('Invalid appointment selected');
      return;
    }

    if (!newDateTime) {
      setValidationError('Please select a new date and time');
      return;
    }

    // Validate that the new date is in the future
    const now = new Date();
    if (newDateTime <= now) {
      setValidationError('Please select a future date and time');
      return;
    }

    setIsSubmitting(true);
    setValidationError('');

    try {
      // Format the date as ISO string for the backend
      const formattedDateTime = newDateTime.toISOString();

      await appointmentService.rescheduleAppointment(appointment.id, formattedDateTime);
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error rescheduling appointment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reschedule appointment. Please try again.';
      onError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setNewDateTime(null);
    setValidationError('');
    setIsSubmitting(false);
    onClose();
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Reschedule Appointment
        </DialogTitle>
        <DialogContent>
          {appointment && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Appointment Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Patient:</strong> {appointment.patient.firstName} {appointment.patient.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Doctor:</strong> Dr. {appointment.doctor.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Current Date & Time:</strong> {formatDateTime(appointment.appointmentTime)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Status:</strong> {appointment.status}
              </Typography>
            </Box>
          )}

          {validationError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {validationError}
            </Alert>
          )}

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Select New Date & Time
            </Typography>
            <DateTimePicker
              label="New Appointment Date & Time"
              value={newDateTime}
              onChange={(newValue) => {
                setNewDateTime(newValue);
                setValidationError('');
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                }
              }}
              minDateTime={new Date()}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting || !newDateTime}
          >
            {isSubmitting ? 'Rescheduling...' : 'Reschedule Appointment'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default RescheduleAppointmentDialog;
