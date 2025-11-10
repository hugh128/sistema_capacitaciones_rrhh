import { apiClient } from "@/lib/api-client";
import { UsuarioLogin } from "@/lib/auth";
import type { AplicarPlan, CambiarPlanCapacitacion, ColaboradorDisponible, PlanCapacitacion } from "@/lib/planes_programas/types";
import { handleApiError } from "@/utils/error-handler";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

type planesCapacitacionPayload = Partial<PlanCapacitacion>

export function usePlanesCapacitacion(user: UsuarioLogin | null) {
  const [planesCapacitacion, setPlanesCapacitacion] = useState<PlanCapacitacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const refreshPlanesCapacitacion = useCallback(async () => {
    if (!user) {
      setPlanesCapacitacion([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await apiClient.get<PlanCapacitacion[]>('/plan-capacitacion');
      setPlanesCapacitacion(data);
    } catch (err) {
      const baseMessage = "Error al cargar los planes de capacitacion.";
      setError(baseMessage);
      handleApiError(err, baseMessage)
    } finally {
      setLoading(false);
    }
  }, [user]);

  const savePlanesCapacitacion = useCallback(async (payload: planesCapacitacionPayload, idPlanCapacitacion?: number) => {
    if (!user) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);
    let successMessage = "";

    try {
      if (idPlanCapacitacion) {
        await apiClient.patch(`/plan-capacitacion/${idPlanCapacitacion}`, payload);
        successMessage = "Plan de capacitacon actualizado exitosamente.";
      } else {
        await apiClient.post('/plan-capacitacion', payload);
        successMessage = "Plan de capacitacion creado exitosamente.";
      }
      
      toast.success(successMessage);
      await refreshPlanesCapacitacion();

    } catch (err) {
      const baseMessage = idPlanCapacitacion ? "Error al actualizar el plan de capacitacion." : "Error al crear el plan de capacitacion.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setIsMutating(false);
    }
  }, [user, refreshPlanesCapacitacion]);

  const deletePlanesCapacitacion = useCallback(async (idPlanCapacitacion: number) => {
    if (!user) {
      toast.error("Usuario no autenticado.");
      return;
    }
    
    setIsMutating(true);
    setError(null);

    try {
      await apiClient.delete(`/plan-capacitacion/${idPlanCapacitacion}`);
      toast.success("Plan de capacitacion eliminado exitosamente.");
      await refreshPlanesCapacitacion();

    } catch (err) {
      const baseMessage = "Error al eliminar el plan de capacitacion.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setIsMutating(false);
    }
  }, [user, refreshPlanesCapacitacion]);

  const aplicarPlanCapacitacion = async (payload: AplicarPlan) => {
    if (!user) {
      toast.error("Usuario no autenticado.");
      return;
    }
    
    setIsMutating(true);
    setError(null);
    
    try {
      
      await apiClient.post(`/capacitaciones/planes/aplicar`, payload)
      toast.success("Plan de capacitacion aplicado exitosamente.");
      await refreshPlanesCapacitacion();

    } catch (err) {
      const baseMessage = "Error al aplicar plan de capacitacion.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setIsMutating(false);
    }
  }

  const obtenerColaboradoresDisponiblesPlan = async (idPlan: number): Promise<ColaboradorDisponible[]> => {  
    if (!user) {
      toast.error("Usuario no autenticado.");
      return [];
    }
    
    setIsMutating(true);
    setError(null);

    try {
      const { data } = await apiClient.get(`/capacitaciones/planes/${idPlan}/colaboradores-disponibles`);
      return data.data.disponibles;
    } catch (err) {
      const baseMessage = "Error al obtener colaboradores disponibles para aplicar plan de capacitacion.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
      return [];
    } finally {
      setIsMutating(false);
    }
  }

  const verificarCambioPlan = useCallback(async (cambarPlanCapacitacion: CambiarPlanCapacitacion) => {
    if (!user) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      const { data } = await apiClient.post(`plan-capacitacion/verificar/cambio`, cambarPlanCapacitacion);
      return data;
    } catch (err) {
      const baseMessage = "Error al verificar cambio de plan.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setIsMutating(false);
    }
  }, [user]);

  const analizarCambioPlan = useCallback(async (cambarPlanCapacitacion: CambiarPlanCapacitacion) => {
    if (!user) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      const { data } = await apiClient.post(`plan-capacitacion/analizar/cambio`, cambarPlanCapacitacion);
      return data;
    } catch (err) {
      const baseMessage = "Error al analizar cambio de plan.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setIsMutating(false);
    }
  }, [user]);

  const cambiarPlanColaborador = useCallback(async (cambarPlanCapacitacion: CambiarPlanCapacitacion) => {
    if (!user) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      const { data } = await apiClient.patch(`plan-capacitacion/cambiar-plan/colaborador`, cambarPlanCapacitacion);
      return data;
    } catch (err) {
      const baseMessage = "Error al cambiar plan de colaborador.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setIsMutating(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshPlanesCapacitacion();
    }
  }, [user, refreshPlanesCapacitacion]);


  return {
    planesCapacitacion,
    loading,
    error,
    isMutating,
    savePlanesCapacitacion,
    deletePlanesCapacitacion,
    aplicarPlanCapacitacion,
    obtenerColaboradoresDisponiblesPlan,
    verificarCambioPlan,
    analizarCambioPlan,
    cambiarPlanColaborador
  }
}
