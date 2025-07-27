import { api } from './api';
import { Doctor } from './doctorService';
import { Patient } from './patientService';

export interface Appointment {
  id?: number;
  patient: Patient;
  doctor: Doctor;
  appointmentTime: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  createdBy?: string;
  lastModifiedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const appointmentService = {
  getAllAppointments: () => api.get('/api/appointments'),
  getAppointmentsByDoctor: (doctorId: number) => api.get(`/api/appointments/doctor/${doctorId}`),
  getAppointment: (id: number) => api.get(`/api/appointments/${id}`),
  createAppointment: (appointment: Appointment) => api.post(`/api/appointments/doctor/${appointment.doctor.id}/patient`, appointment),
  updateAppointment: (id: number, appointment: Appointment) => api.patch(`/api/appointments/${id}/status`, appointment),
  deleteAppointment: (id: number) => api.delete(`/api/appointments/${id}`),
  getAppointmentsByDepartment: (departmentId: number) => api.get(`/api/departments/${departmentId}/appointments`),
  rescheduleAppointment: (id: number, newDateTime: string) => api.put(`/api/appointments/${id}/reschedule`, {
    newAppointmentTime: newDateTime
  }),
};
