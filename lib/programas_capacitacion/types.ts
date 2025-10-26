import { Departamento, Puesto } from "../types"

export interface ProgramaCapacitacion {
  ID_PROGRAMA: number
  NOMBRE: string
  DESCRIPCION: string
  TIPO: string
  PERIODO: number
  FECHA_CREACION: string
  ESTADO: string
  PROGRAMA_DETALLES: ProgramaDetalle[]
}

export interface ProgramaDetalle {
  ID_DETALLE: number
  NOMBRE: string
  CATEGORIA_CAPACITACION: string
  TIPO_CAPACITACION: string
  APLICA_TODOS_COLABORADORES: boolean
  APLICA_DIPLOMA: boolean
  MES_PROGRAMADO: number
  ESTADO: string
  PROGRAMA_ID: number
  DEPARTAMENTO_RELACIONES: Departamento[]
  PUESTO_RELACIONES: Puesto[]
}

export type ProgramaCapacitacionForm = Partial<
  Omit<ProgramaCapacitacion, "PROGRAMA_DETALLES">
> & {
  PROGRAMA_DETALLES: ProgramaDetalleForm[]
}

export type ProgramaDetalleForm = Omit<ProgramaDetalle, "ID_DETALLE" | "PROGRAMA_ID"> & {
  DEPARTAMENTOS_IDS?: number[],
  PUESTOS_IDS?: number[]
}

export interface CreateProgramaDetalleDto {
  NOMBRE: string
  CATEGORIA_CAPACITACION: string
  TIPO_CAPACITACION: string
  APLICA_TODOS_COLABORADORES: boolean
  APLICA_DIPLOMA: boolean
  MES_PROGRAMADO: number
  ESTADO: string
  PROGRAMA_ID?: number
  DEPARTAMENTOS_IDS: number[]
  PUESTOS_IDS: number[]
}

export type ProgramaDetalleBase = Omit<ProgramaDetalleForm, 
    "DEPARTAMENTOS_IDS" | "PUESTOS_IDS"
>;
