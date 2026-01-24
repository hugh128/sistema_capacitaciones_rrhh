export type Collaborator = {
  id: string
  name: string
  email: string
  phone: string
  position: string
  department: string
  status: "active" | "inactive" | "on-leave"
  avatar?: string
  initials: string
  joinDate: string
  completionScore: number
  manager: string
}

export interface Colaborador {
  ID_COLABORADOR: number
  NOMBRE_COMPLETO: string
  NOMBRE: string
  APELLIDO: string
  EMAIL: string
  TELEFONO: string
  INICIALES: string
  PUESTO: string
  DEPARTAMENTO: string
  ESTADO: string
  FECHA_INGRESO: string
  FECHA_INGRESO_COMPLETA: string
  ENCARGADO: string
  ID_ENCARGADO: number
  PORCENTAJE_CUMPLIMIENTO: number,
  TOTAL_CAPACITACIONES: number,
  CAPACITACIONES_APROBADAS: number,
  CAPACITACIONES_PENDIENTES: number,
  TOTAL_SESIONES: number,
  PROXIMA_CAPACITACION: string
}

export interface CapacitacionColaborador {
  ID_SESION: number;
  ID_CAPACITACION: number;
  NOMBRE_CAPACITACION: string;
  NOMBRE_SESION: string | null;
  NUMERO_SESION: number | null;
  CATEGORIA: string;
  CODIGO_DOCUMENTO: string | null,
  ESTADO: string;
  FECHA: string;
  FECHA_RAW: string | null;
  NOTA: number | null;
  DIPLOMA: string | null;
  EXAMEN: string | null;
  ASISTENCIA: string | null;
  TIPO_CAPACITACION: string;
  MODALIDAD: string;
  ASISTIO: boolean | null;
  APROBADO: boolean | null;
  NOMBRE_CAPACITADOR: string;
  ESTADO_SESION: string | null;
}

export interface DocumentoColaborador {
  ID_COLABORADOR: number;
  ID_CAPACITACION: number;
  ID_SESION: number;
  NOMBRE_CAPACITACION: string;
  NOMBRE_SESION: string;
  NUMERO_SESION: number;
  TIPO: string;
  CATEGORIA: string;
  NOMBRE_DOCUMENTO: string;
  URL: string;
  FECHA: string;
  FECHA_CONTEO: string;
  FILE_TYPE: string;
}

export interface HistorialColaborador {
  FECHA: string
  TIEMPO: string
  ACCION: string
  DETALLE: string
  TIPO: string
  FECHA_RAW: string
}

export interface ResumenColaborador {
  ETIQUETA: string
  VALOR: string
  ESTADO: string
  ORDEN_TIPO: number
  FECHA_ORDER: string
}

export interface CapacitacionInduccion {
  documento: string
  codigo: string
  version: number
  fechaEvaluacion?: string
  lectura?: string
  capacitacion?: string
  evaluacion?: string
  calificacion?: string
  nombreCapacitador?: string
  estatus: string
}

export interface GrupoCapacitacion {
  departamentoCapacitacion: string
  capacitaciones: CapacitacionInduccion[];
}

export interface InduccionDocumental {
  nombrePlan?: string
  nombreColaborador: string
  departamentoColaborador: string
  cargo: string
  jefeInmediatoNombre: string
  gruposCapacitacion: GrupoCapacitacion[];
  fechaInicioInduccion: string
  fechaFinInduccion: string
}

export interface informacionColaborador {
  nombreColaborador: string
  departamentoColaborador: string
  cargo: string
  jefeInmediatoNombre: string
}

export interface plan {
  ID_PLAN_COLABORADOR: number
  ID_PLAN: number
  nombrePlan: string
  descripcionPlan: string
  estadoPlan: string
  tipoPlan: string
  fechaInicioInduccion: string
  fechaFinInduccion: string | null,
  totalCapacitaciones: number,
  capacitacionesCompletadas: number,
  planCompletado: boolean,
  porcentajeCompletado: number
}

export interface detallePlan {
  ID_PLAN: number
  nombrePlan: string
  departamentoCapacitacion: string
  codigoDepartamento: string
  documento: string
  codigo: string
  version: number
  nombreCapacitador: string
  fechaEvaluacion: string
  lectura: string
  capacitacion: string
  evaluacion: string
  calificacion: string
  estatus: string
  ID_CAPACITACION: number
  ID_DOCUMENTO: number
  fechaOrden: string
}

export interface DETALLE_PLAN_COLABORADOR {
  INFORMACION_COLABORADOR: informacionColaborador
  PLANES: plan[]
  DETALLE_CAPACITACIONES: detallePlan[]
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case "activo":
      return "bg-green-500 text-white"
    case "inactivo":
      return "bg-red-500 text-white"
    case "permiso":
      return "bg-yellow-500 text-white"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export const getProgressColor = (percentage: number) => {
  if (percentage >= 80) {
    return "bg-green-500"
  }
  if (percentage >= 50) {
    return "bg-yellow-500"
  }
  return "bg-red-500"
}

export const getCompletionColors = (percentage: number) => {
  let colorClass;
  let lightClass;
  let textClass;

  if (percentage < 50) {
    colorClass = "border-red-500";
    lightClass = "bg-red-500/20";
    textClass = "text-red-600 dark:text-red-400";
  } else if (percentage < 80) {
    colorClass = "border-amber-500";
    lightClass = "bg-amber-500/20";
    textClass = "text-amber-600 dark:text-amber-400";
  } else {
    colorClass = "border-green-500";
    lightClass = "bg-green-500/20";
    textClass = "text-green-600 dark:text-green-400";
  }

  return { colorClass, lightClass, textClass };
};