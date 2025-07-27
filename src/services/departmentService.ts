import { api } from './api';

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
  getAllDepartments: (hospital_id: number) => api.get(`/api/hospitals/${hospital_id}/departments`),
  getDepartment: (id: number) => api.get(`/api/departments/${id}`),
  createDepartment: async ({ department, hospital_id }: CreateDepartmentRequest) => {
    try {
      return api.post(`/api/hospitals/${hospital_id}/blocks/${department.block_id}/departments`, department);
    } catch (error) {
      console.error('Error in createDepartment:', error);
      throw error;
    }
  },
  updateDepartment: (id: number, department: Department) => api.put(`/api/departments/${id}`, department),
  deleteDepartment: (id: number) => api.delete(`/api/departments/${id}`),
  getDepartmentsByBlock: (block_id: number) => api.get(`/api/blocks/${block_id}/departments`),
};
