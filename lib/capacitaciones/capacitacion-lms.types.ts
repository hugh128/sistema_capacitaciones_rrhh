export interface ProgramaCapacitacion {
  ID_PROGRAMA: number
  NOMBRE: string
  DESCRIPCION: string
  TIPO: string
  PERIODO: number
  FECHA_CREACION: string
  ESTADO: string
}

export interface CapacitadorLms {
  ID_USUARIO: number
  PERSONA_ID: number
  ESTADO: boolean
  NOMBRE: string
  APELLIDO: string
  CORREO: string
}

export interface ColaboradorLms {
  ID_PERSONA: number
  NOMBRE: string
  APELLIDO: string
  CORREO: string
  TIPO_PERSONA: string
  ESTADO: boolean
  DEPARTAMENTO: { NOMBRE: string } | null
  PUESTO: { NOMBRE: string } | null
}

export interface ColaboradorSeleccionado {
  idColaborador: number
  nombre: string
  examenFile?: File | null
}

export interface CrearCapacitacionLmsPayload {
  nombre: string
  categoriaCapacitacion: string
  tipoCapacitacion: string
  aplicaExamen: boolean
  notaMinima?: number
  programaId: number
  capacitadorId: number
  fechaProgramada: string
  modalidad: string
  categoriaSesion: string
  usuarioCreacion: string
  colaboradores: { idColaborador: number }[]
}
