import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('La variable de entorno NEXT_PUBLIC_API_URL no está definida.');
}

export const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    const isLoginRoute = config.url?.includes('/auth/login');

    if (token && !isLoginRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);
