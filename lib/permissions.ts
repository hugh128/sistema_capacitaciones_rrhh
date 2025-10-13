// Permission definitions and utilities
import { User } from "./auth"

export interface Permission {
  id: string
  nombre: string
  descripcion: string
  categoria: string
}

export interface PermissionCategory {
  id: string
  nombre: string
  descripcion: string
}

/* export function getPermissions(): Permission[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("permissions")
  if (stored) {
    return JSON.parse(stored)
  } */
  // Initialize with default permissions if none exist
/*   const defaultPermissions: Permission[] = [
    // Sistema
    {
      id: "all",
      nombre: "Acceso Total",
      descripcion: "Acceso completo a todas las funcionalidades",
      categoria: "sistema",
    },
    { id: "view_audit", nombre: "Ver Auditoría", descripcion: "Acceso al registro de auditoría", categoria: "sistema" },

    // Usuarios
    {
      id: "manage_users",
      nombre: "Gestionar Usuarios",
      descripcion: "Crear, editar y eliminar usuarios",
      categoria: "usuarios",
    },
    { id: "view_team", nombre: "Ver Equipo", descripcion: "Ver información del equipo", categoria: "usuarios" },
    {
      id: "view_records",
      nombre: "Ver Expedientes",
      descripcion: "Acceso a expedientes de personal",
      categoria: "usuarios",
    },

    // Capacitaciones
    {
      id: "manage_trainings",
      nombre: "Gestionar Capacitaciones",
      descripcion: "Crear, editar y eliminar capacitaciones",
      categoria: "capacitaciones",
    },
    {
      id: "view_trainings",
      nombre: "Ver Capacitaciones",
      descripcion: "Ver listado de capacitaciones",
      categoria: "capacitaciones",
    },
    {
      id: "edit_attendance",
      nombre: "Editar Asistencia",
      descripcion: "Modificar registros de asistencia",
      categoria: "capacitaciones",
    },
    {
      id: "approve_trainings",
      nombre: "Aprobar Capacitaciones",
      descripcion: "Aprobar solicitudes de capacitación",
      categoria: "capacitaciones",
    },
    {
      id: "view_participants",
      nombre: "Ver Participantes",
      descripcion: "Ver listado de participantes",
      categoria: "capacitaciones",
    },

    // Reportes
    {
      id: "view_reports",
      nombre: "Ver Reportes",
      descripcion: "Acceso a reportes y estadísticas",
      categoria: "reportes",
    },

    // Configuración
    {
      id: "manage_config",
      nombre: "Gestionar Configuración",
      descripcion: "Modificar configuración del sistema",
      categoria: "configuracion",
    },

    // Documentos
    {
      id: "upload_documents",
      nombre: "Subir Documentos",
      descripcion: "Cargar documentos al sistema",
      categoria: "documentos",
    },
    { id: "view_documents", nombre: "Ver Documentos", descripcion: "Acceso a documentos", categoria: "documentos" },
  ]
  localStorage.setItem("permissions", JSON.stringify(defaultPermissions))
  return defaultPermissions */
/*   return []
} */

export function getPermissions(): Permission[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("permissions")
  if (stored) {
    return JSON.parse(stored)
  }
  // Initialize with default permissions if none exist
  const defaultPermissions: Permission[] = [
    // Sistema
    {
      id: "all",
      nombre: "Acceso Total",
      descripcion: "Acceso completo a todas las funcionalidades",
      categoria: "sistema",
    },
    { id: "view_audit", nombre: "Ver Auditoría", descripcion: "Acceso al registro de auditoría", categoria: "sistema" },

    // Usuarios
    {
      id: "manage_users",
      nombre: "Gestionar Usuarios",
      descripcion: "Crear, editar y eliminar usuarios",
      categoria: "usuarios",
    },
    { id: "view_team", nombre: "Ver Equipo", descripcion: "Ver información del equipo", categoria: "usuarios" },
    {
      id: "view_records",
      nombre: "Ver Expedientes",
      descripcion: "Acceso a expedientes de personal",
      categoria: "usuarios",
    },

    // Capacitaciones
    {
      id: "manage_trainings",
      nombre: "Gestionar Capacitaciones",
      descripcion: "Crear, editar y eliminar capacitaciones",
      categoria: "capacitaciones",
    },
    {
      id: "view_trainings",
      nombre: "Ver Capacitaciones",
      descripcion: "Ver listado de capacitaciones",
      categoria: "capacitaciones",
    },
    {
      id: "edit_attendance",
      nombre: "Editar Asistencia",
      descripcion: "Modificar registros de asistencia",
      categoria: "capacitaciones",
    },
    {
      id: "approve_trainings",
      nombre: "Aprobar Capacitaciones",
      descripcion: "Aprobar solicitudes de capacitación",
      categoria: "capacitaciones",
    },
    {
      id: "view_participants",
      nombre: "Ver Participantes",
      descripcion: "Ver listado de participantes",
      categoria: "capacitaciones",
    },

    // Reportes
    {
      id: "view_reports",
      nombre: "Ver Reportes",
      descripcion: "Acceso a reportes y estadísticas",
      categoria: "reportes",
    },

    // Configuración
    {
      id: "manage_config",
      nombre: "Gestionar Configuración",
      descripcion: "Modificar configuración del sistema",
      categoria: "configuracion",
    },

    // Documentos
    {
      id: "upload_documents",
      nombre: "Subir Documentos",
      descripcion: "Cargar documentos al sistema",
      categoria: "documentos",
    },
    { id: "view_documents", nombre: "Ver Documentos", descripcion: "Acceso a documentos", categoria: "documentos" },
  ]
  localStorage.setItem("permissions", JSON.stringify(defaultPermissions))
  return defaultPermissions
}

