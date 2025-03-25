import axios from './adminAxiosInstance';

const logService = {
  getLogs: async () => axios.get('/admin/logs'),
};

export default logService;