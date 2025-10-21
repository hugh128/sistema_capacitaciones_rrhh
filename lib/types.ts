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
  ESTADO: boolean
  FECHA_CREACION: string
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

export interface Role {
  id: string
  nombre: string
  permisos?: string[]
  estado?: string
  descripcion?: string
}

export interface Capacitacion {
  id: string
  nombre: string
  descripcion?: string
  tipo: "inductiva" | "continua" | "anual" | "específica"
  fechaInicio?: string
  fechaFin?: string
  codigo: string
  peoOpcional?: string
  aplicaExamen: boolean
  puntajeMinimo?: number
  aplicaDiploma: boolean
  capacitadorId?: string
  planesAsociados: string[] // IDs de planes
  estado: "activa" | "finalizada" | "cancelada"
  fechaCreacion: string
}

export interface Participante {
  id: string
  personaId: string
  capacitacionId: string
  estado: "asignado" | "asistió" | "aprobado" | "reprobado" | "pendiente"
  fechaAsignacion: string
  fechaCompletado?: string
  notaExamen?: number
  asistencia: boolean
  documentosAsociados: string[]
}

export interface Documento {
  id: string
  nombre: string
  tipo: "PEO" | "asistencia" | "examen" | "diploma" | "evidencia"
  capacitacionId?: string
  participanteId?: string
  url?: string
  fechaCreacion: string
}

export interface AuditLog {
  id: string
  accion: "crear" | "editar" | "eliminar"
  tabla: string
  registroId: string
  valoresAntiguos?: Record<string, any>
  valoresNuevos?: Record<string, any>
  usuarioId: string
  fecha: string
  ip?: string
}

export interface Reporte {
  id: string
  nombre: string
  tipo: "cumplimiento" | "participacion" | "examenes" | "efectividad"
  parametros: Record<string, any>
  fechaGeneracion: string
  generadoPor: string
  datos: any[]
}


export const mockCapacitaciones: Capacitacion[] = [
  {
    id: "1",
    nombre: "Seguridad Industrial",
    descripcion: "Normas y procedimientos de seguridad en el trabajo",
    tipo: "específica",
    fechaInicio: "2024-03-15",
    fechaFin: "2024-03-16",
    codigo: "SEG-001",
    peoOpcional: "PEO-SEG-001",
    aplicaExamen: true,
    puntajeMinimo: 70,
    aplicaDiploma: true,
    capacitadorId: "2",
    planesAsociados: ["1"],
    estado: "activa",
    fechaCreacion: "2024-02-01",
  },
  {
    id: "2",
    nombre: "Liderazgo Efectivo",
    descripcion: "Desarrollo de habilidades de liderazgo",
    tipo: "continua",
    fechaInicio: "2024-03-20",
    fechaFin: "2024-03-22",
    codigo: "LID-001",
    aplicaExamen: true,
    puntajeMinimo: 80,
    aplicaDiploma: true,
    capacitadorId: "2",
    planesAsociados: ["1"],
    estado: "finalizada",
    fechaCreacion: "2024-02-05",
  },
  {
    id: "3",
    nombre: "Excel Avanzado",
    descripcion: "Funciones avanzadas de Microsoft Excel",
    tipo: "específica",
    fechaInicio: "2024-04-01",
    fechaFin: "2024-04-05",
    codigo: "EXC-001",
    aplicaExamen: true,
    puntajeMinimo: 75,
    aplicaDiploma: true,
    capacitadorId: "2",
    planesAsociados: ["2"],
    estado: "activa",
    fechaCreacion: "2024-02-10",
  },
  {
    id: "4",
    nombre: "Inducción Corporativa",
    descripcion: "Introducción a la empresa y sus políticas",
    tipo: "inductiva",
    fechaInicio: "2024-04-15",
    fechaFin: "2024-04-16",
    codigo: "IND-001",
    aplicaExamen: false,
    aplicaDiploma: true,
    capacitadorId: "2",
    planesAsociados: ["1"],
    estado: "activa",
    fechaCreacion: "2024-03-01",
  },
]

export const mockParticipantes: Participante[] = [
  {
    id: "1",
    personaId: "1",
    capacitacionId: "1",
    estado: "aprobado",
    fechaAsignacion: "2024-03-01",
    fechaCompletado: "2024-03-16",
    notaExamen: 85,
    asistencia: true,
    documentosAsociados: ["1", "2"],
  },
  {
    id: "2",
    personaId: "2",
    capacitacionId: "1",
    estado: "aprobado",
    fechaAsignacion: "2024-03-01",
    fechaCompletado: "2024-03-16",
    notaExamen: 92,
    asistencia: true,
    documentosAsociados: ["3", "4"],
  },
  {
    id: "3",
    personaId: "3",
    capacitacionId: "2",
    estado: "aprobado",
    fechaAsignacion: "2024-03-10",
    fechaCompletado: "2024-03-22",
    notaExamen: 88,
    asistencia: true,
    documentosAsociados: ["5"],
  },
  {
    id: "4",
    personaId: "4",
    capacitacionId: "1",
    estado: "asignado",
    fechaAsignacion: "2024-03-01",
    asistencia: false,
    documentosAsociados: [],
  },
  {
    id: "5",
    personaId: "1",
    capacitacionId: "3",
    estado: "pendiente",
    fechaAsignacion: "2024-03-25",
    asistencia: false,
    documentosAsociados: [],
  },
]

export const mockDocumentos: Documento[] = [
  {
    id: "1",
    nombre: "Lista de Asistencia - Seguridad Industrial",
    tipo: "asistencia",
    capacitacionId: "1",
    fechaCreacion: "2024-03-16",
  },
  {
    id: "2",
    nombre: "Examen - Seguridad Industrial",
    tipo: "examen",
    capacitacionId: "1",
    participanteId: "1",
    fechaCreacion: "2024-03-16",
  },
  {
    id: "3",
    nombre: "Diploma - Seguridad Industrial",
    tipo: "diploma",
    capacitacionId: "1",
    participanteId: "2",
    fechaCreacion: "2024-03-17",
  },
]

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

export const mockReportes: Reporte[] = [
  {
    id: "1",
    nombre: "Cumplimiento de Planes Q1 2024",
    tipo: "cumplimiento",
    parametros: { periodo: "Q1-2024", departamento: "todos" },
    fechaGeneracion: "2024-03-31",
    generadoPor: "1",
    datos: [
      { plan: "Plan de Inducción", cumplimiento: 85, meta: 90 },
      { plan: "Desarrollo Técnico IT", cumplimiento: 92, meta: 85 },
    ],
  },
  {
    id: "2",
    nombre: "Participación por Departamento",
    tipo: "participacion",
    parametros: { periodo: "2024", departamento: "todos" },
    fechaGeneracion: "2024-03-30",
    generadoPor: "1",
    datos: [
      { departamento: "RRHH", participantes: 15, capacitaciones: 8 },
      { departamento: "Tecnología", participantes: 25, capacitaciones: 12 },
      { departamento: "Operaciones", participantes: 18, capacitaciones: 6 },
    ],
  },
]
