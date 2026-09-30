import api from './api';

export const eventService = {
  getEvents: async (params) => {
    const res = await api.get('/events', { params });
    return res.data;
  },

  getEventById: async (id) => {
    const res = await api.get(`/events/${id}`);
    return res.data;
  },

  createEvent: async (data) => {
    const res = await api.post('/events', data);
    return res.data;
  },

  updateEvent: async (id, data) => {
    const res = await api.put(`/events/${id}`, data);
    return res.data;
  },

  deleteEvent: async (id) => {
    const res = await api.delete(`/events/${id}`);
    return res.data;
  },

  register: async (id) => {
    const res = await api.post(`/events/${id}/register`);
    return res.data;
  },

  cancelRegistration: async (id) => {
    const res = await api.post(`/events/${id}/cancel-registration`);
    return res.data;
  }
};
