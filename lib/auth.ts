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
  logoutDueToExpiredToken?: () => void
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
  PERSONA_ID: number
}

export interface LoginApiResponse {
  MESSAGE: string;
  USUARIO: {
    DATA: UsuarioLogin;
    TOKEN: string;
  };
}
