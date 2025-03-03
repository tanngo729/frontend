import axios from '../axiosInstance';

const logService = {
  getLogs: async () => axios.get('/admin/logs'),
};

export default logService;
