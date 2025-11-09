import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('La variable de entorno NEXT_PUBLIC_API_URL no está definida.');
}

// ========== TIPOS PARA RESPUESTAS DE ERROR ==========
interface ApiErrorResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

// ========== CLIENTE AXIOS ==========
export const apiClient = axios.create({
  baseURL: API_URL,
});

let isRedirecting = false;

// ========== INTERCEPTOR DE REQUEST ==========
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

// ========== INTERCEPTOR DE RESPONSE ==========
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response) {
      const status = error.response.status;
      const responseData = error.response.data;
      
      let message = '';
      if (responseData?.message) {
        message = Array.isArray(responseData.message) 
          ? responseData.message.join(', ') 
          : responseData.message;
      } else if (responseData?.error) {
        message = responseData.error;
      }
      
      const isTokenError = 
        status === 401 && 
        (
          message.toLowerCase().includes('token') ||
          message.toLowerCase().includes('jwt') ||
          message.toLowerCase().includes('expired') ||
          message.toLowerCase().includes('unauthorized') ||
          message.toLowerCase().includes('expirado') ||
          message.toLowerCase().includes('inválido') ||
          message.toLowerCase().includes('no autorizado')
        );

      if (isTokenError && !isRedirecting) {
        isRedirecting = true;
        
        localStorage.removeItem('access_token');
        localStorage.removeItem('training_user');
        
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', {
          duration: 4000,
          position: 'top-center',
        });
        
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
          setTimeout(() => {
            isRedirecting = false;
          }, 1000);
        }, 500);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
