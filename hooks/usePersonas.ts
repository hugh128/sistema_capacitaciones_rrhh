import { apiClient } from "@/lib/api-client";
import { UsuarioLogin } from "@/lib/auth";
import { Persona } from "@/lib/types";
import { handleApiError } from "@/utils/error-handler";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { type FormData as FormValues } from "@/components/form-modal";

export function usePersonas(user: UsuarioLogin | null) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);


  const fetchPersonas = useCallback(async () => {
    if (!user) {
      setPersonas([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await apiClient.get<Persona[]>('/persona');
      setPersonas(data);
    } catch (err) {
      const baseMessage = "Error al cargar a las personas.";
      setError(baseMessage);
      handleApiError(err, baseMessage)
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deletePersona = async (persona: Persona) => {
    setError(null);
    const loadingToastId = toast.loading("Inactivando persona...");
    try {
      await apiClient.delete(`/persona/${persona.ID_PERSONA}`);
      toast.success("Persona inactivada con éxito.", { id: loadingToastId });
      setPersonas((prev) =>
        prev.map((e) =>
          e.ID_PERSONA === persona.ID_PERSONA ? { ...e, ESTADO: false } : e
        )
      );
    } catch (err) {
      const baseMessage = "Error al inactivar a la persona.";
      const detailedMessage = handleApiError(err, baseMessage, loadingToastId);
      setError(detailedMessage);
    }
  };
    
  const savePersona = async (formData: FormValues, editingPersona: Persona | null) => {
    if (!user) {
      toast.error("Usuario no autenticado.");
      throw new Error("Usuario no autenticado.");
    }

    setIsMutating(true);
    setError(null);

    const isEditing = !!editingPersona;
    const action = isEditing ? "Editar" : "Guardar";

    const payload = { ...formData } as Partial<Persona>;

    const empresaIdString = payload.EMPRESA_ID;
    if (empresaIdString && typeof empresaIdString === 'string') {
      payload.EMPRESA_ID = parseInt(empresaIdString, 10);
    }

    const departamentoIdString = payload.DEPARTAMENTO_ID;
    if (departamentoIdString && typeof departamentoIdString === 'string') {
      payload.DEPARTAMENTO_ID = parseInt(departamentoIdString, 10);
    }

    const puestoIdString = payload.PUESTO_ID;
    if (puestoIdString && typeof puestoIdString === 'string') {
      payload.PUESTO_ID = parseInt(puestoIdString, 10);
    }

    try {
      if (isEditing) {
        await apiClient.patch(
          `/persona/${editingPersona!.ID_PERSONA}`,
          payload
        );
      } else {
        await apiClient.post('/persona', payload);
      }

      await fetchPersonas(); 
      
      toast.success(`Persona ${isEditing ? 'editado' : 'agregado'} con éxito.`);
      return true;
    } catch (err) {
      const baseMessage = `Error al ${action.toLowerCase()} los datos de la persona.`;
      const detailedMessage = handleApiError(err, baseMessage);
      setError(detailedMessage);
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPersonas();
    }
  }, [user, fetchPersonas]);

  return {
    personas,
    loading,
    error,
    isMutating,
    fetchPersonas,
    deletePersona,
    savePersona
  };
}
