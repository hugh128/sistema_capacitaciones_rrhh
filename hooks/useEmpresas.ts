import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { handleApiError } from "@/utils/error-handler";
import { Empresa } from "@/lib/types";
import toast from "react-hot-toast";
import { UsuarioLogin } from "@/lib/auth";

export function useEmpresas(user: UsuarioLogin | null) {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmpresas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<Empresa[]>("/empresa");
      setEmpresas(data);
    } catch (err) {
      const baseMessage = "Error al cargar las empresas.";
      setError(baseMessage);
      handleApiError(err, baseMessage)
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEmpresa = async (empresa: Empresa) => {
    setError(null);
    const toastId = toast.loading("Inactivando empresa...");
    try {
      await apiClient.delete(`/empresa/${empresa.ID_EMPRESA}`);
      toast.success("Empresa inactivada con éxito.", { id: toastId });
      setEmpresas((prev) =>
        prev.map((e) =>
          e.ID_EMPRESA === empresa.ID_EMPRESA ? { ...e, ESTADO: false } : e
        )
      );
    } catch (err) {
      const msg = handleApiError(err, "Error al eliminar la empresa.", toastId);
      setError(msg);
    }
  };

  useEffect(() => {
    if (user) fetchEmpresas();
  }, [user, fetchEmpresas]);

  return { empresas, loading, error, fetchEmpresas, deleteEmpresa };
}
