import { apiClient } from "@/lib/api-client";
import { UsuarioLogin } from "@/lib/auth";
import type { ProgramaCapacitacion, ProgramaCapacitacionForm, CreateProgramaDetalleDto, AsignarProgramaCapacitacion, ColaboradorDisponiblePrograma, AsignarProgramaCapacitacionSelectivo } from "@/lib/programas_capacitacion/types";
import { handleApiError } from "@/utils/error-handler";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

export function useProgramasCapacitacion(user: UsuarioLogin | null) {
  const [programasCapacitacion, setProgramasCapacitacion] = useState<ProgramaCapacitacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const refreshProgramasCapacitacion = useCallback(async () => {
    if (!user) {
      setProgramasCapacitacion([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await apiClient.get<ProgramaCapacitacion[]>('/programa-capacitacion');
      setProgramasCapacitacion(data);
    } catch (err) {
      const baseMessage = "Error al cargar los planes de capacitacion.";
      setError(baseMessage);
      handleApiError(err, baseMessage)
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveProgramaCapacitacion = useCallback(async (payload: ProgramaCapacitacionForm, idPrograma?: number) => {
    if (!user) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);
    let successMessage = "";

    try {
      if (idPrograma) {
        await apiClient.patch(`/programa-capacitacion/${idPrograma}`, payload);
        successMessage = "Programa de capacitacion actualizado exitosamente.";
      } else {
        await apiClient.post('/programa-capacitacion', payload);
        successMessage = "Programa de capacitacion creado exitosamente.";
      }
      
      toast.success(successMessage);
      await refreshProgramasCapacitacion();

    } catch (err) {
      const baseMessage = idPrograma ? "Error al actualizar el programa de capacitacion." : "Error al crear el programa de capacitacion.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setIsMutating(false);
    }
  }, [user, refreshProgramasCapacitacion]);

  const saveProgramaDetalle = useCallback(async (payload: CreateProgramaDetalleDto) => {
    if (!user) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);
    let successMessage = "";

    try {
      await apiClient.post('/programa-detalle', payload);
      successMessage = "Capacitacion para el programa creada exitosamente.";
      
      toast.success(successMessage);
      await refreshProgramasCapacitacion();

    } catch (err) {
      const baseMessage = "Error al crear la capacitacion del programa.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setIsMutating(false);
    }
  }, [user, refreshProgramasCapacitacion]);

  const deleteProgramasCapacitacion = useCallback(async (idPrograma: number) => {
    if (!user) {
      toast.error("Usuario no autenticado.");
      return;
    }
    
    setIsMutating(true);
    setError(null);

    try {
      await apiClient.delete(`/programa-detalle/${idPrograma}`);
      toast.success("Programa de capacitacion inactivado exitosamente.");
      await refreshProgramasCapacitacion();

    } catch (err) {
      const baseMessage = "Error al inactivar el programa de capacitacion.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setIsMutating(false);
    }
  }, [user, refreshProgramasCapacitacion]);

  const asignarProgramaCapacitacion = useCallback(async (payload: AsignarProgramaCapacitacion) => {
    if (!user) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      await apiClient.post(`/capacitaciones/programas/aplicar`, payload)
      toast.success("Programa de capacitacion asignado exitosamente.");
      await refreshProgramasCapacitacion();

    } catch (err) {
      const baseMessage = "Error al asignar programa de capacitacion.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setIsMutating(false);
    }
  }, [user, refreshProgramasCapacitacion]);

  const asignarProgramaCapacitacionSelectivo = useCallback(async (payload: AsignarProgramaCapacitacionSelectivo) => {
    if (!user) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      await apiClient.post(`/capacitaciones/programas/aplicar-selectivo`, payload)
      toast.success("Programa de capacitacion asignado exitosamente.");
      await refreshProgramasCapacitacion();

    } catch (err) {
      const baseMessage = "Error al asignar programa de capacitacion.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setIsMutating(false);
    }
  }, [user, refreshProgramasCapacitacion]);

  const obtenerColaboradoresDisponiblesPrograma = useCallback(async (idPrograma: number): Promise<ColaboradorDisponiblePrograma[]> => {  
    if (!user) {
      toast.error("Usuario no autenticado.");
      return [];
    }
    
    setIsMutating(true);
    setError(null);

    try {
      const { data } = await apiClient.get(`/capacitaciones/programas/${idPrograma}/colaboradores-disponibles`);

      return data.disponibles;
    } catch (err) {
      const baseMessage = "Error al obtener colaboradores disponibles para aplicar programa de capacitacion.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
      return [];
    } finally {
      setIsMutating(false);
    }
  }, [user]);

  const obtenerDetalleProgramaConColaboradores = useCallback(async (idPrograma: number) => {  
    if (!user) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      const { data } = await apiClient.get(`/programa-capacitacion/${idPrograma}/detalle-colaboradores`);
      return data;
    } catch (err) {
      const baseMessage = "Error al obtener detalle de programa de capacitacion.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setIsMutating(false);
    }
  }, [user]);

  const obtenerProgramaDetalle = useCallback(async (idPrograma: number) => {  
    if (!user) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      const { data } = await apiClient.get(`/programa-detalle/${idPrograma}`);
      return data;
    } catch (err) {
      const baseMessage = `Error al cargar el detalle del plan: ${err}`;
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setIsMutating(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshProgramasCapacitacion();
    }
  }, [user, refreshProgramasCapacitacion]);

  return {
    programasCapacitacion,
    loading,
    error,
    isMutating,
    saveProgramaDetalle,
    saveProgramaCapacitacion,
    deleteProgramasCapacitacion,
    asignarProgramaCapacitacion,
    obtenerColaboradoresDisponiblesPrograma,
    asignarProgramaCapacitacionSelectivo,
    obtenerDetalleProgramaConColaboradores,
    obtenerProgramaDetalle,
  }
}
