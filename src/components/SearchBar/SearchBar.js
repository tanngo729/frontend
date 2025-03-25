import React, { useEffect, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import productService from '../../services/client/productService';

const SearchBar = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialQuery = new URLSearchParams(location.search).get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [options, setOptions] = useState([]); // Khai báo state options

  useEffect(() => {
    const currentQuery = new URLSearchParams(location.search).get('q') || '';
    setQuery(currentQuery);
  }, [location.search]);

  const fetchSuggestions = async (value) => {
    if (!value) {
      setOptions([]);
      return;
    }
    try {
      const suggestions = await productService.getSearchSuggestions(value);
      const newOptions = suggestions.map((item) => ({ value: item.name }));
      setOptions(newOptions);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    }
  };

  const handleSearch = (value) => {
    setQuery(value);
    fetchSuggestions(value);
  };

  const handleSubmit = () => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className={className}>
      <input
        className="search-input"
        type="text"
        placeholder="Tìm kiếm sản phẩm..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          handleSearch(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit();
        }}
      />
      <button
        className="search-button"
        onClick={handleSubmit}
        aria-label="Search"
      >
        <SearchOutlined />
      </button>
    </div>
  );
};

export default SearchBar;
