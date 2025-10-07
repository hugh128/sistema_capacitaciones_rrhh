import axios, { type AxiosResponse, type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_URL = 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    
    const isLoginRoute = config.url?.includes('/auth/login');
    
    if (token && !isLoginRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.error("Token expirado o no autorizado. Redirigiendo a login...");
      
      localStorage.removeItem('access_token');
      localStorage.removeItem('training_user');
      
      window.location.href = '/login'; 
    }
    
    return Promise.reject(error);
  }
);