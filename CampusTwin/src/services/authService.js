import api from './api';

export const authService = {
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },

  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get('/users/profile');
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await api.put('/users/profile', data);
    return res.data;
  },

  verifyDigitalId: async (id) => {
    const res = await api.get(`/users/verify/${id}`);
    return res.data;
  }
};