export function getPermissionCategories(): PermissionCategory[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("permissionCategories")
  if (stored) {
    return JSON.parse(stored)
  }
  // Initialize with default categories if none exist
  const defaultCategories: PermissionCategory[] = [
    { id: "sistema", nombre: "Sistema", descripcion: "Permisos de administración del sistema" },
    { id: "usuarios", nombre: "Usuarios", descripcion: "Gestión de usuarios y personal" },
    { id: "capacitaciones", nombre: "Capacitaciones", descripcion: "Gestión de capacitaciones y participantes" },
    { id: "reportes", nombre: "Reportes", descripcion: "Acceso a reportes y análisis" },
    { id: "configuracion", nombre: "Configuración", descripcion: "Configuración del sistema" },
    { id: "documentos", nombre: "Documentos", descripcion: "Gestión de documentos" },
  ]
  localStorage.setItem("permissionCategories", JSON.stringify(defaultCategories))
  return defaultCategories
}

export function savePermission(permission: Permission): void {
  const permissions = getPermissions()
  const index = permissions.findIndex((p) => p.id === permission.id)
  if (index >= 0) {
    permissions[index] = permission
  } else {
    permissions.push(permission)
  }
  localStorage.setItem("permissions", JSON.stringify(permissions))
}

export function deletePermission(id: string): void {
  const permissions = getPermissions().filter((p) => p.id !== id)
  localStorage.setItem("permissions", JSON.stringify(permissions))
}

export function savePermissionCategory(category: PermissionCategory): void {
  const categories = getPermissionCategories()
  const index = categories.findIndex((c) => c.id === category.id)
  if (index >= 0) {
    categories[index] = category
  } else {
    categories.push(category)
  }
  localStorage.setItem("permissionCategories", JSON.stringify(categories))
}

export function deletePermissionCategory(id: string): void {
  const categories = getPermissionCategories().filter((c) => c.id !== id)
  localStorage.setItem("permissionCategories", JSON.stringify(categories))

  const permissions = getPermissions().filter((p) => p.categoria !== id)
  localStorage.setItem("permissions", JSON.stringify(permissions))
}

export function checkUserPermissions(
  user: User | null,
  requiredPermissions: string[],
  requirement: 'one' | 'all' = 'one'
): boolean {
  if (!user) return false

  const userPermissions = getUserPermissions(user)

  if (userPermissions.includes("all")) {
    return true
  }

  if (requiredPermissions.length === 0) {
      return true
  }

  const hasPerm = (perm: string) => userPermissions.includes(perm)

  switch (requirement) {
    case 'one':
      return requiredPermissions.some(hasPerm)
    case 'all':
      return requiredPermissions.every(hasPerm)
    default:
      return false
  }
}

export function hasPermission(user: User | null, permission: string): boolean {
  return checkUserPermissions(user, [permission], 'one'); 
}

export function hasAnyPermission(user: User | null, permissions: string[]): boolean {
  return checkUserPermissions(user, permissions, 'one');
}

export function hasAllPermissions(user: User | null, permissions: string[]): boolean {
  return checkUserPermissions(user, permissions, 'all');
}

export function getUserPermissions(user: User | null): string[] {
  if (!user) return []

  const allPermissions = new Set<string>()

  user.roles.forEach((role) => {
    role.permisos.forEach((permiso) => {
      allPermissions.add(permiso)
    })
  })

  return Array.from(allPermissions)
}
