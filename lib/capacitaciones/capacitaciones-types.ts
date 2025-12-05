// ========================================
// TIPOS Y ENUMS
// ========================================

export type EstadoCapacitacion =
  | "CREADA"
  | "PENDIENTE_ASIGNACION"
  | "ASIGNADA"
  | "EN_PROCESO"
  | "EN_REVISION"
  | "PARCIALMENTE_COMPLETADA"
  | "FINALIZADA"
  | "RECHAZADA"
  | "FINALIZADA_CAPACITADOR"
  | "PROGRAMADA"

export type EstadoSesion =
  | "PROGRAMADA"
  | "EN_PROCESO"
  | "FINALIZADA_CAPACITADOR"
  | "EN_REVISION"
  | "FINALIZADA"
  | "RECHAZADA"

export type TipoCapacitacion = "TALLER" | "CURSO" | "CHARLA" | "OTRO"

export type Modalidad = "INTERNA" | "EXTERNA"

export type TipoOrigen = "PLAN" | "PROGRAMA"

export type EstadoColaborador =
  | "PENDIENTE"
  | "ASIGNADO_SESION"
  | "NO_ASISTIO"
  | "ASISTIO_SIN_EVALUAR"
  | "APROBADO"
  | "REPROBADO"
  | "PENDIENTE_ASISTENCIA"

// ========================================
// INTERFACES PRINCIPALES
// ========================================

export interface Capacitacion {
  ID_CAPACITACION: number
  CODIGO_DOCUMENTO: string | null
  NOMBRE: string
  OBJETIVO: string | null
  VERSION: number | null

  // Origen
  ES_SISTEMA_DOCUMENTAL: boolean
  ID_PLAN: number | null
  ID_PROGRAMA: number | null
  ID_DOCUMENTO: number | null
  ID_DETALLE_PROGRAMA: number | null
  TIPO_ORIGEN: TipoOrigen
  NOMBRE_ORIGEN: string
  DOCUMENTO_VERSION: number | null

  // Configuración general
  TIPO_CAPACITACION: TipoCapacitacion
  MODALIDAD: Modalidad
  FECHA_PROGRAMADA: string | null

  // Evaluación (común a todas las sesiones)
  APLICA_EXAMEN: boolean
  NOTA_MINIMA: number | null
  APLICA_DIPLOMA: boolean

  // Estado y control
  ESTADO: EstadoCapacitacion
  OBSERVACIONES: string | null

  // Metadatos
  FECHA_CREACION: string
  FECHA_MODIFICACION: string | null
  USUARIO_CREACION: string | null

  // Temas asociados
  TEMAS: string

  // Estadísticas agregadas
  TOTAL_COLABORADORES: number
  PENDIENTES_ASIGNAR_SESION: number
  TOTAL_SESIONES_CREADAS: number
}

export interface CapacitacionSesion {
  ID_SESION: number
  ID_CAPACITACION: number
  NUMERO_SESION: number
  NOMBRE_SESION: string | null

  // Capacitador
  CAPACITADOR_ID: number
  CAPACITADOR_NOMBRE: string
  CAPACITADOR_CORREO: string | null
  CAPACITADOR_TELEFONO: string | null

  // Fecha y horario
  FECHA_INICIO: string
  HORA_INICIO: string
  HORA_FIN: string
  DURACION_MINUTOS: number | null

  // Grupo
  GRUPO_OBJETIVO: string | null
  URL_LISTA_ASISTENCIA: string | null

  // Estado
  ESTADO: EstadoSesion
  OBSERVACIONES: string | null

  // Estadísticas de la sesión
  TOTAL_COLABORADORES: number
  TOTAL_ASISTENCIAS: number
  TOTAL_AUSENCIAS: number
  TOTAL_PENDIENTES: number
  TOTAL_APROBADOS: number
  TOTAL_REPROBADOS: number
  PROMEDIO_NOTAS: number | null

  // Metadatos
  FECHA_CREACION: string
  FECHA_MODIFICACION: string | null
  USUARIO_CREACION: string | null
}

export interface ColaboradorCapacitacion {
  ID_CAPACITACION: number
  ID_COLABORADOR: number
  ID_SESION: number | null

  // Datos del colaborador
  NOMBRE: string
  APELLIDO: string
  NOMBRE_COMPLETO: string
  CORREO: string
  TELEFONO: string | null
  DEPARTAMENTO: string
  PUESTO: string
  FECHA_INGRESO: string

  // Asistencia
  ASISTIO: boolean | null
  FECHA_ASISTENCIA: string | null

  // Evaluación
  NOTA_OBTENIDA: number | null
  APROBADO: boolean | null
  URL_EXAMEN: string | null
  URL_DIPLOMA: string | null

