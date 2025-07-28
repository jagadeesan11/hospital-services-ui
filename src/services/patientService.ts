import { patientApi } from './api';

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
  getAllPatients: () => patientApi.get('/api/patients'),
  getPatient: (id: number) => patientApi.get(`/api/patients/${id}`),
  createPatient: (patient: Omit<Patient, 'id'>) => patientApi.post('/api/patients', patient),
  updatePatient: (id: number, patient: Patient) => patientApi.put(`/api/patients/${id}`, patient),
  deletePatient: (id: number) => patientApi.delete(`/api/patients/${id}`),
};
