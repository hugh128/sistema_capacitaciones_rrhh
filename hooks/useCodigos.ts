import { apiClient } from "@/lib/api-client";
import { UsuarioLogin } from "@/lib/auth";
import type {   CodigoPadre, NuevoCodigoPadre, NuevoCodigoHijo, RecapacitacionCambioVersion } from "@/lib/codigos/types";
import { handleApiError } from "@/utils/error-handler";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

export function useCodigos(user: UsuarioLogin | null) {
  const [codigos, setCodigos] = useState<CodigoPadre[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const refreshCodigos = useCallback(async () => {
    if (!user) {
      setCodigos([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await apiClient.get<CodigoPadre[]>('/documento');
      setCodigos(data);
    } catch (err) {
      const baseMessage = "Error al cargar los codigos.";
      setError(baseMessage);
      handleApiError(err, baseMessage)
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createParent = useCallback(
    async (newParent: NuevoCodigoPadre) => {
      setIsMutating(true);
      try {
        const { data } = await apiClient.post("/documento", newParent);
        //toast.success("Código padre agregado correctamente.");
        refreshCodigos();
        return data;
      } catch (err) {
        const baseMessage = "Error al crear el código padre.";
        const errorCreateParent = handleApiError(err, baseMessage);
        throw new Error(errorCreateParent)
      } finally {
        setIsMutating(false);
      }
    },
    [refreshCodigos],
  );

  const updateParent = useCallback(
    async (id: number, updatedData: NuevoCodigoPadre) => {
      setIsMutating(true);
      try {
        await apiClient.patch(`/documento/${id}`, updatedData); 
        toast.success("Código padre actualizado correctamente.");
        refreshCodigos();
      } catch (err) {
        const baseMessage = "Error al actualizar el código padre.";
        handleApiError(err, baseMessage);
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [refreshCodigos],
  );

  const deleteParent = useCallback(
    async (id: number) => {
      setIsMutating(true);
      try {
        await apiClient.delete(`/documento/${id}`); 
        toast.success("Código padre y sus asociados eliminados.");
        refreshCodigos();
      } catch (err) {
        const baseMessage = "Error al eliminar el código padre.";
        handleApiError(err, baseMessage);
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [refreshCodigos],
  );

  const addChild = useCallback(
    async (parentId: number, newChild: NuevoCodigoHijo) => {
      setIsMutating(true);
      try {
        await apiClient.post("/documento-asociado", {
          ...newChild,
          DOCUMENTO_ID: parentId,
        });
        //toast.success("Código hijo agregado correctamente.");
        refreshCodigos();
      } catch (err) {
        const baseMessage = "Error al agregar código hijo.";
        const errorCreateChild = handleApiError(err, baseMessage);
        throw new Error(errorCreateChild);
      } finally {
        setIsMutating(false);
      }
    },
    [refreshCodigos],
  );

  const updateChild = useCallback(
    async (childId: number, updatedData: NuevoCodigoHijo) => {
      setIsMutating(true);
      try {
        await apiClient.patch(`/documento-asociado/${childId}`, updatedData); 
        toast.success("Código hijo actualizado correctamente.");
        refreshCodigos();
      } catch (err) {
        const baseMessage = "Error al actualizar código hijo.";
        handleApiError(err, baseMessage);
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [refreshCodigos],
  );

  const deleteChild = useCallback(
    async (childId: number) => {
      setIsMutating(true);
      try {
        await apiClient.delete(`/documento-asociado/${childId}`); 
        toast.error("Código hijo eliminado correctamente.");
        refreshCodigos();
      } catch (err) {
        const baseMessage = "Error al eliminar código hijo.";
        handleApiError(err, baseMessage);
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    [refreshCodigos],
  );

  const recapacitarPorCambioVersion = useCallback(async (recapacitacionCambioVersion: RecapacitacionCambioVersion) => {
    if (!user) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      const { data } = await apiClient.post('documento/cambio-version', recapacitacionCambioVersion);
      return data;
    } catch (err) {
      const baseMessage = "Error al crear capacitaciones por cambio de version de documento.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setIsMutating(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshCodigos();
    }
  }, [user, refreshCodigos]);

  return {
    codigos,
    loading,
    error,
    isMutating,
    refreshCodigos,
    createParent,
    updateParent,
    deleteParent,
    addChild,
    updateChild,
    deleteChild,
    recapacitarPorCambioVersion,
  }
}
