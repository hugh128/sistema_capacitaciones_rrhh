import { CodigoPadre } from "../codigos/types"
import { detallePlan } from "../colaboradores/type"
import { Departamento, Puesto } from "../types"

export type PlanType = "INDUCCION" | "INDIVIDUAL"
export type ProgramType = "Programa"
export type PlanStatus = "Activo" | "Borrador" | "Inactivo"
export type TrainingCategory = "GENERAL" | "ESPECIFICA" | "CONTINUA"
export type TrainingType = "INTERNA" | "EXTERNA"

export type TrainingPlan = {
  id: string
  code: string
  name: string
  type: PlanType
  status: PlanStatus
  createdAt: string
  description: string
  trainings: PlanTraining[]
  department?: string
  trainingCount?: number
  selectedDepartment?: string
  appliesToAllPositions: boolean
  applicablePositions: string[]
  applicableDepartment?: string
}

export type TrainingProgram = {
  id: string
  code: string
  name: string
  description: string
  type: ProgramType
  period: number
  createdAt: string
  status: PlanStatus
  trainings: ProgramTraining[]
  trainingCount?: number
}

export type PlanTraining = {
  id: string
  name: string
  description: string
  hasExam: boolean
  hasDiploma: boolean
  minScore?: number
  trainer?: string
  status: PlanStatus
  applicablePositions: string[]
}

export type ProgramTraining = {
  id: string
  name: string
  trainer?: string
  category: TrainingCategory
  type: TrainingType
  appliesToAllDepartments: boolean
  applicableDepartments: string[]
  scheduledDate?: string
  hasExam: boolean
  hasDiploma: boolean
  minScore?: number
  status: PlanStatus
}

export interface PlanCapacitacion {
  ID_PLAN: number
  NOMBRE: string
  DESCRIPCION: string
  TIPO: string
  DEPARTAMENTO_ID: number
  APLICA_TODOS_PUESTOS_DEP: boolean,
  FECHA_CREACION: string,
  ESTADO: string,
  DEPARTAMENTO: Departamento
  PLANES_PUESTOS: Puesto[]
  DOCUMENTOS_PLANES: CodigoPadre[]
}

export interface AplicarPlan {
  idPlan: number;
  idsColaboradores: number[];
  usuario: string;
  NOMBRE: string
}

export interface ColaboradorDisponible {
  ID_COLABORADOR: number;
  NOMBRE: string;
  APELLIDO: string;
  NOMBRE_COMPLETO: string;
  CORREO: string;
  TELEFONO: string;
  DPI: string;
  FECHA_INGRESO: string;
  ID_DEPARTAMENTO: number;
  DEPARTAMENTO: string;
  ID_PUESTO: number;
  PUESTO: string;
  PLAN_YA_APLICADO: boolean;
  seleccionado?: boolean;
}

export interface CambiarPlanCapacitacion {
  ID_COLABORADOR: number
  NUEVO_DEPARTAMENTO_ID: number
  NUEVO_PUESTO_ID: number
  IDS_DOCUMENTOS_MIGRAR?: number[]
  USUARIO?: string
}

export interface CambiarPlanResponse {
  ID_COLABORADOR: number,
  REQUIERE_CAMBIO_PLAN: boolean,
  PLAN_ACTUAL_ID: number,
  PLAN_ACTUAL_NOMBRE: string,
  PLAN_NUEVO_ID: number,
  PLAN_NUEVO_NOMBRE: string,
  NUEVO_DEPARTAMENTO_ID: number,
  NUEVO_PUESTO_ID: number,
  MENSAJE: string,
}

export interface InformacionPlanColaborador {
  ID_COLABORADOR: number
  NOMBRE_COLABORADOR: string
  DEPARTAMENTO_ACTUAL_ID: number
  DEPARTAMENTO_ACTUAL: string
  PUESTO_ACTUAL_ID: number
  PUESTO_ACTUAL: string
  PLAN_ACTUAL_ID: number
  PLAN_ACTUAL_NOMBRE: string
  NUEVO_DEPARTAMENTO_ID: number
  NUEVO_DEPARTAMENTO: string
  NUEVO_PUESTO_ID: number
  NUEVO_PUESTO: string
  PLAN_NUEVO_ID: number
  PLAN_NUEVO_NOMBRE: string
  TIPO_CAMBIO: string
  DOCUMENTOS_PLAN_ACTUAL: number
  DOCUMENTOS_COMPLETADOS_PLAN_ACTUAL: number
  DOCUMENTOS_PLAN_NUEVO: number
}

export interface CapacitacionMigrar {
  ID_DOCUMENTO: number
  DOCUMENTO_CODIGO: string
  NOMBRE_DOCUMENTO: string
  VERSION_COMPLETADA: number
  VERSION_ACTUAL: number
  ID_CAPACITACION: number
  CAPACITACION_NOMBRE: string
  ID_SESION: number
  NUMERO_SESION: number
  FECHA_PROGRAMADA: string
  FECHA_COMPLETADA: string
  NOTA_OBTENIDA: number
  APROBADO: boolean
  URL_DIPLOMA: string | null
  URL_EXAMEN: string | null
  EXISTE_EN_NUEVO_PLAN: number
  ESTADO_MIGRACION: 'MIGRABLE_MISMA_VERSION' | 'VERSION_DESACTUALIZADA' | 'VERSION_SUPERIOR' | 'NO_APROBADO' | 'NO_APLICA_NUEVO_PLAN' // ✅ Actualizado
  RECOMENDACION: string
}

export interface CapacitacionNueva {
  ID_DOCUMENTO: number
  DOCUMENTO_CODIGO: string
  NOMBRE_DOCUMENTO: string
  VERSION: number
  TIPO_DOCUMENTO: string
  YA_COMPLETADA_VERSION_VALIDA: number
  ESTADO: 'PUEDE_MIGRAR' | 'NUEVA_CAPACITACION'
}

export interface AnalizarCambioPlanResponse {
  INFORMACION_COLABORADOR: InformacionPlanColaborador
  CAPACITACIONES_MIGRAR: CapacitacionMigrar[]
  CAPACITACIONES_NUEVAS: CapacitacionNueva[]
}

export interface DetallePlan {
    id: number
    nombre: string
    descripcion: string
    tipo: string
    departamento: string
    codigoDepartamento: string
    aplicaTodosPuestos: boolean
    fechaCreacion: string
    estado: string
    totalCapacitaciones: number
    totalColaboradoresAsignados: number
    colaboradoresCompletaron: number
}

export interface ColaboradoresPlan {
    id: number
    nombre: string
    puesto: string
    departamento: string
    fechaAsignacion: string
    progreso: number
    capacitacionesCompletadas: number
    capacitacionesTotales: number
    avatar: null
    correo: string
    telefono: string
    fechaAsignacionRaw: string
    estadoAsignacion: string
    planCompletado: boolean
    ultimaActividad: string
}

export interface CapacitacionPlan {
    id: number,
    codigo: string
    nombre: string
    version: number
    tipo: string
    departamento: string
    estado: string
    colaboradoresCompletaron: number
    totalColaboradoresAsignados: number
}

export interface PlanConColaboradores {
  DETALLE_PLAN: detallePlan
  COLABORADORES_PLAN: ColaboradoresPlan[]
  CAPACITACIONES_PLAN: CapacitacionPlan[]
}
