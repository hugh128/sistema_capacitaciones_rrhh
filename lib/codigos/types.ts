export interface NuevoCodigoPadre {
  CODIGO: string
  TIPO_DOCUMENTO: string
  NOMBRE_DOCUMENTO: string
  APROBACION: string
  VERSION: number
  ESTATUS: string
  DEPARTAMENTO_CODIGO: string
}

export interface NuevoCodigoHijo {
  CODIGO: string
  NOMBRE_DOCUMENTO: string
  FECHA_APROBACION: string
  DOCUMENTO_ID?: number
  VERSION: number
  ESTATUS: string
}

export interface CodigoPadre {
  ID_DOCUMENTO: number
  CODIGO: string
  TIPO_DOCUMENTO: string
  NOMBRE_DOCUMENTO: string
  APROBACION: string
  VERSION: number
  ESTATUS: string
  DEPARTAMENTO_CODIGO: string
  DOCUMENTOS_ASOCIADOS: CodigoHijo[]
}

export interface CodigoHijo {
  ID_DOC_ASOCIADO: number
  CODIGO: string
  NOMBRE_DOCUMENTO: string
  FECHA_APROBACION: string
  VERSION: number
  ESTATUS: string
  DOCUMENTO_ID: number
}
