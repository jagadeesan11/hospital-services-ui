import { hospitalApi } from './api';

export interface Department {
  id?: number;
  name: string;
  block_id: number;
  hospital_id: number;
}

export interface CreateDepartmentRequest {
  department: Department;
  hospital_id: number;
}

export const departmentService = {
  getAllDepartments: () => hospitalApi.get('/api/departments'),
  getDepartment: (id: number) => hospitalApi.get(`/api/departments/${id}`),
  getDepartmentsByHospital: (hospitalId: number) => hospitalApi.get(`/api/hospitals/${hospitalId}/departments`),
  getDepartmentsByBlock: (blockId: number) => hospitalApi.get(`/api/blocks/${blockId}/departments`),
  createDepartment: (department: CreateDepartmentRequest) => hospitalApi.post('/api/departments', department),
  updateDepartment: (id: number, department: Department) => hospitalApi.put(`/api/departments/${id}`, department),
  deleteDepartment: (id: number) => hospitalApi.delete(`/api/departments/${id}`),
};
