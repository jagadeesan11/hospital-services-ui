import { hospitalApi } from './api';

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
  getAllHospitals: () => hospitalApi.get('/api/hospitals'),
  getHospital: (id: number) => hospitalApi.get(`/api/hospitals/${id}`),
  createHospital: (hospital: CreateHospitalRequest) => hospitalApi.post('/api/hospitals', hospital),
  updateHospital: (id: number, hospital: Hospital) => hospitalApi.put(`/api/hospitals/${id}`, hospital),
  deleteHospital: (id: number) => hospitalApi.delete(`/api/hospitals/${id}`),
};
