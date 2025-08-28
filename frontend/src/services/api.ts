import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Sửa lại nếu backend chạy cổng khác
});

// Gắn token vào header nếu có
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default api; 