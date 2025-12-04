/**
 * CATEGORÍAS PROTEGIDAS
 * Estas categorías no se pueden eliminar desde la interfaz
 */
export const PROTECTED_CATEGORIES = [
  "sistema",
  "usuarios", 
  "capacitaciones",
  "reportes",
  "configuracion",
  "documentos"
] as const;

/**
 * Verificar si una categoría está protegida
 */
export function isCategoryProtected(clave: string): boolean {
  return PROTECTED_CATEGORIES.includes(clave as typeof PROTECTED_CATEGORIES[number]);
}
