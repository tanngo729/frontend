// src/utils/apiErrorHandler.js

import { message, notification } from 'antd';

/**
 * Hàm xử lý lỗi API và hiển thị thông báo thích hợp
 * @param {Error} error - Lỗi từ API
 * @param {Object} options - Tùy chọn xử lý lỗi
 * @param {string} options.defaultMessage - Thông báo mặc định khi không có chi tiết lỗi
 * @param {boolean} options.useNotification - Sử dụng notification thay vì message
 * @param {string} options.notificationTitle - Tiêu đề notification (nếu dùng notification)
 * @param {number} options.duration - Thời gian hiển thị thông báo (ms)
 */
export const handleApiError = (error, options = {}) => {
  const {
    defaultMessage = 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
    useNotification = false,
    notificationTitle = 'Lỗi',
    duration = 3,
    logError = true
  } = options;

  // Log error to console
  if (logError) {
    console.error('API Error:', error);
  }

  // Determine error message
  let errorMessage = defaultMessage;

  if (error.response) {
    // Error from server with response
    const responseData = error.response.data;

    if (typeof responseData === 'string') {
      errorMessage = responseData;
    } else if (responseData?.message) {
      errorMessage = responseData.message;
    } else if (responseData?.error) {
      errorMessage = responseData.error;
    } else if (responseData?.errors && Array.isArray(responseData.errors)) {
      // Handle validation errors
      errorMessage = responseData.errors.map(err => err.msg || err.message).join(', ');
    }

    // Handle specific status codes
    switch (error.response.status) {
      case 401:
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        break;
      case 403:
        errorMessage = 'Bạn không có quyền thực hiện thao tác này.';
        break;
      case 404:
        errorMessage = 'Không tìm thấy dữ liệu yêu cầu.';
        break;
      case 429:
        errorMessage = 'Quá nhiều yêu cầu. Vui lòng thử lại sau.';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
        break;
      default:
        // Use the custom message or fallback to default
        break;
    }
  } else if (error.request) {
    // Request made but no response received
    errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
  } else {
    // Error in setting up the request
    errorMessage = error.message || defaultMessage;
  }

  // Display error message
  if (useNotification) {
    notification.error({
      message: notificationTitle,
      description: errorMessage,
      duration: duration
    });
  } else {
    message.error({
      content: errorMessage,
      duration: duration
    });
  }

  // Return the error message for further handling if needed
  return errorMessage;
};

/**
 * Trình bao bọc hàm API để xử lý lỗi tự động
 * @param {Function} apiFunction - Hàm API cần gọi
 * @param {Object} errorOptions - Tùy chọn xử lý lỗi
 * @returns {Promise} Kết quả từ API hoặc null nếu có lỗi
 */
export const withErrorHandling = async (apiFunction, errorOptions = {}) => {
  try {
    return await apiFunction();
  } catch (error) {
    handleApiError(error, errorOptions);
    return null;
  }
};

export default {
  handleApiError,
  withErrorHandling
};