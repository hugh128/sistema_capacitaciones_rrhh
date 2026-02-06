import { apiClient } from "@/lib/api-client";
import type { UsuarioLogin } from "@/lib/auth";
import { handleApiError } from "@/utils/error-handler";
import { useCallback, useEffect, useState } from "react";
import type { PersonaSinUsuario, Usuario, usuarioPayload } from "@/lib/types";
import toast from "react-hot-toast";

export function useUsuarios(user: UsuarioLogin | null) {
  const [usuarios, setUsurios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const refreshUsuarios = useCallback(async () => {
    if (!user) {
      setUsurios([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await apiClient.get<Usuario[]>('/usuario');
      setUsurios(data);
    } catch (err) {
      const baseMessage = "Error al cargar a los usuarios.";
      setError(baseMessage);
      handleApiError(err, baseMessage)
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveUsuario = useCallback(async (
    payload: usuarioPayload, 
    idUsuario?: number
  ) => {
    if (!user) {
      toast.error("Usuario no autenticado.");
      throw new Error("Usuario no autenticado.");
    }

    setIsMutating(true);
    setError(null);
    let successMessage = "";
    
    const updatePayload: Partial<usuarioPayload> = {
      USERNAME: payload.USERNAME,
      ESTADO: payload.ESTADO,
      ID_ROLES: payload.ID_ROLES,
      USUARIO_ACCION_ID: payload.USUARIO_ACCION_ID
    };
    
    const createPayload: usuarioPayload = {
      ...payload,
      PERSONA_ID: payload.PERSONA_ID!,
      PASSWORD: payload.PASSWORD!,
      USUARIO_ACCION_ID: payload.USUARIO_ACCION_ID
    };

    try {
      if (idUsuario) {
        await apiClient.patch(`/usuario/${idUsuario}`, updatePayload);
        successMessage = "Usuario actualizado exitosamente.";

      } else {
        if (!createPayload.PASSWORD || !createPayload.PERSONA_ID) {
          throw new Error("Persona y Contraseña son obligatorios para la creación.");
        }
        await apiClient.post('/usuario', createPayload);
        successMessage = "Usuario creado exitosamente.";
      }
      
      toast.success(successMessage);
      await refreshUsuarios();

    } catch (err) {
      const baseMessage = idUsuario ? "Error al actualizar usuario." : "Error al crear usuario.";
      handleApiError(err, baseMessage);
      throw err; 
    } finally {
      setIsMutating(false);
    }
  }, [user, refreshUsuarios]); 

  const deleteUsuario = useCallback(async (idUsuario: number, usuarioAccionId: number) => {
    if (!user) {
      toast.error("Usuario no autenticado.");
      return;
    }
    
    setIsMutating(true);
    setError(null);

    try {
      await apiClient.delete(`/usuario/${idUsuario}`, { 
        data: { USUARIO_ACCION_ID: usuarioAccionId } 
      });
      toast.success("Usuario inactivado exitosamente.");
      await refreshUsuarios();

    } catch (err) {
      const baseMessage = "Error al inactivar usuario.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setIsMutating(false);
    }
  }, [user, refreshUsuarios]);

  const updatePassword = useCallback(async (idUsuario: number, newPassword: string, usuarioAccionId: number) => {
    if (!user) {
      toast.error("Usuario no autenticado.");
      throw new Error("Usuario no autenticado.");
    }
    
    setIsMutating(true);
    setError(null);

    try {
      await apiClient.patch(`/usuario/${idUsuario}/password`, { 
        PASSWORD: newPassword, 
        USUARIO_ACCION_ID: usuarioAccionId
      });
      
      toast.success("Contraseña actualizada exitosamente.");
      
    } catch (err) {
      const baseMessage = "Error al cambiar la contraseña.";
      handleApiError(err, baseMessage);
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshUsuarios();
    }
  }, [user, refreshUsuarios]);

  const getPersonasList = useCallback(async () => {  
    if (!user) {
      return undefined;
    }

    setIsMutating(true);
    setError(null);

    try {
      const { data } = await apiClient.get<PersonaSinUsuario[]>('/persona/sin-usuario');
      return data;
    } catch (err) {
      const baseMessage = "Error al cargar lista personas.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setIsMutating(false);
    }
  }, [user]);

  return {
    usuarios,
    loading,
    error,
    isMutating,
    saveUsuario,
    deleteUsuario,
    updatePassword,
    getPersonasList
  }
}
