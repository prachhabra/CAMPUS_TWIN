import api from './api';

export const attendanceService = {
  getMyAttendance: async () => {
    const res = await api.get('/attendance/my-attendance');
    return res.data;
  },

  checkIn: async (code) => {
    const res = await api.post('/attendance/check-in', { code });
    return res.data;
  },

  createSession: async (data) => {
    const res = await api.post('/attendance/session', data);
    return res.data;
  },

  markManual: async (data) => {
    const res = await api.post('/attendance/mark', data);
    return res.data;
  },

  getTeacherHistory: async (params) => {
    const res = await api.get('/attendance/teacher-history', { params });
    return res.data;
  },

  getAllAdmin: async (params) => {
    const res = await api.get('/attendance/all', { params });
    return res.data;
  }
};
