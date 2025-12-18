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

export interface AsignarProgramaCapacitacion {
  idPrograma: number
  usuario: string
  NOMBRE: string
}

export interface AsignacionDetalle {
  idColaborador: number;
  detalles: number[];
}

export interface AsignarProgramaCapacitacionSelectivo {
  idPrograma: number;
  asignaciones: AsignacionDetalle[];
  usuario: string;
}

export interface AplicarPlan {
  idPlan: number;
  idsColaboradores: number[];
  usuario: string;
  NOMBRE: string
}

export interface CapacitacionPrograma {
  idDetalle: number
  nombre: string
  categoria: string
  tipo: string
  mes: number
  yaTieneCapacitacion: boolean
  puedeAsignarse: boolean
}

export interface ColaboradorDisponiblePrograma {
  idColaborador: number
  nombre: string
  departamento: string
  puesto: string
  fechaIngreso: string
  yaTieneProgramaActivo: boolean
  capacitaciones: CapacitacionPrograma[]
}

export interface CapacitacionDisponible {
  idDetalle: number;
  nombre: string;
  categoria: string;
  tipo: string;
  mes: number;
  yaTieneCapacitacion: boolean;
  puedeAsignarse: boolean;
}

export interface ColaboradorDisponiblePrograma {
  idColaborador: number;
  nombre: string;
  departamento: string;
  puesto: string;
  fechaIngreso: string;
  yaTieneProgramaActivo: boolean;
  capacitaciones: CapacitacionDisponible[];
}

export interface AsignacionDetalle {
  idColaborador: number;
  detalles: number[];
}

export interface AsignarProgramaCapacitacionSelectivo {
  idPrograma: number;
  asignaciones: AsignacionDetalle[];
  usuario: string;
}