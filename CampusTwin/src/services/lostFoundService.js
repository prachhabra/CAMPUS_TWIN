import api from './api';

export const lostFoundService = {
  getItems: async (params) => {
    const res = await api.get('/lostfound', { params });
    return res.data;
  },

  getItemById: async (id) => {
    const res = await api.get(`/lostfound/${id}`);
    return res.data;
  },

  createItem: async (data) => {
    const res = await api.post('/lostfound', data);
    return res.data;
  },

  updateStatus: async (id, status) => {
    const res = await api.put(`/lostfound/${id}/status`, { status });
    return res.data;
  },

  deleteItem: async (id) => {
    const res = await api.delete(`/lostfound/${id}`);
    return res.data;
  }
};
