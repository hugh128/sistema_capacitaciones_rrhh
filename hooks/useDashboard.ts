import { apiClient } from "@/lib/api-client";
import { UsuarioLogin } from "@/lib/auth";
import { handleApiError } from "@/utils/error-handler";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";

export function useDashboar(user: UsuarioLogin | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerEstadisticasDashboard = useCallback(async (id: number | null) => {  
    if (!user) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await apiClient.get(`/dashboard?id=${id}`);
      return data;
    } catch (err) {
      const baseMessage = "Error al obtener estadisticas.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    error,
    obtenerEstadisticasDashboard,
  }
}
