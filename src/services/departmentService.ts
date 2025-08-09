import { hospitalApi } from './api';

export interface Department {
  id?: number;
  name: string;
  block_id: number;
  hospital_id: number;
  hospital?: {
    id: number;
    name: string;
    address: string;
    phoneNumber: string;
    email: string;
    createdBy?: string;
    lastModifiedBy?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  block?: {
    id: number;
    name: string;
    description?: string;
    floorNumber?: number;
    hospital?: {
      id: number;
      name: string;
      address: string;
      phoneNumber: string;
      email: string;
      createdBy?: string;
      lastModifiedBy?: string;
      createdAt?: string;
      updatedAt?: string;
    };
    createdBy?: string;
    lastModifiedBy?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface CreateDepartmentRequest {
  name: string;
  block_id: number;
  hospital_id: number;
}

export const departmentService = {
  ///getAllDepartments: () => hospitalApi.get('/api/departments'),
  getDepartment: (id: number) => hospitalApi.get(`/api/departments/${id}`),
  getDepartmentsByHospital: (hospitalId: number) => hospitalApi.get(`/api/hospitals/${hospitalId}/departments`),
  getDepartmentsByBlock: (blockId: number) => hospitalApi.get(`/api/blocks/${blockId}/departments`),
  createDepartment: (department: CreateDepartmentRequest) => hospitalApi.post('/api/departments', department),
  createDepartmentByHospitalBlock: (hospitalId: number, blockId: number, department: CreateDepartmentRequest) => hospitalApi.post(`/api/hospitals/${hospitalId}/blocks/${blockId}/departments`, department),
  updateDepartment: (id: number, department: Department) => hospitalApi.put(`/api/departments/${id}`, department),
  deleteDepartment: (id: number) => hospitalApi.delete(`/api/departments/${id}`),
};
