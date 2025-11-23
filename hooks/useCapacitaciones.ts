import { apiClient } from "@/lib/api-client";
import { UsuarioLogin } from "@/lib/auth";
import type { ApiCapacitacionSesion, AsignarCapacitacion, AsignarSesion, Capacitacion } from "@/lib/capacitaciones/capacitaciones-types";
import type { ColaboradorAsistenciaData, ExamenCompleto, ListadoAsistencia, Serie } from "@/lib/mis-capacitaciones/capacitaciones-types";
import { handleApiError } from "@/utils/error-handler";
import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

export function useCapacitaciones(user: UsuarioLogin | null) {
  const userId = user?.PERSONA_ID;
  const userIdRef = useRef(userId);
  
  useEffect(() => {
    if (userIdRef.current !== userId) {
      userIdRef.current = userId;
    }
  }, [userId]);

  const [capacitacionesPendientes, setCapacitacionesPendientes] = useState<Capacitacion[]>([]);
  const [capacitaciones, setCapacitaciones] = useState<ApiCapacitacionSesion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const refreshCapacitacionesPendientes = useCallback(async () => {
    if (!userId) {
      setCapacitacionesPendientes([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await apiClient.get<Capacitacion[]>('/capacitaciones/pendientes');
      setCapacitacionesPendientes(data);
    } catch (err) {
      const baseMessage = "Error al cargar capacitaciones pendientes.";
      setError(baseMessage);
      handleApiError(err, baseMessage)
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const obtenerCapacitaciones = useCallback(async () => {
    if (!userId) {
      setCapacitaciones([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await apiClient.get<ApiCapacitacionSesion[]>('/capacitaciones/todas');
      setCapacitaciones(data);
    } catch (err) {
      const baseMessage = "Error al cargar capacitaciones.";
      setError(baseMessage);
      handleApiError(err, baseMessage)
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const obtenerDetallesCapacitacion = useCallback(async (idCapacitacion: number) => {  
    if (!userId) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      const { data } = await apiClient.get(`/capacitaciones/${idCapacitacion}`);
      return data;
    } catch (err) {
      const baseMessage = "Error al obtener detalle de capacitacion.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setIsMutating(false);
    }
  }, [userId]);

  const obtenerCapacitadores = useCallback(async () => {  
    if (!userId) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      const { data } = await apiClient.get(`/usuario/capacitador/capacitadores-disponibles`);
      return data;
    } catch (err) {
      const baseMessage = "Error al obtener capacitadores.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    }
  }, [userId]);

  const obtenerColaboradoresSinSesion = useCallback(async (idCapacitacion: number) => {  
    if (!userId) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      const { data } = await apiClient.get(`/capacitaciones/${idCapacitacion}/colaboradores-sesion`);
      return data;
    } catch (err) {
      const baseMessage = "Error al obtener colaboradores para asignacion.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    }
  }, [userId]);

  const asignarCapacitacion = useCallback(async (payload: AsignarCapacitacion) => {
    if (!userId) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);
    let successMessage = "";

    try {
      await apiClient.post('/capacitaciones/asignar', payload);
      successMessage = "Capacitacion asignada exitosamente.";
      toast.success(successMessage);
    } catch (err) {
      const baseMessage = "Error al asignar la capacitacion.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setIsMutating(false);
    }
  }, [userId]);

  const asignarSesion = useCallback(async (payload: AsignarSesion) => {
    if (!userId) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);
    let successMessage = "";

    try {
      await apiClient.post('/capacitaciones/asignar/sesion', payload);
      successMessage = "Sesion asignada exitosamente.";
      toast.success(successMessage);
    } catch (err) {
      const baseMessage = "Error al asignar sesion a la capacitacion.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setIsMutating(false);
    }
  }, [userId]);

  const obtenerCapacitacionesPorCapacitador = useCallback(async (idCapacitador: number) => {  
    if (!userId) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      const { data } = await apiClient.get(`/capacitaciones/capacitador/${idCapacitador}/listado`);
      return data;
    } catch (err) {
      const baseMessage = "Error al obtener capacitaciones.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    }
  }, [userId]);

  const obtenerDetalleSesionCapacitador = useCallback(async (idSesion: number, idCapacitador: number) => {  
    if (!userId) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      const { data } = await apiClient.get(`/capacitaciones/capacitador/${idCapacitador}/detalle-sesion/${idSesion}`);
      return data;
    } catch (err) {
      const baseMessage = "Error al obtener capacitaciones.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setIsMutating(false);
    }
  }, [userId]);

  const obtenerCapacitacionEnRevision = useCallback(async (idSesion: number) => {  
    if (!userId) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      const { data } = await apiClient.get(`/capacitaciones/${idSesion}/en-revision`);
      return data;
    } catch (err) {
      const baseMessage = "Error al obtener capacitaciones.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setIsMutating(false);
    }
  }, [userId]);

  const obtenerDetalleSesion = useCallback(async (idSesion: number) => {  
    if (!userId) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      const { data } = await apiClient.get(`/capacitaciones/${idSesion}/sesion/detalle`);
      return data;
    } catch (err) {
      const baseMessage = "Error al obtener detalle de sesion.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setIsMutating(false);
    }
  }, [userId]);

  const iniciarSesionCapacitador = useCallback(async (idSesion: number, idCapacitador: number, observaciones: string | null) => {  
    if (!userId) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);
    let successMessage = "";

    const payload = { idCapacitador, observaciones }

    try {
      await apiClient.put(`/capacitaciones/${idSesion}/sesion/estado`, payload);
      successMessage = "Sesion iniciada exitosamente.";
      toast.success(successMessage);
    } catch (err) {
      const baseMessage = "Error al iniciar sesion.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setIsMutating(false);
    }
  }, [userId]);

  const finalizarSesionCapacitador = useCallback(async (
    idSesion: number,
    idCapacitador: number,
    observaciones: string | null,
    file: File
  ) => {  
    if (!userId) {
      toast.error("Usuario no autenticado.");
      return;
    }

    if (!file) {
      toast.error("Debes seleccionar un archivo PDF antes de finalizar la sesión.");
      return;
    }

    if (file.type !== "application/pdf") {
      toast.error("El archivo debe ser un PDF válido.");
      return;
    }

    setIsMutating(true);
    setError(null);
    let successMessage = "";

    const formData = new FormData();
    formData.append('idCapacitador', idCapacitador.toString());
    formData.append('observaciones', observaciones || '');
    formData.append('listaAsistencia', file);

    try {
      await apiClient.put(`/capacitaciones/${idSesion}/sesion/finalizar`, formData);
      successMessage = "Sesion finalizada exitosamente.";
      toast.success(successMessage);
    } catch (err) {
      const baseMessage = "Error al finalizar sesion.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setIsMutating(false);
    }
  }, [userId]);

  const registrarAsistenciaMasiva = useCallback(async (
    idSesion: number,
    colaboradores: ColaboradorAsistenciaData[]
  ) => {  
    if (!userId) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);
    let successMessage = "";

    const formData = new FormData();

    const colaboradoresDataJson = colaboradores.map(colab => {
      return {
        idColaborador: colab.idColaborador,
        asistio: colab.asistio,
        notaObtenida: colab.notaObtenida,
        observaciones: colab.observaciones,
      };
    });

    formData.append('colaboradores', JSON.stringify(colaboradoresDataJson));

    colaboradores.forEach(colab => {
      if (colab.archivoExamen instanceof File) {
        formData.append(`examen_${colab.idColaborador}`, colab.archivoExamen);
      }
      if (colab.archivoDiploma instanceof File) {
        formData.append(`diploma_${colab.idColaborador}`, colab.archivoDiploma);
      }
    });

    try {
      const response = await apiClient.post(`/capacitaciones/${idSesion}/asistencias/masivo`, formData, {
        headers: {},
      });
      
      successMessage = "Asistencias y documentos registrados exitosamente.";
      toast.success(successMessage);
      return response.data;
    } catch (err) {
      const baseMessage = "Error al finalizar sesion.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setIsMutating(false);
    }
  }, [userId]);

  const aprobarAsistencia = useCallback(async (
    idSesion: number,
    colaboradores: ColaboradorAsistenciaData[],
    usuario: string
  ) => {
    if (!userId) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      const body = { colaboradores, usuario };
      const response = await apiClient.put(`/capacitaciones/${idSesion}/aprobar/asistencias`, body);
      toast.success("Asistencias registradas exitosamente.");
      return response.data;
    } catch (err) {
      const baseMessage = "Error al finalizar sesión.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setIsMutating(false);
    }
  }, [userId]);

  const aprobarSesion = useCallback(async (idSesion: number, usuario: string, observaciones: string) => {  
    if (!userId) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);
    let successMessage = "";

    const payload = { idSesion, usuario, observaciones }

    try {
      await apiClient.put(`/capacitaciones/${idSesion}/sesion/aprobar`, payload);
      successMessage = "Sesion aprobada exitosamente.";
      toast.success(successMessage);
    } catch (err) {
      const baseMessage = "Error al aprobar sesion.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setIsMutating(false);
    }
  }, [userId]);

  const descargarListaAsistencia = useCallback(async (idSesion: number): Promise<string> => {
    try {
      const { data } = await apiClient.get(`/capacitaciones/${idSesion}/lista-asistencia/descargar`);
      if (data?.url) {
        return data.url;
      } else {
        toast.error("No se pudo generar la URL de descarga.");
        throw new Error("No se pudo generar la URL de descarga.");
      }
    } catch (err) {
      handleApiError(err, "Error al descargar la lista de asistencia.");
      throw err;
    }
  }, []);

  const descargarExamen = useCallback(async (idSesion: number, idColaborador: number): Promise<string> => {
    try {
      const { data } = await apiClient.get(`/capacitaciones/${idSesion}/colaboradores/${idColaborador}/examen/descargar`);
      if (data?.url) {
        return data.url
      } else {
        toast.error("No se pudo generar la URL del examen.");
        throw new Error("No se pudo generar la URL de descarga.");
      }
    } catch (err) {
      handleApiError(err, "Error al descargar el examen.");
      throw err;
    }
  }, []);

  const descargarDiploma = useCallback(async (idSesion: number, idColaborador: number): Promise<string> => {
    try {
      const { data } = await apiClient.get(`/capacitaciones/${idSesion}/colaboradores/${idColaborador}/diploma/descargar`);
      if (data?.url) {
        return data.url
      } else {
        toast.error("No se pudo generar la URL del diploma.");
        throw new Error("No se pudo generar la URL de descarga.");
      }
    } catch (err) {
      handleApiError(err, "Error al descargar el diploma.");
      throw err;
    }
  }, []);

  const descargarPlantillaAsistencia = useCallback(async (formatoDatos: ListadoAsistencia) => {
    try {
      const response = await apiClient.post(`/documents-module/asistencia`, formatoDatos, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 5000);
    } catch (err) {
      const error = err as AxiosError;

      if (error.response && error.response.data instanceof Blob) {
        const text = await error.response.data.text();
        console.error("Respuesta del servidor:", text);
      }
      
      handleApiError(err, "Error al generar la plantilla de asistencia.");
    }
  }, []);

  const descargarArchivoPorRuta = useCallback(async (
    folder: string,
    filename: string,
    toastMessage: string = "Descarga iniciada"
  ) => {
    if (!userId) {
      toast.error("Usuario no autenticado.");
      return;
    }

    try {
      const { data } = await apiClient.get<{ url: string }>('/storage/download', {
        params: { folder, filename },
      });

      if (data?.url) {
        window.open(data.url, "_blank"); 
      } else {
        const fullBackendUrl = `${apiClient.defaults.baseURL}/storage/download?folder=${folder}&filename=${filename}`;
        window.open(fullBackendUrl, "_blank");
      }
      
      toast.success(toastMessage);

    } catch (err) {
      const baseMessage = "Error al intentar descargar el archivo.";
      handleApiError(err, baseMessage);
    }
  }, [userId]);

  const obtenerPlantillaExamen = useCallback(async (idSesion: number) => {
    if (!userId) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);

    try {
      const response = await apiClient.get(`/capacitaciones/sesiones/${idSesion}/plantilla-examen`);
      return response.data;

    } catch (err) {
      const baseMessage = "Error al obtener plantilla de examen.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setIsMutating(false);
    }
  }, [userId])

  const guardarPlantillaExamen = useCallback(async (idSesion: number, plantilla: { series: Serie[] }, usuario: string) => {
    if (!userId) {
      toast.error("Usuario no autenticado.");
      return;
    }
    
    setIsMutating(true);
    setError(null);

    const payload = { plantilla, usuario }
    
    try {
      await apiClient.post(`capacitaciones/sesiones/${idSesion}/plantilla-examen`, payload)
      toast.success("Plantilla guardada exitosamente.");

    } catch (err) {
      const baseMessage = "Error al guardar la plantilla.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setIsMutating(false);
    }
  }, [userId])

  const generarExamenIndividualPDF = useCallback(async (formatoDatos: ExamenCompleto) => {
    try {
      const response = await apiClient.post(`/documents-module/examen`, formatoDatos, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(url), 5000);
    } catch (err) {
      const error = err as AxiosError;

      if (error.response && error.response.data instanceof Blob) {
        const text = await error.response.data.text();
        console.error("Respuesta del servidor:", text);
      }
      
      handleApiError(err, "Error al generar el examen de la sesion.");
    }
  }, []);

  const generarExamenPDF = useCallback(async (formatoDatosList: ExamenCompleto[]) => {
    try {
      const response = await apiClient.post(`/documents-module/examenes-combinados`, formatoDatosList, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      
      window.open(url, "_blank"); 
      setTimeout(() => window.URL.revokeObjectURL(url), 5000);

    } catch (err) {
      const error = err as AxiosError;

      if (error.response && error.response.data instanceof Blob) {
        const text = await error.response.data.text();
        console.error("Respuesta del servidor:", text);
      }
      
      handleApiError(err, "Error al generar el examen de la sesion.");
    }
  }, []);

  useEffect(() => {
    if (userId) {
      refreshCapacitacionesPendientes();
      obtenerCapacitaciones();
    }
  }, [userId, refreshCapacitacionesPendientes, obtenerCapacitaciones]);

  return useMemo(() => ({
    capacitaciones,
    capacitacionesPendientes,
    loading,
    error,
    isMutating,
    obtenerDetallesCapacitacion,
    obtenerCapacitadores,
    obtenerColaboradoresSinSesion,
    asignarCapacitacion,
    asignarSesion,
    obtenerCapacitacionesPorCapacitador,
    obtenerDetalleSesionCapacitador,
    iniciarSesionCapacitador,
    finalizarSesionCapacitador,
    registrarAsistenciaMasiva,
    descargarListaAsistencia,
    descargarExamen,
    descargarDiploma,
    descargarPlantillaAsistencia,
    descargarArchivoPorRuta,
    obtenerCapacitacionEnRevision,
    aprobarAsistencia,
    aprobarSesion,
    obtenerDetalleSesion,
    obtenerPlantillaExamen,
    guardarPlantillaExamen,
    generarExamenPDF,
    generarExamenIndividualPDF
  }), [
    capacitaciones,
    capacitacionesPendientes,
    loading,
    error,
    isMutating,
    obtenerDetallesCapacitacion,
    obtenerCapacitadores,
    obtenerColaboradoresSinSesion,
    asignarCapacitacion,
    asignarSesion,
    obtenerCapacitacionesPorCapacitador,
    obtenerDetalleSesionCapacitador,
    iniciarSesionCapacitador,
    finalizarSesionCapacitador,
    registrarAsistenciaMasiva,
    descargarListaAsistencia,
    descargarExamen,
    descargarDiploma,
    descargarPlantillaAsistencia,
    descargarArchivoPorRuta,
    obtenerCapacitacionEnRevision,
    aprobarAsistencia,
    aprobarSesion,
    obtenerDetalleSesion,
    obtenerPlantillaExamen,
    guardarPlantillaExamen,
    generarExamenPDF,
    generarExamenIndividualPDF
  ]);
}
