import { apiClient } from "@/lib/api-client";
import { UsuarioLogin } from "@/lib/auth";
import { Puesto } from "@/lib/types";
import { handleApiError } from "@/utils/error-handler";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { type FormData as FormValues } from "@/components/form-modal";

export function usePuestos(user: UsuarioLogin | null) {
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const fetchPuestos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<Puesto[]>('/puesto');
      setPuestos(data);
    } catch (err) {
      const baseMessage = "Error al cargar los puestos.";
      setError(baseMessage);
      handleApiError(err, baseMessage)
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePuesto = async (puesto: Puesto) => {
    setError(null);
    const loadingToastId = toast.loading("Inactivando puesto...");
    try {
      await apiClient.delete(`/puesto/${puesto.ID_PUESTO}`);
      toast.success("Puesto inactivado con éxito.", { id: loadingToastId });
      setPuestos((prev) =>
        prev.map((e) =>
          e.ID_PUESTO === puesto.ID_PUESTO ? { ...e, ESTADO: false } : e
        )
      );
    } catch (err) {
      const baseMessage = "Error al inactivar el puesto.";
      const detailedMessage = handleApiError(err, baseMessage, loadingToastId);
      setError(detailedMessage);
    }
  };
    
  const savePuesto = async (formData: FormValues, editingPuesto: Puesto | null) => {
    setError(null);
    setIsMutating(true);

    const isEditing = !!editingPuesto;
    const action = isEditing ? "Editar" : "Guardar";

    const payload = { ...formData } as Partial<Puesto>;

    const departamentoIdString = payload.DEPARTAMENTO_ID;
    if (departamentoIdString && typeof departamentoIdString === 'string') {
      payload.DEPARTAMENTO_ID = parseInt(departamentoIdString, 10);
    }

    try {
      if (isEditing) {
        await apiClient.patch(
          `/puesto/${editingPuesto!.ID_PUESTO}`,
          payload
        );
      } else {
        await apiClient.post('/puesto', payload);
      }

      await fetchPuestos(); 
      
      toast.success(`Puesto ${isEditing ? 'editado' : 'agregado'} con éxito.`);
      return true;
    } catch (err) {
      const baseMessage = `Error al ${action.toLowerCase()} los datos del puesto.`;
      const detailedMessage = handleApiError(err, baseMessage);
      setError(detailedMessage);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPuestos();
    }
  }, [user, fetchPuestos]);

  return {
    puestos,
    isMutating,
    loading,
    error,
    fetchPuestos,
    deletePuesto,
    savePuesto
  };
}
