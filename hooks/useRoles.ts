import { apiClient } from "@/lib/api-client";
import type { Rol, RolPayload, UsuarioLogin } from "@/lib/auth";
import { handleApiError } from "@/utils/error-handler";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

export function useRoles(user: UsuarioLogin | null) {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const refreshRoles = useCallback(async () => {
    if (!user) {
      setRoles([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await apiClient.get<Rol[]>('/rol');
      setRoles(data);
    } catch (err) {
      const baseMessage = "Error al cargar los roles.";
      setError(baseMessage);
      handleApiError(err, baseMessage)
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveRole = useCallback(async (payload: RolPayload, idRol?: number) => {
    if (!user) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);
    let successMessage = "";

    try {
      if (idRol) {
        await apiClient.patch(`/rol/${idRol}`, payload);
        successMessage = "Rol actualizado exitosamente.";
      } else {
        await apiClient.post('/rol', payload);
        successMessage = "Rol creado exitosamente.";
      }
      
      toast.success(successMessage);
      await refreshRoles();

    } catch (err) {
      const baseMessage = idRol ? "Error al actualizar el rol." : "Error al crear el rol.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setIsMutating(false);
    }
  }, [user, refreshRoles]);

  const deleteRole = useCallback(async (roleId: number) => {
    if (!user) {
      toast.error("Usuario no autenticado.");
      return;
    }
    
    setIsMutating(true);
    setError(null);

    try {
      await apiClient.delete(`/rol/${roleId}`);
      toast.success("Rol eliminado exitosamente.");
      await refreshRoles();

    } catch (err) {
      const baseMessage = "Error al eliminar el rol.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setIsMutating(false);
    }
  }, [user, refreshRoles]);

  useEffect(() => {
    if (user) {
      refreshRoles();
    }
  }, [user, refreshRoles]);


  return {
    roles,
    loading,
    error,
    isMutating,
    saveRole,
    deleteRole
  }
}
