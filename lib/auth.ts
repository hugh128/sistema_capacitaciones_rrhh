export interface Rol {
  ID_ROL: number
  NOMBRE: string
  DESCRIPCION: string
  ESTADO: boolean
  ROL_PERMISOS: Permiso[]
}

export interface CategoriaPermiso {
  ID_CATEGORIA: number
  CLAVE: string
  NOMBRE: string
  DESCRIPCION: string
  PERMISOS?: Permiso[]
}

export interface Permiso {
  ID_PERMISO: number
  CLAVE: string
  NOMBRE: string
  DESCRIPCION: string
  CATEGORIA_ID?: number
  CATEGORIA?: CategoriaPermiso
}

export interface RolPayload {
  NOMBRE: string
  DESCRIPCION: string
  ESTADO: boolean
  ID_PERMISOS: number[]
}

export interface AuthContextType {
  user: UsuarioLogin | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
  loggingOut: boolean
}

export interface PermisoLoginProyectado {
  ID: number;
  NOMBRE: string;
  CLAVE: string;
}

export interface RolLoginProyectado {
  ID: number;
  NOMBRE: string;
  PERMISOS: PermisoLoginProyectado[];
}

export interface UsuarioLogin {
  ID_USUARIO: number;
  USERNAME: string;
  ESTADO: boolean;
  NOMBRE: string;
  APELLIDO: string;
  CORREO: string;
  TELEFONO: string;
  DPI: string;
  PUESTO_NOMBRE: string;
  DEPARTAMENTO_NOMBRE: string;
  ROLES: RolLoginProyectado[];
}

export interface LoginApiResponse {
  MESSAGE: string;
  USUARIO: {
    DATA: UsuarioLogin;
    TOKEN: string;
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
