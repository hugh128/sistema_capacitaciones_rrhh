import { Rol } from "./auth"

export interface Empresa {
  ID_EMPRESA: number
  NOMBRE: string
  DIRECCION: string
  NIT: string
  TELEFONO: string
  CORREO: string
  ESTADO: boolean
  FECHA_CREACION: string
}

export interface Departamento {
  ID_DEPARTAMENTO: number
  CODIGO: string
  NOMBRE: string
  DESCRIPCION: string
  ID_ENCARGADO?: number
  ESTADO: boolean
  FECHA_CREACION: string
  ENCARGADO?: Persona | null
}

export interface Puesto {
  ID_PUESTO: number
  NOMBRE: string
  DESCRIPCION: string
  ESTADO: boolean
  DEPARTAMENTO_ID?: number
  DEPARTAMENTO?: Departamento
}

export interface Persona {
  ID_PERSONA: number
  NOMBRE: string
  APELLIDO: string
  CORREO: string
  TELEFONO: string
  DPI: string
  FECHA_NACIMIENTO: string
  TIPO_PERSONA: 'INTERNO' | 'EXTERNO'
  FECHA_INGRESO: string
  EMPRESA_ID: number
  DEPARTAMENTO_ID: number
  PUESTO_ID: number
  ESTADO: boolean
  EMPRESA: Empresa
  DEPARTAMENTO: Departamento
  PUESTO: Puesto
}

export interface Usuario {
  ID_USUARIO: number
  PERSONA_ID: number
  USERNAME: string
  PASSWORD?: string
  ESTADO: true
  ULTIMO_ACCESO: string
  FECHA_CREACION: string
  PERSONA?: Persona
  USUARIO_ROLES?: Rol[]
}

export interface usuarioPayload {
  USERNAME: string
  PASSWORD?: string
  ESTADO: boolean
  ID_ROLES: number[]
  PERSONA_ID?: number
}

export interface usuarioCreatePayload extends usuarioPayload {
  PERSONA_ID: number;
  PASSWORD: string;
}

export interface AuditLog {
  id: string
  accion: "crear" | "editar" | "eliminar"
  tabla: string
  registroId: string
  valoresAntiguos?: Record<string, unknown>
  valoresNuevos?: Record<string, unknown>
  usuarioId: string
  fecha: string
  ip?: string
}

export const mockAuditLogs: AuditLog[] = [
  {
    id: "1",
    accion: "crear",
    tabla: "capacitaciones",
    registroId: "1",
    valoresNuevos: {
      nombre: "Seguridad Industrial",
      codigo: "SEG-001",
      estado: "programada",
    },
    usuarioId: "1",
    fecha: "2024-03-15T10:30:00Z",
  },
  {
    id: "2",
    accion: "editar",
    tabla: "participantes",
    registroId: "1",
    valoresAntiguos: { estado: "asignado", notaExamen: null },
    valoresNuevos: { estado: "aprobado", notaExamen: 85 },
    usuarioId: "2",
    fecha: "2024-03-16T14:20:00Z",
  },
  {
    id: "3",
    accion: "eliminar",
    tabla: "usuarios",
    registroId: "5",
    valoresAntiguos: {
      email: "usuario.eliminado@empresa.com",
      estado: "inactivo",
    },
    usuarioId: "1",
    fecha: "2024-03-17T09:15:00Z",
  },
  {
    id: "4",
    accion: "crear",
    tabla: "planes",
    registroId: "3",
    valoresNuevos: {
      nombre: "Plan de Desarrollo Gerencial",
      estado: "activo",
    },
    usuarioId: "1",
    fecha: "2024-03-18T11:45:00Z",
    ip: "192.168.1.100",
  },
]

export const mockPersonas: Persona[] = [
  {
    id: "1",
    nombre: "Ana",
    apellido: "García",
    correo: "ana.garcia@empresa.com",
    telefono: "555-0001",
    dpi: "1234567890101",
    fechaNacimiento: "1985-03-15",
    puestoId: "1",
    departamentoId: "1",
    estado: "activo",
    fechaCreacion: "2024-01-15",
  },
  {
    id: "2",
    nombre: "Carlos",
    apellido: "López",
    correo: "carlos.lopez@empresa.com",
    telefono: "555-0002",
    dpi: "1234567890102",
    fechaNacimiento: "1990-07-22",
    puestoId: "2",
    departamentoId: "2",
    estado: "activo",
    fechaCreacion: "2024-01-20",
  },
  {
    id: "3",
    nombre: "María",
    apellido: "Rodríguez",
    correo: "maria.rodriguez@empresa.com",
    telefono: "555-0003",
    dpi: "1234567890103",
    fechaNacimiento: "1988-11-08",
    puestoId: "3",
    departamentoId: "3",
    estado: "activo",
    fechaCreacion: "2024-01-25",
  },
  {
    id: "4",
    nombre: "Luis",
    apellido: "Martínez",
    correo: "luis.martinez@empresa.com",
    telefono: "555-0004",
    dpi: "1234567890104",
    fechaNacimiento: "1992-05-12",
    puestoId: "2",
    departamentoId: "2",
    estado: "activo",
    fechaCreacion: "2024-02-01",
  },
]
