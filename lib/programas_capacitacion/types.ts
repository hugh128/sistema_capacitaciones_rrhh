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

export interface ProgramaCapacitacionDetalle {
  DETALLE_PROGRAMA: number
  ID_PROGRAMA: number
  NOMBRE: string
  DESCRIPCION: string
  TIPO: string
  PERIODO: number
  FECHA_CREACION: string
  ESTADO: string
  TOTAL_CAPACITACIONES: number
  TOTAL_COLABORADORES_ASIGNADOS: number
  COLABORADORES_COMPLETADOS: number
  COLABORADORES_PENDIENTES: number
}

export interface ColaboradorPrograma {
  ID_COLABORADOR: number
  NOMBRE: string
  APELLIDO: string
  NOMBRE_COMPLETO: string
  ESTADO_COLABORADOR: string
  PUESTO: string
  DEPARTAMENTO: string
  CODIGO_DEPARTAMENTO: string
  CORREO: string
  FECHA_ASIGNACION: string
  USUARIO_APLICA: string
  CAPACITACIONES_ASIGNADAS: CapacitacionAsignada[]
}

export interface CapacitacionProgramaDetalle {
  ID_CAPACITACION: number
  ID_DETALLE: number
  NOMBRE: string
  CATEGORIA_CAPACITACION: string
  TIPO_CAPACITACION: string
  APLICA_TODOS_COLABORADORES: boolean
  APLICA_DIPLOMA: boolean
  MES_PROGRAMADO: number
  ESTADO: string
  TIPO_CAPACITACION_PLANTILLA: string
  APLICA_EXAMEN: boolean
  NOTA_MINIMA: number | null
  COLABORADORES_ASIGNADOS: number
  COLABORADORES_APROBADOS: number
  COLABORADORES_AUSENTES: number
  COLABORADORES_REPROBADOS: number
  COLABORADORES_SIN_SESION: number
  DEPARTAMENTOS: string | null
  PUESTOS: string | null
}

export interface CapacitacionAsignada {
  ID_CAPACITACION: number
  ID_SESION: number | null
  ID_DETALLE: number
  NOMBRE: string
  CATEGORIA_CAPACITACION: string
  TIPO_CAPACITACION: string
  MES_PROGRAMADO: number
  COMPLETADA: boolean
  ESTADO_CAPACITACION: string
  NUMERO_SESION: string | null
  NOMBRE_SESION: string | null
  FECHA_PROGRAMADA: string | null
  ESTADO_SESION: string | null
  ASISTIO: boolean | null
  FECHA_ASISTENCIA: string | null
  NOTA_OBTENIDA: number | null
  APROBADO: boolean | null
  FECHA_ASIGNACION_CAPACITACION: string
}