"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, Users, BookOpen, BarChart3, Settings, FileText, Plus, Pencil, Trash2, Info, UserStar } from "lucide-react"
import { CategoryFormModal } from "./category-form-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/contexts/auth-context"
import type { CategoriaPermiso, Permiso } from "@/lib/auth"
import { Toaster } from "react-hot-toast"
import { useCategorias } from "@/hooks/useCategorias"
import { PROTECTED_CATEGORIES } from "@/lib/permissions-config"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function PermissionsTab() {
  const { user } = useAuth()
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoriaPermiso | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null)
  const [permisos, setPermisos] = useState<Permiso[]>([])
  const [loading, setLoading] = useState(true)

  const {
    categorias,
    obtenerPermisos,
    saveCategoria,
    deleteCategoria, 
  } = useCategorias(user);

  // Función para recargar todos los datos
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const permisosData = await obtenerPermisos()
      setPermisos(permisosData)
    } catch (error) {
      console.error('Error al cargar permisos:', error)
    } finally {
      setLoading(false)
    }
  }, [obtenerPermisos])

  useEffect(() => {
    if (!user) {
      return; 
    }
    fetchData()
  }, [user, fetchData])

  const getCategoryIcon = (categoria: string) => {
    const iconMap: Record<string, React.ElementType> = {
      sistema: Shield,
      usuarios: Users,
      capacitaciones: BookOpen,
      reportes: BarChart3,
      configuracion: Settings,
      documentos: FileText,
      colaborador: UserStar,
    }
    return iconMap[categoria] || Shield
  }

  const handleEditCategory = (category: CategoriaPermiso) => {
    setEditingCategory(category)
    setCategoryModalOpen(true)
  }

  const handleDeleteCategory = (id: number) => {
    setDeletingCategoryId(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingCategoryId) return

    const success = await deleteCategoria(deletingCategoryId)
    
    if(success){
      setDeleteDialogOpen(false)
      setDeletingCategoryId(null)
      // AGREGAR: Recargar datos después de eliminar
      await fetchData()
    }
  }

  const handleCategoryModalClose = () => {
    setCategoryModalOpen(false)
    setEditingCategory(null)
  }

  const handleSaveCategoria = async (data: Omit<CategoriaPermiso, 'ID_CATEGORIA'>, id?: number) => {
    const success = await saveCategoria(data, id)
    if (success) {
      await fetchData()
    }
    return success
  }

  const permisosSinCategoria = permisos.filter(p => !p.CATEGORIA_ID)

  return (
    <div className="space-y-6">
      <Toaster />
      
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5 dark:text-blue-400" />
            <div>
              <CardTitle className="text-lg">Gestión de Permisos del Sistema</CardTitle>
              <CardDescription className="mt-2">
                Los permisos están predefinidos por el sistema y controlan el acceso a cada módulo. 
                Puedes organizarlos creando <strong>categorías personalizadas</strong> para agruparlos 
                de forma lógica al asignar roles.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Categorías de Permisos</h3>
          <p className="text-sm text-muted-foreground">
            Organiza los permisos en categorías para facilitar su asignación
          </p>
        </div>
        <Button onClick={() => setCategoryModalOpen(true)} className="cursor-pointer">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Categoría
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Cargando categorías...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {categorias.map((category) => {
            const Icon = getCategoryIcon(category.CLAVE)
            const categoryPermissions = category.PERMISOS || []

            const isProtected = PROTECTED_CATEGORIES.includes(category.CLAVE as typeof PROTECTED_CATEGORIES[number])

            return (
              <Card key={category.ID_CATEGORIA}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center dark:border dark:border-blue-500/30">
                        <Icon className="w-5 h-5 text-primary dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle>{category.NOMBRE}</CardTitle>
                          {isProtected && (
                            <Badge variant="secondary" className="text-xs">
                              Predeterminada
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{category.DESCRIPCION}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEditCategory(category)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar categoría</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCategory(category.ID_CATEGORIA)}
                              disabled={isProtected}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{isProtected ? "No se puede eliminar una categoría predeterminada" : "Eliminar categoría"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {categoryPermissions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">Esta categoría no tiene permisos asignados.</p>
                      <p className="text-xs mt-1">Edita la categoría para asignar permisos del sistema.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categoryPermissions.map((permission) => {
                        const isSpecial = permission.CLAVE === "all"

                        return (
                          <div
                            key={permission.ID_PERMISO}
                            className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                          >
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${isSpecial ? 'bg-yellow-500' : 'bg-primary'}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-medium text-sm">{permission.NOMBRE}</span>
                                <Badge variant="outline" className="text-xs">
                                  {permission.CLAVE}
                                </Badge>
                                {isSpecial && (
                                  <Badge variant="default" className="text-xs">
                                    Especial
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {permission.DESCRIPCION}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <CardTitle className="text-lg">Permisos Disponibles en el Sistema</CardTitle>
            </div>
            {permisosSinCategoria.length > 0 && (
              <Badge variant="outline">
                {permisosSinCategoria.length} sin asignar
              </Badge>
            )}
          </div>
          <CardDescription>
            Estos son todos los permisos que puedes asignar a las categorías
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-4">Cargando permisos...</p>
          ) : permisos.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No hay permisos registrados en el sistema</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {permisos.map((perm) => {
                const tieneCategoria = !!perm.CATEGORIA_ID
                
                return (
                  <div
                    key={perm.ID_PERMISO}
                    className={`p-3 rounded-lg border transition-colors ${
                      tieneCategoria 
                        ? 'border-border/50 bg-muted/30' 
                        : 'border-orange-500/50 bg-orange-500/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge 
                        variant="outline" 
                        className="text-xs font-mono border dark:border-foreground/30"
                      >
                        {perm.CLAVE}
                      </Badge>
                      {perm.CLAVE === "all" && (
                        <Badge variant="default" className="text-xs">
                          Especial
                        </Badge>
                      )}
                      {!tieneCategoria && (
                        <Badge variant="outline" className="text-xs border-orange-500 text-orange-500">
                          Sin categoría
                        </Badge>
                      )}
                    </div>
                    <p className="font-medium text-sm">{perm.NOMBRE}</p>
                    <p className="text-xs text-muted-foreground mt-1">{perm.DESCRIPCION}</p>
                    {tieneCategoria && perm.CATEGORIA_ID && (
                      <p className="text-xs text-muted-foreground mt-2">
                        <span className="font-medium">Categoría:</span>{" "}
                        {categorias.find(c => c.ID_CATEGORIA === perm.CATEGORIA_ID)?.NOMBRE || 'Desconocida'}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <CategoryFormModal
        open={categoryModalOpen}
        onOpenChange={handleCategoryModalClose}
        initialData={editingCategory}
        saveCategoria={handleSaveCategoria}
        availablePermissions={permisos}
        existingCategories={categorias}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la categoría permanentemente. Los permisos no se eliminarán, 
              solo se desagruparán de esta categoría y quedarán disponibles para ser reasignados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
