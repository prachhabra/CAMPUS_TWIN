import api from './api';

export const marketplaceService = {
  getProducts: async (params) => {
    const res = await api.get('/products', { params });
    return res.data;
  },

  getProductById: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },

  createProduct: async (data) => {
    const res = await api.post('/products', data);
    return res.data;
  },

  updateProduct: async (id, data) => {
    const res = await api.put(`/products/${id}`, data);
    return res.data;
  },

  deleteProduct: async (id) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  }
};
