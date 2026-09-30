import api from './api';

export const achievementService = {
  getMyAchievements: async () => {
    const res = await api.get('/achievements/my');
    return res.data;
  },

  getAllAchievements: async () => {
    const res = await api.get('/achievements/all');
    return res.data;
  },

  createAchievement: async (data) => {
    const res = await api.post('/achievements', data);
    return res.data;
  }
};
