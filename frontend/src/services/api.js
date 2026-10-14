import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== Auth APIs =====
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// ===== Project APIs =====
export const getProjects = (params) => api.get('/projects', { params });
export const getProjectById = (id) => api.get(`/projects/${id}`);
export const createProject = (data) => api.post('/projects', data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// ===== API Document APIs =====
export const getApiDocs = (projectId, params) =>
  api.get(`/projects/${projectId}/apis`, { params });
export const getApiDocById = (projectId, id) =>
  api.get(`/projects/${projectId}/apis/${id}`);
export const createApiDoc = (projectId, data) =>
  api.post(`/projects/${projectId}/apis`, data);
export const updateApiDoc = (projectId, id, data) =>
  api.put(`/projects/${projectId}/apis/${id}`, data);
export const deleteApiDoc = (projectId, id) =>
  api.delete(`/projects/${projectId}/apis/${id}`);

export default api;
