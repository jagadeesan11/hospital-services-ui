import { api } from './api';

export interface EmailResponseDTO {
  success: boolean;
  message: string;
  timestamp?: string;
}

export interface AppointmentConfirmationData {
  patientEmail: string;
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  hospitalName: string;
}

export const emailService = {
  sendAppointmentConfirmation: (data: AppointmentConfirmationData) =>
    api.post('/api/emails/send/appointment-confirmation', null, {
      params: {
        patientEmail: data.patientEmail,
        patientName: data.patientName,
        doctorName: data.doctorName,
        appointmentDate: data.appointmentDate,
        appointmentTime: data.appointmentTime,
        hospitalName: data.hospitalName,
      },
    }),

  sendSimpleEmail: (to: string, subject: string, text: string) =>
    api.post('/api/emails/send/simple', null, {
      params: { to, subject, body: text },
    }),

  sendHtmlEmail: (to: string, subject: string, html: string) =>
    api.post('/api/emails/send/html', null, {
      params: { to, subject, htmlBody: html },
    }),
};
