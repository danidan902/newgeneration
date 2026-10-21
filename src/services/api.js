import axios from 'axios';

const API_URL = 'https://backend-newgeneration.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const newsAPI = {
  createNews: (data) => api.post('/news', data),
  getNews: (role = 'student') => api.get(`/news?role=${role}`),
  getAllNews: () => api.get('/news/all'),
  markAsRead: (id, userId) => api.put(`/news/${id}/read`, { userId }),
  deleteNews: (id) => api.delete(`/news/${id}`),
};

export const userAPI = {
  getUsers: () => api.get('/users'),
  createUser: (data) => api.post('/users', data),
};

export const parentAPI = {
  getParents: () => api.get('/superadmin/parents'),
  createParent: (data) => api.post('/superadmin/create-parent', data),
  getStudents: () => api.get('/users/role/student'),
  linkParentToStudent: (parentId, studentId) => api.post('/admin/link-parent-student', { parentId, studentId }),
  unlinkParentFromStudent: (parentId, studentId) => api.delete('/admin/unlink-parent-student', { data: { parentId, studentId } }),
  resetPassword: (parentId, newPassword) => api.post(`/superadmin/parent/${parentId}/reset-password`, { newPassword }),
  deleteParent: (parentId) => api.delete(`/superadmin/parent/${parentId}`),
};

// ✅ ADD PASSWORD CHANGE API
export const authAPI = {
  changePassword: (currentPassword, newPassword) => 
    api.post('/users/change-password', { currentPassword, newPassword }),
};

export default api;
