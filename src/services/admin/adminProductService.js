import axios from './adminAxiosInstance';

const adminProductService = {
  getAdminProducts: async (status, searchTerm, signal) => {
    try {
      console.log(`API Call: getAdminProducts - status:${status}, search:${searchTerm}`);
      const response = await axios.get('/products', {
        params: { status, search: searchTerm },
        signal
      });
      return response.data;
    } catch (error) {
      // Bỏ qua logging cho lỗi hủy request
      if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
        console.error("Error fetching admin products:", error);
      }
      throw error;
    }
  },

  updateProductStatus: async (productId, newStatus) => {
    try {
      console.log(`API Call: updateProductStatus - id:${productId}, status:${newStatus}`);
      const response = await axios.put(`/products/${productId}/status`, { status: newStatus });
      return response.data;
    } catch (error) {
      console.error("Error updating product status:", error);
      throw error;
    }
  },

  updateProductPosition: async (productId, newPosition) => {
    try {
      console.log(`API Call: updateProductPosition - id:${productId}, position:${newPosition}`);
      const response = await axios.put(`/products/${productId}/position`, { position: newPosition });
      return response.data;
    } catch (error) {
      console.error("Error updating product position:", error);
      throw error;
    }
  },

  deleteProduct: async (productId) => {
    try {
      console.log(`API Call: deleteProduct - id:${productId}`);
      const response = await axios.delete(`/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },

  batchDeleteProducts: async (productIds) => {
    try {
      console.log(`API Call: batchDeleteProducts - ids:${productIds.join(',')}`);
      const response = await axios.delete('/products/batch', { data: { productIds } });
      return response.data;
    } catch (error) {
      console.error("Error batch deleting products:", error);
      throw error;
    }
  },

  createProduct: async (formData) => {
    try {
      // Log form data for debugging
      const formDataKeys = [];
      for (let key of formData.keys()) {
        formDataKeys.push(key);
      }
      console.log("API Call: createProduct with form data keys:", formDataKeys);

      // Check if imageFile is properly set
      const imageFile = formData.get('imageFile');
      if (imageFile) {
        console.log("Image file name:", imageFile.name);
        console.log("Image file type:", imageFile.type);
        console.log("Image file size:", imageFile.size);
      }

      const response = await axios.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error creating product:", error);

      // Handle specific error cases
      if (error.code === 'ECONNABORTED') {
        throw new Error('Hết thời gian kết nối. File có thể quá lớn hoặc máy chủ đang bận.');
      }

      // Rethrow the error with more specific message if available
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }

      throw error;
    }
  },

  updateProduct: async (productId, formData) => {
    try {
      console.log(`API Call: updateProduct - id:${productId}`);

      // Kiểm tra xem formData có phải là instance của FormData
      if (!(formData instanceof FormData)) {
        // Nếu không phải FormData, tạo mới FormData từ object
        const newFormData = new FormData();
        Object.keys(formData).forEach(key => {
          newFormData.append(key, formData[key]);
        });
        formData = newFormData;
      }

      // Log form data keys
      const formDataKeys = Array.from(formData.keys());
      console.log("Form data keys:", formDataKeys);

      const response = await axios.put(`/products/${productId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error updating product:", error);

      // Handle specific error cases
      if (error.code === 'ECONNABORTED') {
        throw new Error('Hết thời gian kết nối. File có thể quá lớn hoặc máy chủ đang bận.');
      }

      // Rethrow the error with more specific message if available
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }

      throw error;
    }
  },

  getProductDetail: async (productId) => {
    try {
      console.log("API Call: getProductDetail - id:", productId);

      if (!productId) {
        throw new Error('ID sản phẩm không được để trống');
      }

      // Kiểm tra hợp lệ
      if (!/^[0-9a-fA-F]{24}$/.test(productId)) {
        throw new Error('ID sản phẩm không đúng định dạng');
      }

      // Kiểm tra cache để tránh gọi API liên tục
      const cacheKey = `product_${productId}`;
      const cachedData = sessionStorage.getItem(cacheKey);

      if (cachedData) {
        console.log("Sử dụng dữ liệu trong bộ nhớ đệm");
        return JSON.parse(cachedData);
      }

      const response = await axios.get(`/products/${productId}`);
      console.log("Phản hồi API:", response.status);

      if (response && response.data) {
        sessionStorage.setItem(cacheKey, JSON.stringify(response.data));
        return response.data;
      }

      return null;
    } catch (error) {
      console.error("Error fetching product detail:", error);
      throw error;
    }
  },

  updateProductStock: async (productId, data) => {
    try {
      console.log(`API Call: updateProductStock - id:${productId}, stock:${data.stock}`);
      const response = await axios.put(`/products/${productId}/stock`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating product stock:", error);
      throw error;
    }
  },

  updateProductDiscount: async (productId, data) => {
    try {
      console.log(`API Call: updateProductDiscount - id:${productId}, discount:${data.discountPercentage}`);
      const response = await axios.put(`/products/${productId}/discount`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating product discount:", error);
      throw error;
    }
  },

  // Phương thức riêng để cập nhật trạng thái nổi bật
  updateProductFeatured: async (productId, isFeatured) => {
    try {
      console.log(`API Call: updateProductFeatured - id:${productId}, featured:${isFeatured}`);
      // Gửi dữ liệu dưới dạng JSON thay vì FormData
      const response = await axios.put(`/products/${productId}/featured`, {
        featured: isFeatured
      });
      return response.data;
    } catch (error) {
      console.error("Error updating product featured status:", error);
      throw error;
    }
  },
};

export default adminProductService;