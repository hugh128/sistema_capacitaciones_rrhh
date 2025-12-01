// Training/Capacitacion Types and Interfaces

export type EstadoCapacitacion =
  | "CREADA"
  | "PENDIENTE_ASIGNACION"
  | "ASIGNADA"
  | "EN_PROCESO"
  | "FINALIZADA_CAPACITADOR"
  | "EN_REVISION"
  | "FINALIZADA"
  | "CANCELADA"
  | "PROGRAMADA"

export type TipoCapacitacion = "TALLER" | "CURSO" | "CHARLA" | "OTRO"

export type Modalidad = "INTERNA" | "EXTERNA"

export type TipoOrigen = "PLAN" | "PROGRAMA"

export type EstadoColaborador = "PENDIENTE" | "NO_ASISTIO" | "ASISTIO_SIN_EVALUAR" | "APROBADO" | "REPROBADO"

export interface Capacitacion {
  ID_CAPACITACION: number
  CODIGO_DOCUMENTO: string | null
  NOMBRE: string
  OBJETIVO: string
  VERSION: number | null
  ES_SISTEMA_DOCUMENTAL: boolean
  TIPO_CAPACITACION: TipoCapacitacion
  MODALIDAD: Modalidad
  GRUPO_OBJETIVO: string
  CAPACITADOR_ID: number | null
  CAPACITADOR_NOMBRE: string
  FECHA_PROGRAMADA: string | null
  FECHA_INICIO: string | null
  HORA_INICIO: string | null // "14:00:00"
  HORA_FIN: string | null // "16:30:00"
  DURACION_MINUTOS: number | null // Calculado automáticamente
  HORARIO_FORMATO: string // "02:00 PM a 04:30 PM"
  DURACION_FORMATO: string // "2h 30min"
  APLICA_EXAMEN: boolean
  NOTA_MINIMA: number | null
  APLICA_DIPLOMA: boolean
  ESTADO: EstadoCapacitacion
  URL_LISTA_ASISTENCIA: string | null
  OBSERVACIONES: string
  TIPO_ORIGEN: TipoOrigen
  NOMBRE_ORIGEN: string
  TEMAS: string // String separado por comas
  TOTAL_COLABORADORES_PENDIENTES: number
}

export interface CapacitacionSesion {
  ID_SESION: number;
  ID_CAPACITACION: number;
  CODIGO_DOCUMENTO: string | null
  NOMBRE: string
  OBJETIVO: string
  VERSION: number | null
  ES_SISTEMA_DOCUMENTAL: boolean
  TIPO_CAPACITACION: TipoCapacitacion
  MODALIDAD: Modalidad
  NUMERO_SESION: number;
  NOMBRE_SESION: string | null; 
  GRUPO_OBJETIVO: string
  CAPACITADOR_ID: number | null
  CAPACITADOR_NOMBRE: string
  FECHA_PROGRAMADA: string | null
  FECHA_INICIO: string | null
  HORA_INICIO: string | null // "14:00:00"
  HORA_FIN: string | null // "16:30:00"
  DURACION_MINUTOS: number | null // Calculado automáticamente
  HORARIO_FORMATO: string // "13:00 - 14:00"
  HORARIO_FORMATO_12H: string //"1:00 PM - 2:00 PM"
  DURACION_FORMATO: string // "2h 30min"
  APLICA_EXAMEN: boolean
  NOTA_MINIMA: number | null
  APLICA_DIPLOMA: boolean
  ESTADO: EstadoCapacitacion
  URL_LISTA_ASISTENCIA: string | null
  OBSERVACIONES: string
  TIPO_ORIGEN: TipoOrigen
  NOMBRE_ORIGEN: string
  DEPARTAMENTO: string
  TEMAS: string // String separado por comas
  TOTAL_COLABORADORES_PENDIENTES?: number
  TOTAL_COLABORADORES: number
  TOTAL_ASISTENCIAS: number
  TOTAL_AUSENCIAS: number
  PENDIENTES_REGISTRAR: number
  TOTAL_APROBADOS: number
  TOTAL_REPROBADOS: number
  PROMEDIO_NOTAS: number
  PORCENTAJE_COMPLETADO: number
  ESTADO_DESCRIPTIVO: string
  PUEDE_INICIAR: number
  PUEDE_FINALIZAR: number
  FECHA_CREACION: string
  FECHA_MODIFICACION: string
  USUARIO_CREACION: string
}

