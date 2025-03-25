import axios from 'axios';
import { message } from 'antd';
import API_URL from '../../config/api';

// Hàm bổ trợ để theo dõi các lần retry của request
const pendingRetries = new Map();

const adminInstance = axios.create({
  baseURL: API_URL.base,
  timeout: 30000, // Tăng timeout lên 30 giây
});

adminInstance.interceptors.request.use(
  (config) => {
    // Thêm tiền tố /admin nếu chưa có và URL không bắt đầu bằng /admin/
    if (!config.url.startsWith('/admin/') && !config.url.startsWith('/admin')) {
      config.url = `/admin${config.url}`;
    }

    // Gắn token vào header
    const adminToken = sessionStorage.getItem('adminToken');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }

    // Thêm id cho mỗi request để theo dõi retry
    if (!config.id) {
      config.id = Date.now().toString();
    }

    return config;
  },
  (error) => Promise.reject(error)
);

adminInstance.interceptors.response.use(
  (response) => {
    // Xóa request này khỏi danh sách retry nếu thành công
    if (response.config.id) {
      pendingRetries.delete(response.config.id);
    }
    return response;
  },
  async (error) => {
    // Lấy thông tin request gốc
    const originalConfig = error.config || {};
    const requestId = originalConfig.id;

    console.error('Lỗi chi tiết từ API:', error.message);

    // ---- Xử lý timeout ----
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      // Thiết lập số lần retry và đếm
      const MAX_RETRIES = 2;
      const currentRetry = pendingRetries.get(requestId) || 0;

      // Nếu chưa vượt quá số lần retry cho phép
      if (currentRetry < MAX_RETRIES) {
        // Tăng số lần retry và lưu lại
        pendingRetries.set(requestId, currentRetry + 1);

        console.log(`Request timeout, đang thử lại lần ${currentRetry + 1}/${MAX_RETRIES}`);

        // Tạo config cho lần retry với timeout cao hơn
        const retryConfig = {
          ...originalConfig,
          timeout: originalConfig.timeout * 1.5, // Tăng 50% thời gian timeout
        };

        // Hiển thị thông báo cho người dùng
        message.info(`Kết nối chậm, đang thử lại... (${currentRetry + 1}/${MAX_RETRIES})`);

        // Thực hiện request mới
        return adminInstance(retryConfig);
      } else {
        // Đã hết số lần retry
        pendingRetries.delete(requestId);
        message.error('Kết nối quá chậm. Vui lòng kiểm tra mạng và thử lại sau.');
      }
    }

    // ---- Xử lý lỗi 401 (Unauthorized) ----
    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem('adminToken');
      message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      window.location.href = '/admin/auth/login';
    }

    // ---- Xử lý các lỗi khác ----
    if (error.response && error.response.data && error.response.data.message) {
      message.error(error.response.data.message);
    } else if (error.code === 'ECONNABORTED') {
      // Thông báo timeout đã được xử lý ở trên
    } else if (error.message && !error.message.includes('timeout')) {
      // Hiển thị lỗi khác (nhưng không hiển thị lại lỗi timeout)
      message.error(`Lỗi: ${error.message}`);
    }

    return Promise.reject(error);
  }
);

export default adminInstance;