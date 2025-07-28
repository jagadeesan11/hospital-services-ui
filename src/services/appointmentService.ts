import { appointmentApi } from './api';
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
  getAllAppointments: () => appointmentApi.get('/api/appointments'),
  getAppointmentsByDoctor: (doctorId: number) => appointmentApi.get(`/api/appointments/doctor/${doctorId}`),
  getAppointment: (id: number) => appointmentApi.get(`/api/appointments/${id}`),
  createAppointment: (appointment: Appointment) => appointmentApi.post(`/api/appointments/doctor/${appointment.doctor.id}/patient`, appointment),
  updateAppointment: (id: number, appointment: Appointment) => appointmentApi.patch(`/api/appointments/${id}/status`, appointment),
  deleteAppointment: (id: number) => appointmentApi.delete(`/api/appointments/${id}`),
  rescheduleAppointment: (id: number, newAppointmentTime: string) => appointmentApi.put(`/api/appointments/${id}/reschedule`, { newAppointmentTime }),
};
