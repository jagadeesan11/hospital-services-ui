import { hospitalApi } from './api';

export interface Block {
  id?: number;
  name: string;
  floorNumber?: number;
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
}

export interface CreateBlockRequest {
  name: string;
  hospital_id: number;
}

interface GetBlocksParams {
  floor_number?: number;
}

export const blockService = {
  getAllBlocks: () => hospitalApi.get('/api/blocks'),
  getBlock: (id: number) => hospitalApi.get(`/api/blocks/${id}`),
  getBlocksByHospital: (hospitalId: number) => hospitalApi.get(`/api/hospitals/${hospitalId}/blocks`),
  createBlock: (hospitalId: number, block: CreateBlockRequest) => hospitalApi.post(`/api/hospitals/${hospitalId}/blocks`, block),
  updateBlock: (id: number, block: Block) => hospitalApi.put(`/api/blocks/${id}`, block),
  deleteBlock: (id: number) => hospitalApi.delete(`/api/blocks/${id}`),
};
