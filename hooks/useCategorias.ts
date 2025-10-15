import { apiClient } from "@/lib/api-client";
import { CategoriaPermiso, UsuarioLogin } from "@/lib/auth";
import { handleApiError } from "@/utils/error-handler";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

export interface CategoriaPayload {
  CLAVE: string;
  NOMBRE: string;
  DESCRIPCION: string;
}

export interface PermisoPayload {
  CLAVE: string;
  NOMBRE: string;
  DESCRIPCION: string;
  CATEGORIA_ID: number;
}

export function useCategorias(user: UsuarioLogin | null) {
  const [categorias, setCategorias] = useState<CategoriaPermiso[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCategorias = useCallback(async () => {
    if (!user) {
      setCategorias([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await apiClient.get<CategoriaPermiso[]>('/categoria-permiso');
      setCategorias(data);
    } catch (err) {
      const baseMessage = "Error al cargar las categorías y permisos.";
      setError(baseMessage);
      handleApiError(err, baseMessage)
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveCategoria = useCallback(async (data: CategoriaPayload, id?: number) => {
    if (!user) return false;
    const isEditing = id !== undefined;
    const endpoint = isEditing ? `/categoria-permiso/${id}` : '/categoria-permiso';

    try {
      const method = isEditing ? 'patch' : 'post';
      await apiClient[method](endpoint, data);
      
      refreshCategorias();
      toast.success(`Categoría ${isEditing ? 'actualizada' : 'creada'} con éxito.`);
      return true;
    } catch (err) {
      handleApiError(err, `Error al ${isEditing ? 'actualizar' : 'crear'} la categoría.`);
      return false;
    }
  }, [user, refreshCategorias]);

  const deleteCategoria = useCallback(async (id: number) => {
    if (!user) return false;

    try {
      await apiClient.delete(`/categoria-permiso/${id}`);
      
      toast.success("Categoría eliminada con éxito.");
      refreshCategorias();
      return true;
    } catch (err) {
      handleApiError(err, "Error al eliminar la categoría.");
      return false;
    }
  }, [user, refreshCategorias]);


  // --- Funciones de Gestión de Permisos ---
  const savePermiso = useCallback(async (data: PermisoPayload, id?: number) => {
    if (!user) return false;
    const isEditing = id !== undefined;
    const endpoint = isEditing ? `/permiso/${id}` : '/permiso';

    try {
      const method = isEditing ? 'patch' : 'post';
      await apiClient[method](endpoint, data);

      toast.success(`Permiso ${isEditing ? 'actualizado' : 'creado'} con éxito.`);
      refreshCategorias();
      return true;
    } catch (err) {
      handleApiError(err, `Error al ${isEditing ? 'actualizar' : 'crear'} el permiso.`);
      return false;
    }
  }, [user, refreshCategorias]);


  const deletePermiso = useCallback(async (id: number) => {
    if (!user) return false;

    try {
      await apiClient.delete(`/permiso/${id}`);

      toast.success("Permiso eliminado con éxito.");
      refreshCategorias();
      return true;
    } catch (err) {
      handleApiError(err, "Error al eliminar el permiso.");
      return false;
    }
  }, [user, refreshCategorias]);

  useEffect(() => {
    if (user) {
      refreshCategorias();
    }
  }, [user, refreshCategorias]);

  return {
    categorias,
    loading,
    error,
    refreshCategorias,

    saveCategoria,
    deleteCategoria,
    savePermiso,
    deletePermiso,
  };
}
