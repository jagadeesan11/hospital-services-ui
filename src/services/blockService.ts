import { api } from './api';

export interface Block {
  id?: number;
  name: string;
  floorNumber: number;
  hospital_id: number;
}

interface GetBlocksParams {
  floor_number?: number;
}

export const blockService = {
  getAllBlocks: (hospital_id: number, params?: GetBlocksParams) => api.get(`/api/hospitals/${hospital_id}/blocks`, { params }),
  getBlock: (id: number) => api.get(`/api/blocks/${id}`),
  createBlock: (block: Block) => api.post(`/api/hospitals/${block.hospital_id}/blocks`, block),
  updateBlock: (id: number, block: Block) => api.put(`/api/blocks/${id}`, block),
  deleteBlock: (id: number) => api.delete(`/api/blocks/${id}`),
  getBlocksByHospital: (hospital_id: number) => api.get(`/api/hospitals/${hospital_id}/blocks`),
};
