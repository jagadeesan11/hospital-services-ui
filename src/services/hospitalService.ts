import { api } from './api';

export interface Hospital {
  id: number;
  name: string;
  address: string;
  email: string;
  phoneNumber: string;
  createdAt: Array<number>;
  updatedAt: Array<number>;
  createdBy: string;
  lastModifiedBy: string;
}

export interface CreateHospitalRequest {
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
}

export const hospitalService = {
  getAllHospitals: () => api.get('/api/hospitals'),
  getHospital: (id: number) => api.get(`/api/hospitals/${id}`),
  createHospital: (hospital: CreateHospitalRequest) => api.post('/api/hospitals', hospital),
  updateHospital: (id: number, hospital: Hospital) => api.put(`/api/hospitals/${id}`, hospital),
  deleteHospital: (id: number) => api.delete(`/api/hospitals/${id}`),
};
