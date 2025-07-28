import { patientApi } from './api';

export interface MedicalRecord {
  id?: number;
  patientId?: number;
  doctorId?: number;
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
  getMedicalRecordsByPatient: (patientId: number) => patientApi.get(`/api/medical-records/patient/${patientId}`),
  getMedicalRecord: (id: number) => patientApi.get(`/api/medical-records/${id}`),
  createMedicalRecord: (patientId: number, doctorId: number, record: Omit<MedicalRecord, 'id'>) => {
    console.log('🏥 Creating medical record with:', { patientId, doctorId, record });
    const payload = {
      ...record,
      doctorId: doctorId,
      patientId: patientId
    };
    console.log('📤 Final payload:', payload);
    return patientApi.post(`/api/medical-records`, payload);
  },
  updateMedicalRecord: (id: number, record: MedicalRecord) =>
    patientApi.put(`/api/medical-records/${id}`, record),
  deleteMedicalRecord: (id: number) => patientApi.delete(`/api/medical-records/${id}`),
};
