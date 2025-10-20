import { CodigoPadre } from "../codigos/types"
import { Departamento, Puesto } from "../types"

export type PlanType = "Induccion" | "Individual"
export type ProgramType = "Programa"
export type PlanStatus = "Activo" | "Borrador" | "Inactivo"
export type TrainingCategory = "GENERAL" | "ESPECIFICA" | "CONTINUA"
export type TrainingType = "INTERNA" | "EXTERNA"

// Training Plan (Inducción, Individual)
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
  selectedDepartment?: string // Single department
  appliesToAllPositions: boolean // Checkbox for all positions
  applicablePositions: string[] // Only if appliesToAllPositions is false
  applicableDepartment?: string
}

// Training Program (Programa)
export type TrainingProgram = {
  id: string
  code: string
  name: string
  description: string
  type: ProgramType
  period: number // Year
  createdAt: string // Display only
  status: PlanStatus
  trainings: ProgramTraining[]
  trainingCount?: number
}

// Training within a Plan
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

// Training within a Program
export type ProgramTraining = {
  id: string
  name: string
  trainer?: string // Optional
  category: TrainingCategory
  type: TrainingType
  appliesToAllDepartments: boolean
  applicableDepartments: string[] // Only if appliesToAllDepartments is false
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
