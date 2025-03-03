import { useState, useEffect, useCallback } from 'react';
import adminProductService from '../services/admin/adminProductService';

function useProductAdminData(statusFilter, searchTerm) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminProductService.getAdminProducts(statusFilter, searchTerm);
      setProducts(data);
    } catch (err) {
      console.error("useProductAdminData: Error fetching admin products:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}

export default useProductAdminData;
