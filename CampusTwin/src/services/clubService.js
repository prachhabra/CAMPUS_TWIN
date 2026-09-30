import api from './api';

export const clubService = {
  getClubs: async (params) => {
    const res = await api.get('/clubs', { params });
    return res.data;
  },

  getClubById: async (id) => {
    const res = await api.get(`/clubs/${id}`);
    return res.data;
  },

  createClub: async (data) => {
    const res = await api.post('/clubs', data);
    return res.data;
  },

  updateClub: async (id, data) => {
    const res = await api.put(`/clubs/${id}`, data);
    return res.data;
  },

  deleteClub: async (id) => {
    const res = await api.delete(`/clubs/${id}`);
    return res.data;
  },

  joinClub: async (id) => {
    const res = await api.post(`/clubs/${id}/join`);
    return res.data;
  },

  leaveClub: async (id) => {
    const res = await api.post(`/clubs/${id}/leave`);
    return res.data;
  }
};
