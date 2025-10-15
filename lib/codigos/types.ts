export interface NewParentData {
  codigo_padre: string
  tipo_documento: string
  documento: string
  fecha_aprobacion: string
  estatus: "vigente" | "inactivo"
}

export interface NewChildData {
  dato_asociado: string
  nombre_documento_asociado: string
}

export interface NuevoCodigoPadre {
  CODIGO: string
  TIPO_DOCUMENTO: string
  NOMBRE_DOCUMENTO: string
  APROBACION: string
  ESTATUS: boolean
}

export interface NuevoCodigoHijo {
  CODIGO: string
  NOMBRE_DOCUMENTO: string
  DOCUMENTO_ID?: number
  ESTATUS: boolean
}

export interface CodigoPadre {
  ID_DOCUMENTO: number
  CODIGO: string
  TIPO_DOCUMENTO: string
  NOMBRE_DOCUMENTO: string
  APROBACION: string
  ESTATUS: boolean
  DOCUMENTOS_ASOCIADOS: CodigoHijo[]
}

export interface CodigoHijo {
  ID_DOC_ASOCIADO: number
  CODIGO: string
  NOMBRE_DOCUMENTO: string
  ESTATUS: boolean
  DOCUMENTO_ID?: number
}