export interface ColaboradorCapacitacion {
  ID_CAPACITACION: number
  ID_COLABORADOR: number
  NOMBRE_COMPLETO: string
  CORREO: string
  DEPARTAMENTO: string
  PUESTO: string
  ASISTIO: boolean | null // null = pendiente, true = asistió, false = no asistió
  FECHA_ASISTENCIA: string | null
  NOTA_OBTENIDA: number | null
  APROBADO: boolean | null
  URL_EXAMEN: string | null
  URL_DIPLOMA: string | null
  OBSERVACIONES: string
  ESTADO_COLABORADOR: EstadoColaborador
}

export interface SESION_RESPONSE {
  SESION: SESION_DETALLE;
  COLABORADORES: COLABORADORES_SESION[];
}

export interface SESION_DETALLE {
  ID_SESION: number;
  ID_CAPACITACION: number;
  NUMERO_SESION: number;
  NOMBRE_SESION: string;
  CODIGO_DOCUMENTO: string | null;
  CAPACITACION_NOMBRE: string;
  OBJETIVO: string | null;
  VERSION: number | null;
  ES_SISTEMA_DOCUMENTAL: boolean;
  TIPO_CAPACITACION: string; // "CURSO"
  MODALIDAD: string; // "EXTERNA"
  APLICA_EXAMEN: boolean;
  NOTA_MINIMA: number | null;
  APLICA_DIPLOMA: boolean;
  CAPACITADOR_ID: number | null;
  CAPACITADOR_NOMBRE: string;
  CAPACITADOR_CORREO: string | null;
  CAPACITADOR_TELEFONO: string | null;
  FECHA_PROGRAMADA: string | null;
  FECHA_INICIO: string | null;
  HORA_INICIO: string | null;
  HORA_FIN: string | null;
  DURACION_MINUTOS: number | null;
  GRUPO_OBJETIVO: string;
  FECHA_FORMATO_LARGO: string;
  FECHA_FORMATO: string;
  HORARIO_FORMATO: string;
  HORARIO_FORMATO_12H: string;
  DURACION_FORMATO: string;
  ESTADO: EstadoCapacitacion;
  ESTADO_DESCRIPTIVO: string;
  URL_LISTA_ASISTENCIA: string | null;
  OBSERVACIONES: string | null;
  TIPO_ORIGEN: string;
  NOMBRE_ORIGEN: string;
  DEPARTAMENTO: string | null;
  DEPARTAMENTO_CODIGO: string | null;
  TEMAS: string | null;
  TEMAS_CODIGOS: string | null;
  TOTAL_COLABORADORES: number;
  TOTAL_ASISTENCIAS: number;
  TOTAL_AUSENCIAS: number;
  PENDIENTES_REGISTRAR: number;
  TOTAL_APROBADOS: number;
  TOTAL_REPROBADOS: number;
  PROMEDIO_NOTAS: number | null;
  PORCENTAJE_COMPLETADO: number;
  PUEDE_INICIAR: number;
  PUEDE_FINALIZAR: number;
  PUEDE_EDITAR: number;
  FECHA_CREACION: string;
  FECHA_MODIFICACION: string | null;
  USUARIO_CREACION: string;
}

export interface COLABORADORES_SESION {
  ID_COLABORADOR: number;
  NOMBRE: string;
  APELLIDO: string;
  NOMBRE_COMPLETO: string;
  CORREO: string;
  TELEFONO: string;
  DPI: string;
  ID_DEPARTAMENTO: number;
  DEPARTAMENTO: string;
  DEPARTAMENTO_CODIGO: string;
  ID_PUESTO: number;
  PUESTO: string;
  ASISTIO: boolean | null;
  ASISTENCIA_ESTADO: string; // "Pendiente", "Asistió", etc.
  FECHA_ASISTENCIA: string | null;
  NOTA_OBTENIDA: number | null;
  APROBADO: boolean | null;
  EVALUACION_ESTADO: string; // "Sin evaluar", "Aprobado", etc.
  URL_EXAMEN: string | null;
  URL_DIPLOMA: string | null;
  TIENE_DIPLOMA: number; // 0 o 1
  OBSERVACIONES: string | null;
  FECHA_ASIGNACION: string;
  REQUIERE_REGISTRAR_ASISTENCIA: number;
  REQUIERE_EVALUAR: number;
  REQUIERE_DIPLOMA?: number;
  ESTADO_COLABORADOR: EstadoColaborador;
}

