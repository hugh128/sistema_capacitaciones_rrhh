export interface Empresa {
  id: string
  nombre: string
  descripcion?: string
  direccion?: string
  nit?: string,
  telefono?: string
  email?: string
  estado: "activa" | "inactiva"
  fechaCreacion: string
}

export interface Departamento {
  id: string
  nombre: string
  descripcion?: string
  empresaId: string
  encargadoId?: string
  estado: "activo" | "inactivo"
  fechaCreacion: string
}

export interface Puesto {
  id: string
  nombre: string
  descripcion?: string
  departamentoId: string
  nivel: "operativo" | "supervisorio" | "gerencial" | "ejecutivo"
  requiereCapacitacion: boolean
  estado: "activo" | "inactivo"
  fechaCreacion: string
  nombreDepartamento?: string;
}

export interface Persona {
  id: string
  nombre: string
  apellido: string
  correo: string
  telefono?: string
  dpi?: string
  fechaNacimiento?: string
  puestoId?: string
  departamentoId?: string
  estado: "activo" | "inactivo"
  fechaCreacion?: string
  fechaIngreso?: string
  tipoPersona?: string
  empresaId?: string

  nombrePuesto?: string;
  nombreDepartamento?: string;
}

export interface Usuario {
  id: string
  personaId: string
  email: string
  roles: Role[]
  estado: "activo" | "inactivo"
  ultimoAcceso?: string
  fechaCreacion: string
  nombreCompletoPersona?: string
}

export interface Role {
  id: string
  nombre: string
  permisos?: string[]
  estado?: string
  descripcion?: string
}

export interface PlanCapacitacion {
  id: string
  nombre: string
  descripcion?: string
  departamentoId?: string
  puestoId?: string
  estado: "activo" | "inactivo" | "completado"
  capacitaciones: string[] // IDs de capacitaciones
  fechaInicio?: string
  fechaFin?: string
  fechaCreacion: string
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

// Mock data
export const mockEmpresas: Empresa[] = [
  {
    id: "1",
    nombre: "Laboratorio Phara",
    descripcion: "Industria farmateutica",
    direccion: "Zona 10, Quetzaltenango",
    telefono: "2234-5678",
    email: "laboratorio@phara.com",
    estado: "activa",
    fechaCreacion: "2000-01-15",
  },
  {
    id: "2",
    nombre: "Innovate Industries",
    descripcion: "Manufactura e innovación industrial",
    direccion: "Zona 12, Ciudad de Guatemala",
    telefono: "2345-6789",
    email: "contacto@innovate.com",
    estado: "activa",
    fechaCreacion: "2015-02-01",
  },
]

export const mockDepartamentos: Departamento[] = [
  {
    id: "1",
    nombre: "Recursos Humanos",
    descripcion: "Gestión del talento humano",
    empresaId: "1",
    encargadoId: "1",
    estado: "activo",
    fechaCreacion: "2024-01-20",
  },
  {
    id: "2",
    nombre: "Tecnología",
    descripcion: "Desarrollo y soporte tecnológico",
    empresaId: "1",
    estado: "activo",
    fechaCreacion: "2024-01-20",
  },
  {
    id: "3",
    nombre: "Operaciones",
    descripcion: "Gestión operativa y logística",
    empresaId: "1",
    estado: "activo",
    fechaCreacion: "2024-01-20",
  },
]

export const mockPuestos: Puesto[] = [
  {
    id: "1",
    nombre: "Coordinador de RRHH",
    descripcion: "Coordinación de actividades de recursos humanos",
    departamentoId: "1",
    nivel: "supervisorio",
    requiereCapacitacion: true,
    estado: "activo",
    fechaCreacion: "2024-01-25",
  },
  {
    id: "2",
    nombre: "Desarrollador Senior",
    descripcion: "Desarrollo de software y aplicaciones",
    departamentoId: "2",
    nivel: "operativo",
    requiereCapacitacion: true,
    estado: "activo",
    fechaCreacion: "2024-01-25",
  },
  {
    id: "3",
    nombre: "Gerente de Operaciones",
    descripcion: "Gestión y supervisión de operaciones",
    departamentoId: "3",
    nivel: "gerencial",
    requiereCapacitacion: true,
    estado: "activo",
    fechaCreacion: "2024-01-25",
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

export const mockRoles: Role[] = [
  {
    id: "1",
    nombre: "RRHH",
    permisos: ["all", "manage_users", "manage_trainings", "view_reports", "manage_config", "view_audit"],
  },
  {
    id: "2",
    nombre: "Capacitador",
    permisos: ["view_trainings", "edit_attendance", "upload_documents", "view_participants"],
  },
  {
    id: "3",
    nombre: "Gerente",
    permisos: ["view_reports", "view_team", "view_records", "approve_trainings"],
  },
  {
    id: "4",
    nombre: "Jefe",
    permisos: ["view_reports", "view_team", "view_records"],
  },
]

export const mockUsuarios: Usuario[] = [
  {
    id: "1",
    personaId: "1",
    email: "rrhh@empresa.com",
    roles: [mockRoles[0]],
    estado: "activo",
    ultimoAcceso: "2024-03-15T10:30:00Z",
    fechaCreacion: "2024-01-15",
  },
  {
    id: "2",
    personaId: "2",
    email: "capacitador@empresa.com",
    roles: [mockRoles[1]],
    estado: "activo",
    ultimoAcceso: "2024-03-14T14:20:00Z",
    fechaCreacion: "2024-01-20",
  },
  {
    id: "3",
    personaId: "3",
    email: "gerente@empresa.com",
    roles: [mockRoles[2]],
    estado: "activo",
    ultimoAcceso: "2024-03-13T09:15:00Z",
    fechaCreacion: "2024-01-25",
  },
]

export const mockPlanes: PlanCapacitacion[] = [
  {
    id: "1",
    nombre: "Plan de Inducción Corporativa",
    descripcion: "Capacitaciones básicas para nuevos empleados",
    departamentoId: "1",
    estado: "activo",
    capacitaciones: ["1", "2"],
    fechaInicio: "2024-01-01",
    fechaFin: "2024-12-31",
    fechaCreacion: "2024-01-01",
  },
  {
    id: "2",
    nombre: "Desarrollo Técnico IT",
    descripcion: "Capacitaciones especializadas para el área de tecnología",
    departamentoId: "2",
    estado: "activo",
    capacitaciones: ["3", "4"],
    fechaInicio: "2024-02-01",
    fechaFin: "2024-11-30",
    fechaCreacion: "2024-01-15",
  },
]

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
