// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost/inmobiliaria-api'; // Ajusta según tu configuración

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

// Auth services
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/user/login', credentials);
    if (response.data.ok) {
      localStorage.setItem('token', response.data.data.jwt);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Properties services
export const propertyService = {
  getAll: () => api.get('/properties').then(res => res.data),
  getById: (id) => api.get(`/property/${id}`).then(res => res.data),
  create: (data) => api.post('/property', data).then(res => res.data),
  update: (id, data) => api.put(`/property/${id}`, data).then(res => res.data),
  delete: (id) => api.delete(`/property/${id}`).then(res => res.data),
  uploadImages: (id, formData) => api.post(`/property/${id}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(res => res.data),
};

// Users services
export const userService = {
  getAll: () => api.get('/users').then(res => res.data),
  getById: (id) => api.get(`/user/${id}`).then(res => res.data),
  create: (data) => api.post('/user', data).then(res => res.data),
  delete: (id) => api.delete(`/user/${id}`).then(res => res.data),
};