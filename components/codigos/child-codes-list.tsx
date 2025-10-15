"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ChildCodeForm } from "./child-code-form"
import type { CodigoHijo, NuevoCodigoHijo } from "@/lib/codigos/types"
import { Badge } from "../ui/badge"

interface ChildCodesListProps {
  parentID: number
  children: CodigoHijo[]
  onAdd: (child: NuevoCodigoHijo) => void
  onEdit: (childId: number, data: NuevoCodigoHijo) => void
  onDelete: (childId: number) => void
}

export function ChildCodesList({ children, onAdd, onEdit, onDelete }: ChildCodesListProps) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingChild, setEditingChild] = useState<CodigoHijo | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const itemsPerPage = 10

  const [formData, setFormData] = useState<NuevoCodigoHijo>({
    CODIGO: "",
    NOMBRE_DOCUMENTO: "",
    ESTATUS: true,
  })

  const { filteredChildren, totalPages, visibleChildren } = useMemo(() => {
    const filtered = children.filter((child) => {
      const query = searchQuery.toLowerCase()
      return (
        child.CODIGO.toLowerCase().includes(query) ||
        child.NOMBRE_DOCUMENTO.toLowerCase().includes(query)
      )
    })

    const total = Math.ceil(filtered.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const visible = filtered.slice(startIndex, startIndex + itemsPerPage)

    return { filteredChildren: filtered, totalPages: total, visibleChildren: visible }
  }, [children, searchQuery, currentPage])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handleAdd = () => {
    if (!formData.CODIGO || !formData.NOMBRE_DOCUMENTO) return

    onAdd({
        CODIGO: formData.CODIGO,
        NOMBRE_DOCUMENTO: formData.NOMBRE_DOCUMENTO,
        ESTATUS: formData.ESTATUS,
    } as NuevoCodigoHijo)
    
    setFormData({ CODIGO: "", NOMBRE_DOCUMENTO: "", ESTATUS: true })
    setIsAddOpen(false)
  }

  const handleEdit = () => {
    if (!editingChild || !formData.CODIGO || !formData.NOMBRE_DOCUMENTO) return

    onEdit(editingChild.ID_DOC_ASOCIADO, {
        CODIGO: formData.CODIGO,
        NOMBRE_DOCUMENTO: formData.NOMBRE_DOCUMENTO,
        ESTATUS: formData.ESTATUS,
    }) 
    
    setFormData({ CODIGO: "", NOMBRE_DOCUMENTO: "", ESTATUS: true })
    setEditingChild(null)
  }

  const openEditDialog = (child: CodigoHijo) => {
    setEditingChild(child)
    setFormData({
      CODIGO: child.CODIGO,
      NOMBRE_DOCUMENTO: child.NOMBRE_DOCUMENTO,
      ESTATUS: child.ESTATUS,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">
          Códigos Hijo ({searchQuery ? `${filteredChildren.length} de ${children.length}` : children.length})
        </h4>
        <Button size="sm" variant="outline" onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Hijo
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por dato asociado o nombre de documento..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {children.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground border rounded-lg">
          No hay códigos hijo asociados
        </div>
      ) : filteredChildren.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground border rounded-lg">
          No se encontraron códigos hijo que coincidan con &quot;{searchQuery}&quot;
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {visibleChildren.map((child) => (
              <div key={child.ID_DOC_ASOCIADO} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Dato Asociado</p>
                    <p className="text-sm font-medium">{child.CODIGO}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Nombre de Documento</p>
                    <p className="text-sm">{child.NOMBRE_DOCUMENTO}</p>
                  </div>
                </div>

                <div className="ml-auto">
                    <Badge variant={child.ESTATUS ? "default" : "secondary"}>
                      {child.ESTATUS ? "Vigente" : "Inactivo"}
                    </Badge>
                </div>

                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(child)} className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(child.ID_DOC_ASOCIADO)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-muted-foreground">
                Mostrando {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, filteredChildren.length)} de {filteredChildren.length}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-7 px-2"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <div className="text-xs px-2">
                  {currentPage} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-7 px-2"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Código Hijo</DialogTitle>
            <DialogDescription>Complete los campos para crear un nuevo código hijo</DialogDescription>
          </DialogHeader>
          <ChildCodeForm
            data={formData}
            onChange={setFormData}
            onSubmit={handleAdd}
            onCancel={() => setIsAddOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingChild} onOpenChange={(open) => !open && setEditingChild(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Código Hijo</DialogTitle>
            <DialogDescription>Modifique los campos del código hijo</DialogDescription>
          </DialogHeader>
          <ChildCodeForm
            data={formData}
            onChange={setFormData}
            onSubmit={handleEdit}
            onCancel={() => setEditingChild(null)}
            isEditing
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
