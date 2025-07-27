import { api } from './api';

export interface Patient {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup: string;
  hospitalId: number;
  createdAt?: string;
  updatedAt?: string;

}

export const patientService = {
  getAllPatients: () => api.get('/api/patients'),
  getPatient: (id: number) => api.get(`/api/patients/${id}`),
  createPatient: (patient: Omit<Patient, 'id'>) => api.post('/api/patients', patient),
  updatePatient: (id: number, patient: Patient) => api.put(`/api/patients/${id}`, patient),
  deletePatient: (id: number) => api.delete(`/api/patients/${id}`),
};
