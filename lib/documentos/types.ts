// lib/types/plantilla.types.ts

export type TipoDocumento = 'PDF' | 'DOCX' | 'DOC';
export type EstadoPlantilla = 'BORRADOR' | 'ACTIVO' | 'OBSOLETO';

export interface PlantillaDocumento {
  ID_PLANTILLA: number;
  NOMBRE_ARCHIVO: string;
  NOMBRE_DISPLAY: string;
  DESCRIPCION?: string;
  TIPO_DOCUMENTO: TipoDocumento;
  URL_ARCHIVO: string;
  TAMANIO_BYTES: number;
  ACTIVO: boolean;
  VERSION: number;
  FECHA_CREACION: string;
  FECHA_MODIFICACION?: string;
  CREADO_POR: string;
  MODIFICADO_POR?: string;
  NOTAS?: string;
  ESTADO: EstadoPlantilla;
  
  // Campos calculados/relacionados
  NOMBRE_CREADOR?: string;
  NOMBRE_MODIFICADOR?: string;
  TAMANIO_FORMATEADO?: string;
}

export interface PlantillaFormData {
  NOMBRE_DISPLAY: string;
  DESCRIPCION?: string;
  NOTAS?: string;
  archivo?: File;
}

export interface UploadPlantillaRequest {
  NOMBRE_DISPLAY: string;
  DESCRIPCION?: string;
  NOTAS?: string;
  CREADO_POR: string;
}

export interface UpdatePlantillaRequest {
  ID_PLANTILLA: number;
  NOMBRE_DISPLAY?: string;
  DESCRIPCION?: string;
  NOTAS?: string;
  MODIFICADO_POR: string;
}

export interface ActivarPlantillaRequest {
  ID_PLANTILLA: number;
  MODIFICADO_POR: string;
}
