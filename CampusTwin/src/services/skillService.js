import api from './api';

export const skillService = {
  getSkills: async (params) => {
    const res = await api.get('/skills', { params });
    return res.data;
  },

  createSkill: async (data) => {
    const res = await api.post('/skills', data);
    return res.data;
  },

  updateSkill: async (id, data) => {
    const res = await api.put(`/skills/${id}`, data);
    return res.data;
  },

  deleteSkill: async (id) => {
    const res = await api.delete(`/skills/${id}`);
    return res.data;
  },

  connect: async (id, message) => {
    const res = await api.post(`/skills/${id}/connect`, { message });
    return res.data;
  }
};
