import { api } from './api';

export interface Doctor {
  id?: number;
  name: string;
  email: string;
  specialization: string;
  hospitalId?: number;
  departmentId?: number;
  department?: {
    id: number;
    name: string;
  };
  hospital?: {
    id: number;
    name: string;
  };
}

export const doctorService = {
  getAllDoctors: (hospitalId: number) => api.get(`/api/hospitals/${hospitalId}/doctors`),
  getDoctor: (hospitalId: number, id: number) => api.get(`/api/hospitals/${hospitalId}/doctors/${id}`),
  createDoctor: (doctor: Doctor) => api.post(`/api/hospitals/${doctor.hospitalId}/doctors`, doctor),
  updateDoctor: (id: number, doctor: Doctor) => api.put(`/api/doctors/${id}`, doctor),
  deleteDoctor: (id: number) => api.delete(`/api/doctors/${id}`),
};
