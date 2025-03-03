// src/services/admin/accountService.js
import axios from '../axiosInstance';

const accountService = {
  getAccounts: async (params) => axios.get('/admin/accounts', { params }),
  createAccount: async (formData) => axios.post('/admin/accounts', formData),
  updateAccount: async (accountId, formData) => axios.put(`/admin/accounts/${accountId}`, formData),
  deleteAccount: async (accountId) => axios.delete(`/admin/accounts/${accountId}`),
};

export default accountService;
