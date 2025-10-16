export interface NuevoCodigoPadre {
  CODIGO: string
  TIPO_DOCUMENTO: string
  NOMBRE_DOCUMENTO: string
  APROBACION: string
  ESTATUS: boolean
  VERSION: number
  DEPARTAMENTO_CODIGO: string
}

export interface NuevoCodigoHijo {
  CODIGO: string
  NOMBRE_DOCUMENTO: string
  DOCUMENTO_ID?: number
  ESTATUS: boolean
  VERSION: number
}

export interface CodigoPadre {
  ID_DOCUMENTO: number
  CODIGO: string
  TIPO_DOCUMENTO: string
  NOMBRE_DOCUMENTO: string
  APROBACION: string
  ESTATUS: boolean
  DEPARTAMENTO_CODIGO?: string
  VERSION?: number
  DOCUMENTOS_ASOCIADOS: CodigoHijo[]
}

export interface CodigoHijo {
  ID_DOC_ASOCIADO: number
  CODIGO: string
  NOMBRE_DOCUMENTO: string
  ESTATUS: boolean
  VERSION?: number
  DOCUMENTO_ID?: number
}
