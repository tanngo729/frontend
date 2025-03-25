import { useState, useEffect, useCallback, useRef } from 'react';
import adminProductService from '../services/admin/adminProductService';

function useProductAdminData(statusFilter, searchTerm) {
  const [state, setState] = useState({
    products: [],
    loading: false,
    error: null
  });

  // Use AbortController to cancel pending requests
  const abortControllerRef = useRef(null);

  const fetchProducts = useCallback(async () => {
    try {
      // Luôn đặt trạng thái loading trước
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Cancel previous request if exists (cách này vẫn hoạt động, không phải bug)
      if (abortControllerRef.current) {
        console.log('Canceling previous request (this is normal)');
        abortControllerRef.current.abort();
      }

      // Create new AbortController
      abortControllerRef.current = new AbortController();

      console.log(`Fetching products with filter: ${statusFilter}, search: ${searchTerm}`);
      const data = await adminProductService.getAdminProducts(
        statusFilter,
        searchTerm,
        abortControllerRef.current.signal
      );

      console.log(`Received ${data?.length || 0} products`);
      setState(prev => ({
        ...prev,
        products: data || [],
        loading: false
      }));
    } catch (err) {
      // Bỏ qua lỗi nếu request bị hủy (đây là hành vi bình thường)
      if (err.name === 'AbortError' || err.name === 'CanceledError') {
        console.log('Request was canceled intentionally');
        return;
      }

      console.error("useProductAdminData: Error fetching admin products:", err);
      setState(prev => ({
        ...prev,
        error: err,
        loading: false,
        products: [] // Reset products on error
      }));
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    fetchProducts();

    // Cleanup function to cancel pending requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProducts]);

  // Debounce refetch to prevent rapid consecutive calls
  const debouncedRefetch = useCallback((() => {
    let timeoutId;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log('Performing debounced refetch');
        fetchProducts();
      }, 300);
    };
  })(), [fetchProducts]);

  return {
    ...state,
    refetch: debouncedRefetch
  };
}

export default useProductAdminData;