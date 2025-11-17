import { apiClient } from "@/lib/api-client";
import { UsuarioLogin } from "@/lib/auth";
import { Colaborador, InduccionDocumental } from "@/lib/colaboradores/type";
import { handleApiError } from "@/utils/error-handler";
import { AxiosError } from "axios";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";

export function useColaboradores(user: UsuarioLogin | null) {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const obtenerColaboradores = useCallback(
    async (idEncargado?: number) => {
      if (!user) {
        setColaboradores([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data } = await apiClient.get<Colaborador[]>('/colaboradores', {
          params: idEncargado ? { idEncargado } : undefined,
        });

        setColaboradores(data);
      } catch (err) {
        const baseMessage = "Error al cargar colaboradores.";
        setError(baseMessage);
        handleApiError(err, baseMessage);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const obtenerCapacitacionesColaborador = useCallback(async (idColaborador: number) => {  
    if (!user) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      const { data } = await apiClient.get(`/colaboradores/${idColaborador}/capacitaciones`);
      return data;
    } catch (err) {
      const baseMessage = "Error al obtener capacitaciones.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    }
  }, [user]);

  const obtenerDocumentosColaborador = useCallback(async (idColaborador: number) => {  
    if (!user) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      const { data } = await apiClient.get(`/colaboradores/${idColaborador}/documentos`);
      return data;
    } catch (err) {
      const baseMessage = "Error al obtener documentos.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    }
  }, [user]);

  const obtenerHistorialColaborador = useCallback(async (idColaborador: number) => {  
    if (!user) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      const { data } = await apiClient.get(`/colaboradores/${idColaborador}/historial`);
      return data;
    } catch (err) {
      const baseMessage = "Error al obtener historial.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    }
  }, [user]);

  const obtenerResumenColaborador = useCallback(async (idColaborador: number) => {  
    if (!user) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      const { data } = await apiClient.get(`/colaboradores/${idColaborador}/resumen`);
      return data;
    } catch (err) {
      const baseMessage = "Error al obtener resumen.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    }
  }, [user]);
    
  const obtenerDetallePlanColaborador = useCallback(async (idColaborador: number) => {  
    if (!user) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      const { data } = await apiClient.get(`/colaboradores/${idColaborador}/detalle-plan`);
      return data;
    } catch (err) {
      const baseMessage = "Error al obtener detalle del plan.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    }
  }, [user]);

  const descargarListaAsistencia = useCallback(async (idSesion: number): Promise<string> => {
    try {
      const { data } = await apiClient.get(`/capacitaciones/${idSesion}/lista-asistencia/descargar`);
      if (data?.url) {
        return data.url;
      } else {
        toast.error("No se pudo generar la URL de descarga.");
        throw new Error("No se pudo generar la URL de descarga.");
      }
    } catch (err) {
      handleApiError(err, "Error al descargar la lista de asistencia.");
      throw err;
    }
  }, []);

  const descargarExamen = useCallback(async (idSesion: number, idColaborador: number): Promise<string> => {
    try {
      const { data } = await apiClient.get(
        `/capacitaciones/${idSesion}/colaboradores/${idColaborador}/examen/descargar`
      );
      if (data?.url) {
        return data.url
      } else {
        toast.error("No se pudo generar la URL del examen.");
        throw new Error("No se pudo generar la URL de descarga.");
      }
    } catch (err) {
      handleApiError(err, "Error al descargar el examen.");
      throw err;
    }
  }, []);

  const descargarDiploma = useCallback(async (idSesion: number, idColaborador: number): Promise<string> => {
    try {
      const { data } = await apiClient.get(
        `/capacitaciones/${idSesion}/colaboradores/${idColaborador}/diploma/descargar`
      );
      if (data?.url) {
        return data.url
      } else {
        toast.error("No se pudo generar la URL del diploma.");
        throw new Error("No se pudo generar la URL de descarga.");
      }
    } catch (err) {
      handleApiError(err, "Error al descargar el diploma.");
      throw err;
    }
  }, []);

  const descargarInduccionDocumental = useCallback(async (formatoDatos: InduccionDocumental) => {
    try {
      const response = await apiClient.post(`/documents-module/induccion-documental`, formatoDatos, {
        responseType: "blob",
      });
      
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 5000);
    } catch (err) {
      const error = err as AxiosError;

      if (error.response && error.response.data instanceof Blob) {
        const text = await error.response.data.text();
        console.error("Respuesta del servidor:", text);
      }
      
      handleApiError(err, "Error al generar documento de induccion documental.");
    }
  }, []);

  return {
    colaboradores,
    loading,
    error,
    isMutating,
    obtenerColaboradores,
    descargarListaAsistencia,
    descargarExamen,
    descargarDiploma,
    obtenerCapacitacionesColaborador,
    obtenerDocumentosColaborador,
    obtenerHistorialColaborador,
    obtenerResumenColaborador,
    descargarInduccionDocumental,
    obtenerDetallePlanColaborador,
  }
}
