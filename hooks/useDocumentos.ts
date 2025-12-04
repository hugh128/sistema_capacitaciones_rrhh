import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/lib/api-client';
import type { PlantillaDocumento, UploadPlantillaRequest, UpdatePlantillaRequest, ActivarPlantillaRequest } from '@/lib/documentos/types';
import type { UsuarioLogin } from '@/lib/auth';
import { handleApiError } from '@/utils/error-handler';

export function useDocumentos(user: UsuarioLogin | null) {
  const [plantillas, setPlantillas] = useState<PlantillaDocumento[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  const fetchPlantillas = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data } = await apiClient.get<PlantillaDocumento[]>('/plantillas-module');
      
      const plantillasFormateadas = data.map(p => ({
        ...p,
        TAMANIO_FORMATEADO: formatFileSize(p.TAMANIO_BYTES)
      }));
      
      setPlantillas(plantillasFormateadas);
    } catch (error) {
      const baseMessage = "Error al cargar documentos.";
      handleApiError(error, baseMessage)
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const uploadPlantilla = useCallback(async (
    formData: UploadPlantillaRequest,
    archivo: File
  ): Promise<boolean> => {
    if (!user) return false;

    setIsMutating(true);
    try {
      const form = new FormData();
      form.append('archivo', archivo);
      form.append('NOMBRE_DISPLAY', formData.NOMBRE_DISPLAY);
      if (formData.DESCRIPCION) form.append('DESCRIPCION', formData.DESCRIPCION);
      if (formData.NOTAS) form.append('NOTAS', formData.NOTAS);
      form.append('CREADO_POR', user.USERNAME);

      await apiClient.post('/plantillas-module/upload', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Plantilla cargada exitosamente');
      await fetchPlantillas();
      return true;
    } catch (error) {
      const baseMessage = "Error al cargar plantilla";
      handleApiError(error, baseMessage)
      return false;
    } finally {
      setIsMutating(false);
    }
  }, [user, fetchPlantillas]);

  const updatePlantilla = useCallback(async (
    request: UpdatePlantillaRequest,
    nuevoArchivo?: File
  ): Promise<boolean> => {
    if (!user) return false;

    setIsMutating(true);
    try {
      if (nuevoArchivo) {
        const form = new FormData();
        form.append('archivo', nuevoArchivo);
        if (request.NOMBRE_DISPLAY) form.append('NOMBRE_DISPLAY', request.NOMBRE_DISPLAY);
        if (request.DESCRIPCION) form.append('DESCRIPCION', request.DESCRIPCION);
        if (request.NOTAS) form.append('NOTAS', request.NOTAS);
        form.append('MODIFICADO_POR', user.USERNAME);

        await apiClient.put(`/plantillas-module/${request.ID_PLANTILLA}/replace`, form, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        await apiClient.put(`/plantillas-module/${request.ID_PLANTILLA}`, {
          ...request,
          MODIFICADO_POR: user.USERNAME
        });
      }

      toast.success('Plantilla actualizada exitosamente');
      await fetchPlantillas();
      return true;
    } catch (error) {
      const baseMessage = "Error al actualizar plantilla";
      handleApiError(error, baseMessage)
      return false;
    } finally {
      setIsMutating(false);
    }
  }, [user, fetchPlantillas]);

  const activarPlantilla = useCallback(async (idPlantilla: number): Promise<boolean> => {
    if (!user) return false;

    setIsMutating(true);
    try {
      await apiClient.post(`/plantillas-module/${idPlantilla}/activar`, {
        MODIFICADO_POR: user.USERNAME
      } as ActivarPlantillaRequest);

      toast.success('Plantilla activada como predeterminada');
      await fetchPlantillas();
      return true;
    } catch (error) {
      const baseMessage = "Error al activar plantilla";
      handleApiError(error, baseMessage)
      return false;
    } finally {
      setIsMutating(false);
    }
  }, [user, fetchPlantillas]);

  const cambiarEstado = useCallback(async (
    idPlantilla: number, 
    nuevoEstado: 'BORRADOR' | 'ACTIVO' | 'OBSOLETO'
  ): Promise<boolean> => {
    if (!user) return false;

    setIsMutating(true);
    try {
      await apiClient.patch(`/plantillas-module/${idPlantilla}/estado`, {
        ESTADO: nuevoEstado,
        MODIFICADO_POR: user.USERNAME
      });

      const mensajes = {
        BORRADOR: 'Plantilla marcada como borrador',
        ACTIVO: 'Plantilla activada',
        OBSOLETO: 'Plantilla marcada como obsoleta'
      };

      toast.success(mensajes[nuevoEstado]);
      await fetchPlantillas();
      return true;
    } catch (error) {
      const baseMessage = "Error al cambiar estado";
      handleApiError(error, baseMessage)
      return false;
    } finally {
      setIsMutating(false);
    }
  }, [user, fetchPlantillas]);

  const deletePlantilla = useCallback(async (idPlantilla: number): Promise<boolean> => {
    if (!user) return false;

    setIsMutating(true);
    try {
      await apiClient.delete(`/plantillas-module/${idPlantilla}`);

      toast.success('Plantilla eliminada exitosamente');
      await fetchPlantillas();
      return true;
    } catch (error) {
      const baseMessage = "Error al eliminar plantilla";
      handleApiError(error, baseMessage)
      return false;
    } finally {
      setIsMutating(false);
    }
  }, [user, fetchPlantillas]);

  const descargarPlantilla = useCallback(async (id: number): Promise<string | undefined> => {
    if (!user) {
      return undefined;
    }

    try {
      const { data } = await apiClient.get(`/plantillas-module/descargar/${id}`);
      if (data?.url) {
        return data.url
      } else {
        toast.error("No se pudo generar la URL de la plantilla.");
        throw new Error("No se pudo generar la URL de descarga.");
      }
    } catch (err) {
      handleApiError(err, "Error al descargar la plantilla.");
      throw err;
    }
  }, [user]);
  
  const descargarPlantillaPredeterminada = useCallback(async (): Promise<string | undefined> => {
    if (!user) {
      return undefined;
    }

    try {
      const { data } = await apiClient.get(`/plantillas-module/descargar/plantilla/predeterminada`);
      if (data?.url) {
        return data.url
      } else {
        toast.error("No se pudo generar la URL de la plantilla predeterminada.");
        throw new Error("No se pudo generar la URL de descarga.");
      }
    } catch (err) {
      handleApiError(err, "Error al descargar la plantilla predeterminada.");
      throw err;
    }
  }, [user]);

  return {
    plantillas,
    isLoading,
    isMutating,
    fetchPlantillas,
    uploadPlantilla,
    updatePlantilla,
    activarPlantilla,
    cambiarEstado,
    deletePlantilla,
    descargarPlantilla,
    descargarPlantillaPredeterminada,
  };
}

// Utilidad para formatear tamaño de archivo
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
