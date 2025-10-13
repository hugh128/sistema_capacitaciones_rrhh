"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, Users, BookOpen, BarChart3, Settings, FileText, Plus, Pencil, Trash2 } from "lucide-react"
import { PermissionFormModal } from "@/components/permission-form-modal"
import { CategoryFormModal } from "@/components/category-form-modal"
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
import type { Permiso, CategoriaPermiso } from "@/lib/auth"
import { Toaster } from "react-hot-toast"
import { useCategorias } from "@/hooks/useCategorias"

export function PermissionsTab() {
  const { user } = useAuth()
  const [permissionModalOpen, setPermissionModalOpen] = useState(false)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permiso | null>(null)
  const [editingCategory, setEditingCategory] = useState<CategoriaPermiso | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<{ type: "permission" | "category"; id: string | number } | null>(null)

  const {
    categorias,
    saveCategoria,
    savePermiso,
    deletePermiso,
    deleteCategoria, 
  } = useCategorias(user);

  const getCategoryIcon = (categoria: string) => {
    switch (categoria) {
      case "sistema":
        return Shield
      case "usuarios":
        return Users
      case "capacitaciones":
        return BookOpen
      case "reportes":
        return BarChart3
      case "configuracion":
        return Settings
      case "documentos":
        return FileText
      default:
        return Shield
    }
  }

  const handleEditPermission = (permission: Permiso) => {
    setEditingPermission(permission)
    setPermissionModalOpen(true)
  }

  const handleDeletePermission = (id: number) => {
    setDeletingItem({ type: "permission", id })
    setDeleteDialogOpen(true)
  }

  const handleEditCategory = (category: CategoriaPermiso) => {
    setEditingCategory(category)
    setCategoryModalOpen(true)
  }

  const handleDeleteCategory = (id: number) => {
    setDeletingItem({ type: "category", id })
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingItem) return

    let success = false;
    const id = deletingItem.id as number;

    if (deletingItem.type === "permission") {
      success = await deletePermiso(id)
    } else {
      success = await deleteCategoria(id)
    }
    
    if(success){
      setDeleteDialogOpen(false)
      setDeletingItem(null)
    }
  }

  const handlePermissionModalClose = () => {
    setPermissionModalOpen(false)
    setEditingPermission(null)
  }

  const handleCategoryModalClose = () => {
    setCategoryModalOpen(false)
    setEditingCategory(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setPermissionModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Permiso
        </Button>
        <Button variant="outline" onClick={() => setCategoryModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Categoría
        </Button>
      </div>

      {categorias.map((category) => {
        const Icon = getCategoryIcon(category.CLAVE)
        const categoryPermissions = category.PERMISOS || []

        return (
          <Card key={category.CLAVE}>
            <Toaster />

            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{category.NOMBRE}</CardTitle>
                    <CardDescription>{category.DESCRIPCION}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditCategory(category)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteCategory(category.ID_CATEGORIA)}
                    disabled={category.CLAVE === "sistema"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryPermissions.map((permission) => (
                  <div
                    key={permission.CLAVE}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors group"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{permission.NOMBRE}</span>
                        <Badge variant="outline" className="text-xs">
                          {permission.CLAVE}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{permission.DESCRIPCION}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditPermission(permission)}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeletePermission(permission.ID_PERMISO)}
                        disabled={permission.CLAVE === "all"}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}

      <PermissionFormModal
        open={permissionModalOpen}
        onOpenChange={handlePermissionModalClose}
        initialData={editingPermission}
        categories={categorias}
        savePermiso={savePermiso}
      />

      <CategoryFormModal
        open={categoryModalOpen}
        onOpenChange={handleCategoryModalClose}
        initialData={editingCategory}
        saveCategoria={saveCategoria}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingItem?.type === "permission"
                ? "Esta acción eliminará el permiso permanentemente. Los roles que tengan este permiso lo perderán."
                : "Esta acción eliminará la categoría y todos sus permisos permanentemente."}
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
