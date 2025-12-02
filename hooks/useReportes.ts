import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { DashboardEjecutivo } from '@/lib/reportes/types';
import { AxiosError } from 'axios';

interface FiltrosReporte {
  fechaInicio?: string;
  fechaFin?: string;
}

interface ApiErrorResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

export const useReportes = () => {
  const [dashboard, setDashboard] = useState<DashboardEjecutivo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtener datos del dashboard ejecutivo
   */
  const obtenerDashboard = async () => {
    setIsLoadingDashboard(true);
    setError(null);
    try {
      const response = await apiClient.get<DashboardEjecutivo>('/reports-module/dashboard');
      console.log(response)
      setDashboard(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      let errorMsg = 'Error al obtener el dashboard';
      
      if (error.response?.data?.message) {
        errorMsg = Array.isArray(error.response.data.message)
          ? error.response.data.message.join(', ')
          : error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.message) {
        errorMsg = error.message;
      }

      setError(errorMsg);
      console.error('Error al obtener dashboard:', err);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  /**
   * Descargar reporte de detalle de capacitaciones en Excel
   */
  const descargarReporteDetalleCapacitaciones = async (filtros?: FiltrosReporte) => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (filtros?.fechaInicio) params.fechaInicio = filtros.fechaInicio;
      if (filtros?.fechaFin) params.fechaFin = filtros.fechaFin;

      const response = await apiClient.get('/reports-module/detalle-capacitaciones/excel', {
        params,
        responseType: 'blob',
      });

      // Crear blob y descargar
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;

      // Obtener nombre del archivo del header Content-Disposition
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'Detalle_Capacitaciones.xlsx';

      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1].replace(/['"]/g, '');
        }
      }

      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return { success: true };
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      let errorMsg = 'Error al descargar el reporte';
      
      if (error.response?.data) {
        // Si el error viene como blob, intentar parsearlo
        if (error.response.data instanceof Blob) {
          try {
            const text = await error.response.data.text();
            const jsonError = JSON.parse(text);
            errorMsg = jsonError.message || errorMsg;
          } catch {
            errorMsg = 'Error al descargar el reporte';
          }
        } else if (typeof error.response.data === 'object') {
          const data = error.response.data as ApiErrorResponse;
          if (data.message) {
            errorMsg = Array.isArray(data.message)
              ? data.message.join(', ')
              : data.message;
          } else if (data.error) {
            errorMsg = data.error;
          }
        }
      } else if (error.message) {
        errorMsg = error.message;
      }

      setError(errorMsg);
      console.error('Error al descargar reporte:', err);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Descargar reporte de cumplimiento de colaboradores en Excel
   */
  const descargarReporteCumplimientoColaboradores = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/reports-module/cumplimiento-colaboradores/excel', {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;

      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'Cumplimiento_Colaboradores.xlsx';

      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1].replace(/['"]/g, '');
        }
      }

      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return { success: true };
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      let errorMsg = 'Error al descargar el reporte';
      
      if (error.response?.data) {
        if (error.response.data instanceof Blob) {
          try {
            const text = await error.response.data.text();
            const jsonError = JSON.parse(text);
            errorMsg = jsonError.message || errorMsg;
          } catch {
            errorMsg = 'Error al descargar el reporte';
          }
        } else if (typeof error.response.data === 'object') {
          const data = error.response.data as ApiErrorResponse;
          if (data.message) {
            errorMsg = Array.isArray(data.message)
              ? data.message.join(', ')
              : data.message;
          } else if (data.error) {
            errorMsg = data.error;
          }
        }
      } else if (error.message) {
        errorMsg = error.message;
      }

      setError(errorMsg);
      console.error('Error al descargar reporte:', err);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Obtener datos JSON de detalle de capacitaciones
   */
  const obtenerDetalleCapacitaciones = async (filtros?: FiltrosReporte) => {
    try {
      const params: Record<string, string> = {};
      if (filtros?.fechaInicio) params.fechaInicio = filtros.fechaInicio;
      if (filtros?.fechaFin) params.fechaFin = filtros.fechaFin;

      const response = await apiClient.get('/reports-module/detalle-capacitaciones', {
        params,
      });

      return { success: true, data: response.data };
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      let errorMsg = 'Error al obtener detalle de capacitaciones';
      
      if (error.response?.data?.message) {
        errorMsg = Array.isArray(error.response.data.message)
          ? error.response.data.message.join(', ')
          : error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.message) {
        errorMsg = error.message;
      }

      console.error('Error:', err);
      return { success: false, error: errorMsg };
    }
  };

  /**
   * Obtener datos JSON de cumplimiento de colaboradores
   */
  const obtenerCumplimientoColaboradores = async () => {
    try {
      const response = await apiClient.get('/reports-module/cumplimiento-colaboradores');
      return { success: true, data: response.data };
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      let errorMsg = 'Error al obtener cumplimiento de colaboradores';
      
      if (error.response?.data?.message) {
        errorMsg = Array.isArray(error.response.data.message)
          ? error.response.data.message.join(', ')
          : error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.message) {
        errorMsg = error.message;
      }

      console.error('Error:', err);
      return { success: false, error: errorMsg };
    }
  };

  useEffect(() => {
    obtenerDashboard();
  }, []);

  return {
    dashboard,
    isLoading,
    isLoadingDashboard,
    error,
    obtenerDashboard,
    descargarReporteDetalleCapacitaciones,
    descargarReporteCumplimientoColaboradores,
    obtenerDetalleCapacitaciones,
    obtenerCumplimientoColaboradores,
  };
};