  // Control
  FECHA_ASIGNACION: string
  OBSERVACIONES: string | null

  // Estado calculado
  ESTADO_COLABORADOR: EstadoColaborador

  // Información de sesión
  NUMERO_SESION: number | null
  NOMBRE_SESION: string | null
  FECHA_INICIO: string | null
  HORA_INICIO: string | null
  HORA_FIN: string | null
  CAPACITADOR: string | null
}

export interface ColaboradoresSinSesion {
  ID_COLABORADOR: number
  NOMBRE: string
  APELLIDO: string
  NOMBRE_COMPLETO: string
  CORREO: string
  TELEFONO: string
  FECHA_INGRESO: string
  DEPARTAMENTO: string
  PUESTO: string
  FECHA_ASIGNACION: string
  DIAS_SIN_ASIGNAR: number
}

export interface DetalleCapacitacion {
  capacitacion: Capacitacion
  sesiones: CapacitacionSesion[]
  colaboradores: ColaboradorCapacitacion[]
  colaboradoresSinSesion: ColaboradorCapacitacion[]
}

export interface Capacitador {
  ID_USUARIO: number
  PERSONA_ID: number
  ESTADO: boolean
  NOMBRE: string
  APELLIDO: string
  CORREO: string
}

export interface AsignarCapacitacion {
  idCapacitacion: number
  idsColaboradores: number[]
  tipoCapacitacion: string
  modalidad: string
  aplicaExamen: boolean
  notaMinima: number | null
  aplicaDiploma: boolean
}

export interface AsignarSesion {
  idCapacitacion: number
  nombreSesion?: string
  capacitadorId: number,
  fechaInicio: string
  horaInicio: string
  horaFin: string
  idsColaboradores: number[]
  grupoObjetivo: string
  observaciones: string
  usuario: string
  objetivo?: string
  version: number
}

export interface CrearSesionAsignarColaboradores {
  idCapacitacion: number
  idsColaboradores: number[]
  capacitadorId: number,
  fechaProgramada: string
  horaInicio: string
  horaFin: string
  nombreSesion?: string
  tipoCapacitacion: string
  modalidad: string
  grupoObjetivo: string
  objetivo?: string
  aplicaExamen: boolean
  notaMinima: number | null
  aplicaDiploma: boolean
  observaciones: string
  usuario: string
}


// ========================================
// FUNCIONES HELPER
// ========================================

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

  return `${formatHora(horaInicio)} - ${formatHora(horaFin)}`
}

export function formatearDuracion(minutos: number): string {
  const horas = Math.floor(minutos / 60)
  const mins = minutos % 60

  if (horas === 0) return `${mins}min`
  if (mins === 0) return `${horas}h`
  return `${horas}h ${mins}min`
}

export function getEstadoCapacitacionColor(estado: EstadoCapacitacion): string {
  const colors: Record<EstadoCapacitacion, string> = {
    CREADA: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    PENDIENTE_ASIGNACION: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    FINALIZADA_CAPACITADOR: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    ASIGNADA: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    EN_PROCESO: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    EN_REVISION: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    PARCIALMENTE_COMPLETADA: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
    FINALIZADA: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    RECHAZADA: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    PROGRAMADA: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  }
  return colors[estado]
}

export function getEstadoSesionColor(estado: EstadoSesion): string {
  const colors: Record<EstadoSesion, string> = {
    PROGRAMADA: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    EN_PROCESO: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    FINALIZADA_CAPACITADOR: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    EN_REVISION: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    FINALIZADA: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    RECHAZADA: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  }
  return colors[estado]
}

export function calcularEstadoColaborador(colaborador: ColaboradorCapacitacion): EstadoColaborador {
  if (colaborador.ID_SESION === null) return "PENDIENTE"
  if (colaborador.ASISTIO === null) return "ASIGNADO_SESION"
  if (colaborador.ASISTIO === false) return "NO_ASISTIO"
  if (colaborador.ASISTIO === true && colaborador.APROBADO === null) return "ASISTIO_SIN_EVALUAR"
  if (colaborador.APROBADO === true) return "APROBADO"
  if (colaborador.APROBADO === false) return "REPROBADO"
  return "PENDIENTE"
}

export function getEstadoCapacitacionDescripcion(estado: EstadoCapacitacion): string {
  const descripciones: Record<EstadoCapacitacion, string> = {
    CREADA: "Capacitación creada recientemente",
    PROGRAMADA: "Asignado a un capacitador",
    PENDIENTE_ASIGNACION: "Esperando asignación de sesiones y colaboradores",
    ASIGNADA: "Sesiones asignadas, esperando inicio",
    EN_PROCESO: "Capacitación en curso",
    EN_REVISION: "En revisión por RRHH",
    FINALIZADA_CAPACITADOR: "Finalizado por capacitador",
    PARCIALMENTE_COMPLETADA: "Algunas sesiones completadas",
    FINALIZADA: "Proceso completado",
    RECHAZADA: "Rechazada",
  }
  return descripciones[estado]
}

