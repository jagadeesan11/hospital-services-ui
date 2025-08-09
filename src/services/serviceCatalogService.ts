import { serviceCatalogApi } from './api';

export enum ServiceType {
  CONSULTATION = 'CONSULTATION',
  LAB_TEST = 'LAB_TEST',
  PHARMACY = 'PHARMACY',
  PROCEDURE = 'PROCEDURE',
  ROOM_CHARGES = 'ROOM_CHARGES',
  DIAGNOSTIC = 'DIAGNOSTIC',
  THERAPY = 'THERAPY',
  OTHER = 'OTHER'
}

export enum ServiceCategory {
  GENERAL_CONSULTATION = 'GENERAL_CONSULTATION',
  SPECIALIST_CONSULTATION = 'SPECIALIST_CONSULTATION',
  EMERGENCY_CONSULTATION = 'EMERGENCY_CONSULTATION',
  FOLLOW_UP_CONSULTATION = 'FOLLOW_UP_CONSULTATION',
  BLOOD_TEST = 'BLOOD_TEST',
  URINE_TEST = 'URINE_TEST',
  IMAGING = 'IMAGING',
  PATHOLOGY = 'PATHOLOGY',
  MICROBIOLOGY = 'MICROBIOLOGY',
  BIOCHEMISTRY = 'BIOCHEMISTRY',
  MEDICINE = 'MEDICINE',
  INJECTION = 'INJECTION',
  SUPPLEMENT = 'SUPPLEMENT',
  MEDICAL_DEVICE = 'MEDICAL_DEVICE',
  ROOM_CHARGE = 'ROOM_CHARGE',
  PROCEDURE_CHARGE = 'PROCEDURE_CHARGE',
  EQUIPMENT_CHARGE = 'EQUIPMENT_CHARGE',
  MISCELLANEOUS = 'MISCELLANEOUS'
}

export interface ServiceCatalogDTO {
  id?: number;
  serviceCode: string;
  serviceName: string;
  description?: string;
  serviceType: ServiceType;
  category: ServiceCategory;
  unitPrice: number;
  taxPercentage: number;
  isActive: boolean;
  hospitalId: number;
  departmentId?: number;
}

// API service for Service Catalog
export const serviceCatalogService = {
//   getAllServices: () => serviceCatalogApi.get('/api/service-catalog'),
  getService: (serviceId: number) => serviceCatalogApi.get(`/api/service-catalog/${serviceId}`),
  createService: (service: ServiceCatalogDTO) => serviceCatalogApi.post('/api/service-catalog', service),
  updateService: (serviceId: number, service: ServiceCatalogDTO) =>
    serviceCatalogApi.put(`/api/service-catalog/${serviceId}`, service),
  deactivateService: (serviceId: number) =>
    serviceCatalogApi.put(`/api/service-catalog/${serviceId}/deactivate`),
  getServicesByHospital: (hospitalId: number) =>
    serviceCatalogApi.get(`/api/service-catalog/hospital/${hospitalId}`),
  getServicesByType: (hospitalId: number, serviceType: ServiceType) =>
    serviceCatalogApi.get(`/api/service-catalog/hospital/${hospitalId}/type/${serviceType}`),
  getServicesByCategory: (hospitalId: number, category: ServiceCategory) =>
    serviceCatalogApi.get(`/api/service-catalog/hospital/${hospitalId}/category/${category}`),
  getServicesByDepartment: (departmentId: number) =>
    serviceCatalogApi.get(`/api/service-catalog/department/${departmentId}`),
  searchServices: (query: string) =>
    serviceCatalogApi.get(`/api/service-catalog/search?query=${query}`)
};
