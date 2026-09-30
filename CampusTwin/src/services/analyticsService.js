import api from './api';

export const analyticsService = {
  getStudentAnalytics: async () => {
    const res = await api.get('/analytics/student');
    return res.data;
  },

  getTeacherAnalytics: async () => {
    const res = await api.get('/analytics/teacher');
    return res.data;
  },

  getAdminAnalytics: async () => {
    const res = await api.get('/analytics/admin');
    return res.data;
  }
};
