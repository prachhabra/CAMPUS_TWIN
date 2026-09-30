import api from './api';

export const placementService = {
  getPlacements: async (params) => {
    const res = await api.get('/placements', { params });
    return res.data;
  },

  createPlacement: async (data) => {
    const res = await api.post('/placements', data);
    return res.data;
  },

  updatePlacement: async (id, data) => {
    const res = await api.put(`/placements/${id}`, data);
    return res.data;
  },

  deletePlacement: async (id) => {
    const res = await api.delete(`/placements/${id}`);
    return res.data;
  }
};
