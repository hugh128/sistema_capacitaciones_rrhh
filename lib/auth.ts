/* export interface User {
  id: number
  username: string,
  email: string
  nombre: string
  apellido: string
  telefono?: string
  dpi?: string
  fechaNacimiento?: string
  puesto?: string
  departamento?: string
  roles: Role[]
  estado: "activo" | "inactivo"
} */

export interface Role {
  id: string
  nombre: "RRHH" | "Capacitador" | "Gerente" | "Jefe"
  permisos: string[]
}

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
  loggingOut: boolean
}

export interface User {
  id: number;
  username: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono: string;
  dpi: string;
  puesto: string;
  departamento: string;
  roles: Role[];
  estado: string;
}

export interface LoginApiResponse {
  message: string;
  usuario: {
    data: User;
    token: string;
  };
}

// Mock data for development
export const mockUsers: User[] = [
  {
    id: 1,
    username: "rrhh",
    email: "rrhh@empresa.com",
    nombre: "Ana",
    apellido: "García",
    telefono: "555-0001",
    dpi: "1234567890101",
    puesto: "Coordinadora RRHH",
    departamento: "Recursos Humanos",
    roles: [
      {
        id: "1",
        nombre: "RRHH",
        permisos: ["all"],
      },
    ],
    estado: "activo",
  },
  {
    id: 2,
    username: "training",
    email: "capacitador@empresa.com",
    nombre: "Carlos",
    apellido: "López",
    telefono: "555-0002",
    dpi: "1234567890102",
    puesto: "Capacitador Senior",
    departamento: "Capacitación",
    roles: [
      {
        id: "2",
        nombre: "Capacitador",
        permisos: ["view_capacitaciones", "edit_asistencia", "upload_documentos"],
      },
    ],
    estado: "activo",
  },
  {
    id: 3,
    username: "manager",
    email: "gerente@empresa.com",
    nombre: "María",
    apellido: "Rodríguez",
    telefono: "555-0003",
    dpi: "1234567890103",
    puesto: "Gerente de Operaciones",
    departamento: "Operaciones",
    roles: [
      {
        id: "3",
        nombre: "Gerente",
        permisos: ["view_reportes", "view_expedientes", "view_colaboradores"],
      },
    ],
    estado: "activo",
  },
]
