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
