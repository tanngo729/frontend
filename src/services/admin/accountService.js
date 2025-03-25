import axios from './adminAxiosInstance';

const accountService = {
  getAccounts: async (params) => {
    try {
      const response = await axios.get('/accounts', { params });
      // Kiểm tra cấu trúc dữ liệu trả về
      if (!response.data) {
        throw new Error('Không có dữ liệu trả về từ API');
      }
      return response;
    } catch (error) {
      console.error("Lỗi khi lấy tài khoản:", error);
      throw error;
    }
  },

  createAccount: async (formData) => {
    try {
      const response = await axios.post('/accounts', formData);
      return response;
    } catch (error) {
      console.error("Lỗi khi tạo tài khoản:", error);
      throw error;
    }
  },

  updateAccount: async (accountId, formData) => {
    try {
      const response = await axios.put(`/accounts/${accountId}`, formData);
      return response;
    } catch (error) {
      console.error("Lỗi khi cập nhật tài khoản:", error);
      throw error;
    }
  },

  deleteAccount: async (accountId) => {
    try {
      const response = await axios.delete(`/accounts/${accountId}`);
      return response;
    } catch (error) {
      console.error("Lỗi khi xóa tài khoản:", error);
      throw error;
    }
  },
};

export default accountService;