import { Departamento } from "../types"

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
  APLICA_TODOS_DEPARTAMENTOS: boolean
  APLICA_DIPLOMA: boolean
  FECHA_PROGRAMADA: string
  ESTADO: string
  PROGRAMA_ID: number
  DEPARTAMENTO_RELACIONES: Departamento[]
}

export type ProgramaCapacitacionForm = Partial<
  Omit<ProgramaCapacitacion, "PROGRAMA_DETALLES">
> & {
  PROGRAMA_DETALLES: ProgramaDetalleForm[]
}

export type ProgramaDetalleForm = Omit<ProgramaDetalle, "ID_DETALLE" | "PROGRAMA_ID"> & {
  DEPARTAMENTOS_IDS?: number[]
}

export interface CreateProgramaDetalleDto {
  PROGRAMA_ID: number
  NOMBRE: string
  CATEGORIA_CAPACITACION: string
  TIPO_CAPACITACION: string
  APLICA_TODOS_DEPARTAMENTOS: boolean
  APLICA_DIPLOMA: boolean
  FECHA_PROGRAMADA: string
  ESTADO: string
  DEPARTAMENTOS_IDS: number[]
}

