import api from './api';

export const complaintService = {
  getComplaints: async (params) => {
    const res = await api.get('/complaints', { params });
    return res.data;
  },

  getComplaintById: async (id) => {
    const res = await api.get(`/complaints/${id}`);
    return res.data;
  },

  createComplaint: async (data) => {
    const res = await api.post('/complaints', data);
    return res.data;
  },

  updateStatus: async (id, data) => {
    const res = await api.put(`/complaints/${id}/status`, data);
    return res.data;
  },

  addComment: async (id, text) => {
    const res = await api.post(`/complaints/${id}/comment`, { text });
    return res.data;
  }
};
