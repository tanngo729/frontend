// src/utils/formatters.js
import moment from 'moment';
import 'moment/locale/vi'; // Import Vietnamese locale

/**
 * Format a monetary amount to Vietnamese currency
 * 
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return 'N/A';
  return amount.toLocaleString('vi-VN') + 'đ';
};

/**
 * Format a date to Vietnamese format
 * 
 * @param {string|Date} dateString - Date to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return moment(dateString).format('DD/MM/YYYY HH:mm');
};

/**
 * Format a short date (without time)
 * 
 * @param {string|Date} dateString - Date to format
 * @returns {string} - Formatted date string without time
 */
export const formatShortDate = (dateString) => {
  if (!dateString) return 'N/A';
  return moment(dateString).format('DD/MM/YYYY');
};

/**
 * Get relative time from now
 * 
 * @param {string|Date} dateString - Date to format
 * @returns {string} - Relative time from now
 */
export const fromNow = (dateString) => {
  if (!dateString) return 'N/A';
  return moment(dateString).fromNow();
};