export interface ColaboradorAsistenciaData {
  idColaborador: number;
  asistio: boolean;
  notaObtenida?: number | null;
  observaciones?: string;
  archivoExamen?: File;
  archivoDiploma?: File;
}

export interface FileState {
    [colaboradorId: number]: File | null;
}

export interface ListadoAsistencia {
  sistemaDocumental: boolean
  codigoDocumento: string | null
  version: string | undefined
  documentosAsociados: string | null
  taller: boolean
  curso: boolean
  otro: boolean
  interno: boolean
  externo: boolean
  grupoObjetivo: string
  nombreCapacitacion: string
  objetivoCapacitacion: string
  nombreFacilitador: string
  fechaCapacitacion: string
  horario: string
  horasCapacitacion: string
  asistentes: AsistenteListado[]
  observaciones: string
  sesion: string
}

export interface AsistenteListado {
  nombre: string
  area?: string
  nota?: string
}

export type TipoPregunta = "OPEN" | "MULTIPLE_CHOICE" | "ESSAY";

export interface OpcionMultiple {
  label: string; // "A", "B", "C", "D"
  text: string;
}

export interface Question {
  type: TipoPregunta;
  question: string;
  lines?: number; // Para OPEN y ESSAY
  options?: OpcionMultiple[]; // Para MULTIPLE_CHOICE
}

export interface Serie {
  numero: number;
  title: string; // "I SERIE", "II SERIE", etc.
  instructions: string;
  questions: Question[];
}

export interface PlantillaExamen {
  series: Serie[];
}

export interface ExamenCompleto {
  collaboratorName: string;
  documentCode: string;
  department: string;
  trainingName: string;
  internal: string; // "X" or ""
  external: string; // "X" or ""
  passingScore: string; // e.g., "70"
  series: Serie[];
  sesion?: string
}

// Helper functions
export function calcularDuracionMinutos(horaInicio: string, horaFin: string): number {
  const [horasInicio, minutosInicio] = horaInicio.split(":").map(Number)
  const [horasFin, minutosFin] = horaFin.split(":").map(Number)

  const totalMinutosInicio = horasInicio * 60 + minutosInicio
  const totalMinutosFin = horasFin * 60 + minutosFin

  return totalMinutosFin - totalMinutosInicio
}

export function formatearHorario(horaInicio: string, horaFin: string): string {
  const formatHora = (hora: string) => {
    const [horas, minutos] = hora.split(":").map(Number)
    const periodo = horas >= 12 ? "PM" : "AM"
    const horas12 = horas % 12 || 12
    return `${horas12.toString().padStart(2, "0")}:${minutos.toString().padStart(2, "0")} ${periodo}`
  }

  return `${formatHora(horaInicio)} a ${formatHora(horaFin)}`
}

export function formatearDuracion(minutos: number): string {
  const horas = Math.floor(minutos / 60)
  const mins = minutos % 60

  if (horas === 0) return `${mins}min`
  if (mins === 0) return `${horas}h`
  return `${horas}h ${mins}min`
}

export function getEstadoColor(estado: EstadoCapacitacion): string {
  const colors: Record<EstadoCapacitacion, string> = {
    CREADA: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    PENDIENTE_ASIGNACION: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    PROGRAMADA: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    ASIGNADA: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    EN_PROCESO: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    FINALIZADA_CAPACITADOR: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    EN_REVISION: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    FINALIZADA: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    CANCELADA: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  }
  return colors[estado]
}

export function getEstadoColaboradorColor(estado: EstadoColaborador): string {
  const colors: Record<EstadoColaborador, string> = {
    PENDIENTE: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    NO_ASISTIO: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    ASISTIO_SIN_EVALUAR: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    APROBADO: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    REPROBADO: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  }
  return colors[estado]
}
