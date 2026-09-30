import api from './api';

export const chatService = {
  getConversations: async () => {
    const res = await api.get('/chat/conversations');
    return res.data;
  },

  getMessages: async (conversationId) => {
    const res = await api.get(`/chat/messages/${conversationId}`);
    return res.data;
  },

  sendMessage: async (data) => {
    const res = await api.post('/chat/messages', data);
    return res.data;
  },

  getContacts: async (params) => {
    const res = await api.get('/chat/users', { params });
    return res.data;
  }
};
