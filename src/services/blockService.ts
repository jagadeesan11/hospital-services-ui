import { hospitalApi } from './api';

export interface Block {
  id?: number;
  name: string;
  floorNumber: number;
  hospital_id: number;
}

export interface CreateBlockRequest {
  name: string;
  floorNumber: number;
  hospital_id: number;
}

interface GetBlocksParams {
  floor_number?: number;
}

export const blockService = {
  getAllBlocks: () => hospitalApi.get('/api/blocks'),
  getBlock: (id: number) => hospitalApi.get(`/api/blocks/${id}`),
  getBlocksByHospital: (hospitalId: number) => hospitalApi.get(`/api/hospitals/${hospitalId}/blocks`),
  createBlock: (block: CreateBlockRequest) => hospitalApi.post('/api/blocks', block),
  updateBlock: (id: number, block: Block) => hospitalApi.put(`/api/blocks/${id}`, block),
  deleteBlock: (id: number) => hospitalApi.delete(`/api/blocks/${id}`),
};
