import api from './api';

export const confessionService = {
  getApproved: async (params) => {
    const res = await api.get('/confessions', { params });
    return res.data;
  },

  getAdminList: async (params) => {
    const res = await api.get('/confessions/admin', { params });
    return res.data;
  },

  create: async (data) => {
    const res = await api.post('/confessions', data);
    return res.data;
  },

  toggleLike: async (id) => {
    const res = await api.post(`/confessions/${id}/like`);
    return res.data;
  },

  updateStatus: async (id, status) => {
    const res = await api.put(`/confessions/${id}/status`, { status });
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/confessions/${id}`);
    return res.data;
  }
};
