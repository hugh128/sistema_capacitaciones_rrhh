import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { handleApiError } from "@/utils/error-handler";
import toast from "react-hot-toast";
import { UsuarioLogin } from "@/lib/auth";
import { Departamento } from "@/lib/types";
import { type FormData as FormValues } from "@/components/form-modal";

export function useDepartamentos(user: UsuarioLogin | null) {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const fetchDepartamentos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<Departamento[]>('/departamento');
      setDepartamentos(data);
    } catch (err) {
      const baseMessage = "Error al cargar los departamentos.";
      setError(baseMessage);
      handleApiError(err, baseMessage)
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDepartamento = async (departamento: Departamento) => {
    setError(null);
    const loadingToastId = toast.loading("Inactivando departamento...");
    try {
      await apiClient.delete(`/departamento/${departamento.ID_DEPARTAMENTO}`, {
        data: { USUARIO_ACCION_ID: user?.ID_USUARIO }
      });
      toast.success("Departamento inactivado con éxito.", { id: loadingToastId });
      setDepartamentos((prev) =>
        prev.map((e) =>
          e.ID_DEPARTAMENTO === departamento.ID_DEPARTAMENTO ? { ...e, ESTADO: false } : e
        )
      );
    } catch (err) {
      const baseMessage = "Error al inactivar el departamento.";
      const detailedMessage = handleApiError(err, baseMessage, loadingToastId);
      setError(detailedMessage);
    }
  };
    
  const saveDepartamento = async (formData: FormValues, editingDepartamento: Departamento | null) => {
    setError(null);
    setIsMutating(true);

    const isEditing = !!editingDepartamento;
    const action = isEditing ? "Editar" : "Guardar";

    const payload = {
      ...formData,
      USUARIO_ACCION_ID: user?.ID_USUARIO
    } as Partial<Departamento>;

    try {
      if (isEditing) {
        await apiClient.patch(
          `/departamento/${editingDepartamento!.ID_DEPARTAMENTO}`,
          payload
        );
      } else {
        await apiClient.post('/departamento', payload);
      }

      await fetchDepartamentos(); 
      
      toast.success(`Departamento ${isEditing ? 'editado' : 'agregado'} con éxito.`);
      return true;
    } catch (err) {
      const baseMessage = `Error al ${action.toLowerCase()} los datos del departamento.`;
      const detailedMessage = handleApiError(err, baseMessage);
      setError(detailedMessage);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDepartamentos();
    }
  }, [user, fetchDepartamentos]);

  return {
    departamentos,
    isMutating,
    loading,
    error,
    fetchDepartamentos,
    deleteDepartamento,
    saveDepartamento
  };
}