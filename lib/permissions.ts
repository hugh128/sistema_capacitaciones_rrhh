import { UsuarioLogin } from "./auth"

export function checkUserPermissions(
  user: UsuarioLogin | null,
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

export function hasPermission(user: UsuarioLogin | null, permission: string): boolean {
  return checkUserPermissions(user, [permission], 'one'); 
}

export function hasAnyPermission(user: UsuarioLogin | null, permissions: string[]): boolean {
  return checkUserPermissions(user, permissions, 'one');
}

export function hasAllPermissions(user: UsuarioLogin | null, permissions: string[]): boolean {
  return checkUserPermissions(user, permissions, 'all');
}

export function getUserPermissions(user: UsuarioLogin | null): string[] {
  if (!user) return []

  const allPermissions = new Set<string>()

  user.ROLES.forEach((role) => {
    role.PERMISOS.forEach((permiso) => {
      allPermissions.add(permiso.CLAVE)
    })
  })

  return Array.from(allPermissions)
}