export function getEstadoSesionDescripcion(estado: EstadoSesion): string {
  const descripciones: Record<EstadoSesion, string> = {
    PROGRAMADA: "Programada - Pendiente de iniciar",
    EN_PROCESO: "En proceso - Registrando asistencias",
    FINALIZADA_CAPACITADOR: "Finalizada - En revisión por RRHH",
    EN_REVISION: "En revisión por RRHH",
    FINALIZADA: "Finalizada y aprobada",
    RECHAZADA: "Rechazada",
  }
  return descripciones[estado]
}

export function getEstadoColaboradorColor(estado: EstadoColaborador): string {
  const colors: Record<EstadoColaborador, string> = {
    PENDIENTE: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    NO_ASISTIO: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    ASIGNADO_SESION: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    ASISTIO_SIN_EVALUAR: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    APROBADO: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    REPROBADO: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    PENDIENTE_ASISTENCIA: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
  }
  return colors[estado]
}


export interface ApiCapacitacionSesion {
  ID_SESION: number | null;
  ID_CAPACITACION: number;
  TIPO_REGISTRO: "SESION" | "CAPACITACION_SIN_SESION";
  CODIGO_DOCUMENTO: string | null;
  CAPACITACION_NOMBRE: string;
  OBJETIVO: string | null;
  VERSION: number | null;
  ES_SISTEMA_DOCUMENTAL: boolean;
  TIPO_CAPACITACION: string;
  MODALIDAD: string;
  NUMERO_SESION: number | null;
  NOMBRE_SESION: string | null;
  GRUPO_OBJETIVO: string | null;
  CAPACITADOR_ID: number | null;
  CAPACITADOR_NOMBRE: string | null;
  CAPACITADOR_CORREO: string | null;
  CAPACITADOR_TELEFONO: string | null;
  FECHA_PROGRAMADA: string | null;
  FECHA_INICIO: string | null;
  HORA_INICIO: string | null;
  HORA_FIN: string | null;
  DURACION_MINUTOS: number | null;
  FECHA_FORMATO: string | null;
  FECHA_FORMATO_LARGO: string | null;
  HORARIO_FORMATO: string | null;
  HORARIO_FORMATO_12H: string | null;
  DURACION_FORMATO: string | null;
  APLICA_EXAMEN: boolean;
  NOTA_MINIMA: number | null;
  APLICA_DIPLOMA: boolean;
  ESTADO: EstadoCapacitacion;
  ESTADO_CAPACITACION: string;
  ESTADO_SESION: EstadoCapacitacion;
  URL_LISTA_ASISTENCIA: string | null;
  OBSERVACIONES_SESION: string | null;
  OBSERVACIONES_CAPACITACION: string | null;
  ID_PLAN: number | null;
  ID_PROGRAMA: number | null;
  ID_DOCUMENTO: number | null;
  ID_DETALLE_PROGRAMA: number | null;
  TIPO_ORIGEN: string;
  NOMBRE_ORIGEN: string;
  ID_DEPARTAMENTO: number | null;
  DEPARTAMENTO: string | null;
  DEPARTAMENTO_CODIGO: string | null;
  TEMAS: string | null;
  TOTAL_COLABORADORES: number;
  TOTAL_ASISTENCIAS: number;
  TOTAL_AUSENCIAS: number;
  PENDIENTES_REGISTRAR: number;
  TOTAL_APROBADOS: number;
  TOTAL_REPROBADOS: number;
  PROMEDIO_NOTAS: number | null;
  PORCENTAJE_COMPLETADO: number;
  COLABORADORES_SIN_SESION: number;
  TOTAL_SESIONES_CREADAS: number;
  ESTADO_DESCRIPTIVO: string;
  NECESITA_CREAR_SESION: number;
  PUEDE_INICIAR: number;
  PUEDE_FINALIZAR: number;
  REQUIERE_REVISION: number;
  DIAS_DESDE_SESION: number | null;
  DIAS_EN_REVISION: number | null;
  FECHA_CREACION_SESION: string | null;
  FECHA_MODIFICACION_SESION: string | null;
  USUARIO_CREACION_SESION: string | null;
  FECHA_CREACION_CAPACITACION: string;
  FECHA_MODIFICACION_CAPACITACION: string | null;
  CLAVE_UNICA: string;
}
