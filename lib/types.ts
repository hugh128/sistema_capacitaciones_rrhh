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

type PersonaSinRelaciones = Omit<Persona, 'DEPARTAMENTO' | 'PUESTO' | 'EMPRESA'>;

export const mockPersonas: PersonaSinRelaciones[] = [
  {
    ID_PERSONA: 1,
    NOMBRE: "Ana",
    APELLIDO: "García",
    CORREO: "ana.garcia@empresa.com",
    TELEFONO: "555-0001",
    DPI: "1234567890101",
    FECHA_NACIMIENTO: "1985-03-15",
    TIPO_PERSONA: 'INTERNO',
    FECHA_INGRESO: "2024-01-15",
    EMPRESA_ID: 1,
    DEPARTAMENTO_ID: 1,
    PUESTO_ID: 1,
    ESTADO: true
  },
  {
    ID_PERSONA: 2,
    NOMBRE: "Carlos",
    APELLIDO: "López",
    CORREO: "carlos.lopez@empresa.com",
    TELEFONO: "555-0002",
    DPI: "1234567890102",
    FECHA_NACIMIENTO: "1990-07-22",
    TIPO_PERSONA: 'INTERNO',
    FECHA_INGRESO: "2024-01-20",
    EMPRESA_ID: 1,
    DEPARTAMENTO_ID: 2,
    PUESTO_ID: 2,
    ESTADO: true
  },
  {
    ID_PERSONA: 3,
    NOMBRE: "María",
    APELLIDO: "Rodríguez",
    CORREO: "maria.rodriguez@empresa.com",
    TELEFONO: "555-0003",
    DPI: "1234567890103",
    FECHA_NACIMIENTO: "1988-11-08",
    TIPO_PERSONA: 'INTERNO',
    FECHA_INGRESO: "2024-01-20",
    EMPRESA_ID: 1,
    DEPARTAMENTO_ID: 3,
    PUESTO_ID: 3,
    ESTADO: true
  }
]
