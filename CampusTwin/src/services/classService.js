import api from './api';

export const classService = {
  getTeacherClasses: async () => {
    const res = await api.get('/classes/my-classes');
    return res.data;
  },

  getEnrolledClasses: async () => {
    const res = await api.get('/classes/enrolled');
    return res.data;
  },

  getAllClasses: async (params) => {
    const res = await api.get('/classes', { params });
    return res.data;
  },

  getClassById: async (id) => {
    const res = await api.get(`/classes/${id}`);
    return res.data;
  },

  createClass: async (data) => {
    const res = await api.post('/classes', data);
    return res.data;
  },

  updateClass: async (id, data) => {
    const res = await api.put(`/classes/${id}`, data);
    return res.data;
  },

  deleteClass: async (id) => {
    const res = await api.delete(`/classes/${id}`);
    return res.data;
  },

  enrollStudent: async (classId, studentId) => {
    const res = await api.post(`/classes/${classId}/enroll`, { studentId });
    return res.data;
  },

  removeStudent: async (classId, studentId) => {
    const res = await api.delete(`/classes/${classId}/students/${studentId}`);
    return res.data;
  }
};
