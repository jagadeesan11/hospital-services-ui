import { api } from './api';

export interface MedicalRecord {
  id?: number;
  patientId?: number;
  patient?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    // ...other patient fields
  };
  diagnosis: string;
  symptoms?: string;
  treatment: string;
  prescriptions?: string;
  notes: string;
  allergies?: any[];
  vitalSigns?: any[];
  treatingDoctor: {
    id: number;
    name: string;
    specialization: string;
    email: string;
    createdBy?: string;
    lastModifiedBy?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  visitDate: string;
  recordType: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  lastModifiedBy?: string;
}

export const medicalRecordService = {
  getMedicalRecordsByPatient: (patientId: number) => api.get(`/api/medical-records/patient/${patientId}`),
  getMedicalRecord: (id: number) => api.get(`/api/medical-records/${id}`),
  createMedicalRecord: (patientId: number, record: Omit<MedicalRecord, 'id'>) =>
    api.post(`/api/medical-records`, record),
  updateMedicalRecord: (id: number, record: MedicalRecord) =>
    api.put(`/api/medical-records/${id}`, record),
  deleteMedicalRecord: (id: number) => api.delete(`/api/medical-records/${id}`),
};
