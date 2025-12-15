import { apiClient } from "@/lib/api-client";
import { UsuarioLogin } from "@/lib/auth";
import type { ApiCapacitacionSesion, CrearSesionAsignarColaboradores, EditarSesion } from "@/lib/capacitaciones/capacitaciones-types";
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

  const [capacitaciones, setCapacitaciones] = useState<ApiCapacitacionSesion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

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
      return undefined;
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
      return [];
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
      return [];
    } finally {
      setIsMutating(false);
    }
  }, [userId]);

  const obtenerColaboradoresSinSesion = useCallback(async (idCapacitacion: number) => {  
    if (!userId) {
      return [];
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
      return [];
    } finally {
      setIsMutating(false);
    }
  }, [userId]);

  const crearSesionAsignarColaboradores = useCallback(async (payload: CrearSesionAsignarColaboradores) => {
    if (!userId) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);
    let successMessage = "";

    try {
      await apiClient.post('/capacitaciones/crear/sesion', payload);
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
      return undefined;
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
    } finally {
      setIsMutating(false);
    }
  }, [userId]);

  const obtenerDetalleSesionCapacitador = useCallback(async (idSesion: number, idCapacitador: number) => {  
    if (!userId) {
      return undefined;
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
      return undefined;
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
      return undefined;
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
    file: File | null
  ) => {  
    if (!userId) {
      toast.error("Usuario no autenticado.");
      return;
    }
    
    if (file && file.type !== "application/pdf") {
      toast.error("El archivo debe ser un PDF válido.");
      return;
    }
    
    setIsMutating(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('idCapacitador', idCapacitador.toString());
    formData.append('observaciones', observaciones || '');
    
    if (file) {
      formData.append('listaAsistencia', file);
    }
    
    try {
      await apiClient.put(`/capacitaciones/${idSesion}/sesion/finalizar`, formData);
      const successMessage = file 
        ? "Sesión finalizada exitosamente con nuevo archivo."
        : "Sesión finalizada exitosamente con archivo existente.";
      toast.success(successMessage);
    } catch (err) {
      const baseMessage = "Error al finalizar sesión.";
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
    
    const formData = new FormData();
    
    const colaboradoresDataJson = colaboradores.map(colab => {
      return {
        idColaborador: colab.idColaborador,
        asistio: colab.asistio,
        notaObtenida: colab.notaObtenida,
        observaciones: colab.observaciones,
        urlExamen: colab.urlExamen || undefined,
        urlDiploma: colab.urlDiploma || undefined,
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
      
      toast.success("Asistencias y documentos registrados exitosamente.");
      return response.data;
    } catch (err) {
      const baseMessage = "Error al registrar asistencias.";
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

  const descargarListaAsistencia = useCallback(async (idSesion: number): Promise<string | undefined> => {
    if (!userId) {
      return undefined;
    }

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
  }, [userId]);

  const descargarExamen = useCallback(async (idSesion: number, idColaborador: number): Promise<string | undefined> => {
    if (!userId) {
      return undefined;
    }

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
  }, [userId]);

  const descargarDiploma = useCallback(async (idSesion: number, idColaborador: number): Promise<string | undefined> => {
    if (!userId) {
      return undefined;
    }

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
  }, [userId]);

  const descargarPlantillaAsistencia = useCallback(async (formatoDatos: ListadoAsistencia) => {
    if (!userId) {
      toast.error("Usuario no autenticado.");
      return;
    }

    // Vista previs mas descarga
/*     try {
      const response = await apiClient.post(`/documents-module/asistencia`, formatoDatos, {
        responseType: "blob",
      });
      
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      
      // Abrir en nueva pestaña para vista previa
      const newWindow = window.open(url, "_blank");
      
      // Opcional: también ofrecer descarga automática
      if (newWindow) {
        // El usuario puede ver y luego descargar desde el navegador
        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      } else {
        // Si el popup fue bloqueado, forzar descarga
        const link = document.createElement("a");
        link.href = url;
        link.download = "listado-asistencia.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
      } */

    // Descarga directa
    try {
      const response = await apiClient.post(`/documents-module/asistencia`, formatoDatos, {
        responseType: "blob",
      });
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = "induccion-documental.pdf";
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      const nombreCapacitacion = formatoDatos.nombreCapacitacion;
      const sesion = formatoDatos.sesion;
      
      const limpiarNombre = (texto: string) => {
        return texto
          .replace(/[<>:"/\\|?*]/g, '')
          .replace(/\s+/g, '_')
          .trim();
      };
      
      const extension = filename.includes('.') ? filename.split('.').pop() : 'pdf';
      const nombreBase = filename.replace(/\.[^/.]+$/, '');
      
      const nombreCapacitacionLimpio = limpiarNombre(nombreCapacitacion);
      const sesionLimpia = limpiarNombre(sesion);
      const nombreFinal = `${nombreBase}_${nombreCapacitacionLimpio}_${sesionLimpia}.${extension}`;
      
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = nombreFinal;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (err) {
      const error = err as AxiosError;

      if (error.response && error.response.data instanceof Blob) {
        const text = await error.response.data.text();
        console.error("Respuesta del servidor:", text);
      }
      
      handleApiError(err, "Error al generar la plantilla de asistencia.");
    }
  }, [userId]);

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
      return undefined;
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
    if (!userId) {
      toast.error("Usuario no autenticado.");
      return;
    }

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
  }, [userId]);

  const generarExamenPDF = useCallback(async (formatoDatosList: ExamenCompleto[]) => {
    if (!userId) {
      toast.error("Usuario no autenticado.");
      return;
    }

    try {
      const response = await apiClient.post(`/documents-module/examenes-combinados`, formatoDatosList, {
        responseType: "blob",
      });
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = "examenes_combinados.pdf";
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      const nombreCapacitacion = formatoDatosList[0]?.trainingName;
      const sesion = formatoDatosList[0]?.sesion || 'sesion';
      
      const limpiarNombre = (texto: string) => {
        return texto
          .replace(/[<>:"/\\|?*]/g, '')
          .replace(/\s+/g, '_')
          .trim();
      };
      
      const extension = filename.includes('.') ? filename.split('.').pop() : 'pdf';
      const nombreBase = filename.replace(/\.[^/.]+$/, '');
      
      const nombreCapacitacionLimpio = limpiarNombre(nombreCapacitacion);
      const sesionLimpia = limpiarNombre(sesion);
      const nombreFinal = `${nombreBase}_${nombreCapacitacionLimpio}_${sesionLimpia}.${extension}`;
      
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = nombreFinal;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (err) {
      const error = err as AxiosError;

      if (error.response && error.response.data instanceof Blob) {
        const text = await error.response.data.text();
        console.error("Respuesta del servidor:", text);
      }
      
      handleApiError(err, "Error al generar el examen de la sesion.");
    }
  }, [userId]);

  const devolverSesion = useCallback(async (idSesion: number, usuario: string, observaciones: string) => {  
    if (!userId) {
      toast.error("Usuario no autenticado.");
      return;
    }

    setIsMutating(true);
    setError(null);
    let successMessage = "";

    const payload = { idSesion, usuario, observaciones }

    try {
      await apiClient.put(`/capacitaciones/${idSesion}/sesion/devolver`, payload);
      successMessage = "Sesion devuelta exitosamente.";
      toast.success(successMessage);
    } catch (err) {
      const baseMessage = "Error al devolver sesion.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
    } finally {
      setIsMutating(false);
    }
  }, [userId]);

  const editarSesion = useCallback(async (payload: EditarSesion) => {
    if (!userId) {
      toast.error("Usuario no autenticado.");
      return { success: false };
    }

    setIsMutating(true);
    setError(null);

    try {
      const response = await apiClient.put('/capacitaciones/editar/sesion', payload);
      toast.success("Sesión editada exitosamente.");
      return { success: true, data: response.data };
    } catch (err) {
      const baseMessage = "Error al editar sesión.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
      return { success: false };
    } finally {
      setIsMutating(false);
    }
  }, [userId]);

  const finalizarSesionConAsistencias = useCallback(async (
    idSesion: number,
    idCapacitador: number,
    colaboradores: ColaboradorAsistenciaData[],
    listaAsistenciaFile: File | null,
    observaciones?: string,
    soloGuardar: boolean = false
  ) => {
    if (!userId) {
      toast.error("Usuario no autenticado.");
      return;
    }
    
    // Validar que la lista de asistencia sea PDF si se está subiendo un nuevo archivo
    if (listaAsistenciaFile && listaAsistenciaFile.type !== "application/pdf") {
      toast.error("La lista de asistencia debe ser un PDF válido.");
      return;
    }
    
    setIsMutating(true);
    setError(null);
    
    const formData = new FormData();
    
    // 1. Agregar parámetros básicos
    formData.append('idCapacitador', idCapacitador.toString());
    formData.append('soloGuardar', soloGuardar.toString());
    
    if (observaciones) {
      formData.append('observaciones', observaciones);
    }
    
    // 2. Agregar lista de asistencia general (si existe)
    if (listaAsistenciaFile) {
      formData.append('listaAsistencia', listaAsistenciaFile);
    }
    
    // 3. Preparar datos de colaboradores (sin archivos)
    const colaboradoresDataJson = colaboradores.map(colab => ({
      idColaborador: colab.idColaborador,
      asistio: colab.asistio,
      notaObtenida: colab.notaObtenida ?? null,
      observaciones: colab.observaciones,
    }));
    
    formData.append('colaboradores', JSON.stringify(colaboradoresDataJson));
    
    // 4. Agregar archivos individuales (exámenes y diplomas)
    colaboradores.forEach(colab => {
      if (colab.archivoExamen instanceof File) {
        formData.append(`examen_${colab.idColaborador}`, colab.archivoExamen);
      }
      if (colab.archivoDiploma instanceof File) {
        formData.append(`diploma_${colab.idColaborador}`, colab.archivoDiploma);
      }
    });
    
    try {
      const response = await apiClient.put(`/capacitaciones/${idSesion}/finalizar-con-asistencias`, formData, {
        headers: {
        },
      });
      
      const successMessage = soloGuardar 
        ? "Cambios guardados exitosamente. Puedes continuar editando."
        : "Sesión finalizada exitosamente. Será revisada por RRHH.";
      
      toast.success(successMessage);
      return response.data;
      
    } catch (err) {
      const baseMessage = soloGuardar 
        ? "Error al guardar los cambios."
        : "Error al finalizar la sesión.";
      setError(baseMessage);
      handleApiError(err, baseMessage);
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      obtenerCapacitaciones();
    }
  }, [userId, obtenerCapacitaciones]);

  return useMemo(() => ({
    capacitaciones,
    loading,
    error,
    isMutating,
    obtenerDetallesCapacitacion,
    obtenerCapacitadores,
    obtenerColaboradoresSinSesion,
    crearSesionAsignarColaboradores,
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
    generarExamenIndividualPDF,
    devolverSesion,
    editarSesion,
    finalizarSesionConAsistencias,
  }), [
    capacitaciones,
    loading,
    error,
    isMutating,
    obtenerDetallesCapacitacion,
    obtenerCapacitadores,
    obtenerColaboradoresSinSesion,
    crearSesionAsignarColaboradores,
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
    generarExamenIndividualPDF,
    devolverSesion,
    editarSesion,
    finalizarSesionConAsistencias,
  ]);
}
