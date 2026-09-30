import api from './api';

export const campusService = {
  getLocations: async (params) => {
    const res = await api.get('/campus', { params });
    return res.data;
  },

  getLocationById: async (id) => {
    const res = await api.get(`/campus/${id}`);
    return res.data;
  },

  createLocation: async (data) => {
    const res = await api.post('/campus', data);
    return res.data;
  },

  updateLocation: async (id, data) => {
    const res = await api.put(`/campus/${id}`, data);
    return res.data;
  },

  deleteLocation: async (id) => {
    const res = await api.delete(`/campus/${id}`);
    return res.data;
  }
};
