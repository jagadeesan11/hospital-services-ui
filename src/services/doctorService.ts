import { doctorApi } from './api';

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

export interface CreateDoctorRequest {
  name: string;
  email: string;
  specialization: string;
  hospitalId: number;
  departmentId: number;
}

export const doctorService = {
  getAllDoctors: () => doctorApi.get('/api/doctors'),
  getDoctor: (id: number) => doctorApi.get(`/api/doctors/${id}`),
  getDoctorsByDepartment: (departmentId: number) => doctorApi.get(`/api/doctors/department/${departmentId}`),
  createDoctor: (doctor: CreateDoctorRequest) => doctorApi.post('/api/doctors', doctor),
  updateDoctor: (id: number, doctor: Doctor) => doctorApi.put(`/api/doctors/${id}`, doctor),
  deleteDoctor: (id: number) => doctorApi.delete(`/api/doctors/${id}`),
};
