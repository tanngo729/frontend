const API_URL = {
  base: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  admin: '/admin'
};

console.log("API_URL:", API_URL.base);

export default API_URL;
