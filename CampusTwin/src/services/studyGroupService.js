import api from './api';

export const studyGroupService = {
  getGroups: async (params) => {
    const res = await api.get('/study-groups', { params });
    return res.data;
  },

  getGroupById: async (id) => {
    const res = await api.get(`/study-groups/${id}`);
    return res.data;
  },

  createGroup: async (data) => {
    const res = await api.post('/study-groups', data);
    return res.data;
  },

  joinGroup: async (id) => {
    const res = await api.post(`/study-groups/${id}/join`);
    return res.data;
  },

  leaveGroup: async (id) => {
    const res = await api.post(`/study-groups/${id}/leave`);
    return res.data;
  },

  deleteGroup: async (id) => {
    const res = await api.delete(`/study-groups/${id}`);
    return res.data;
  }
};
