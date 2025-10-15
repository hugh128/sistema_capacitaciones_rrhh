"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"
import { ParentCodeForm } from "./parent-code-form"
import { ChildCodesList } from "./child-codes-list"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"
import type { CodigoPadre, NuevoCodigoPadre, NuevoCodigoHijo } from "@/lib/codigos/types"

interface ParentCodeEditProps {
  parent: CodigoPadre | null
  open: boolean
  onClose: () => void
  onUpdate: (id: number, data: NuevoCodigoPadre) => void
  onDelete: (id: number) => void
  onAddChild: (parentId: number, child: NuevoCodigoHijo) => void
  onEditChild: (parentId: number, childId: number, data: NuevoCodigoHijo) => void
  onDeleteChild: (parentId: number, childId: number) => void
}

export function ParentCodeEdit({
  parent,
  open,
  onClose,
  onUpdate,
  onDelete,
  onAddChild,
  onEditChild,
  onDeleteChild,
}: ParentCodeEditProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)

  const initialFormData = useMemo<NuevoCodigoPadre>(() => {
    if (!parent) {
      return {
        CODIGO: "",
        TIPO_DOCUMENTO: "",
        NOMBRE_DOCUMENTO: "",
        APROBACION: "",
        ESTATUS: true,
      }
    }
    return {
      CODIGO: parent.CODIGO,
      TIPO_DOCUMENTO: parent.TIPO_DOCUMENTO,
      NOMBRE_DOCUMENTO: parent.NOMBRE_DOCUMENTO,
      APROBACION: parent.APROBACION,
      ESTATUS: parent.ESTATUS,
    }
  }, [parent])

  const [editFormData, setEditFormData] = useState<NuevoCodigoPadre>(initialFormData)

  useEffect(() => {
    if (parent) {
      setEditFormData(initialFormData);
    }
  }, [parent, initialFormData, parent?.DOCUMENTOS_ASOCIADOS])

  const handleEdit = () => {
    setEditFormData(initialFormData)
    setIsEditing(true)
  }

  const handleSave = () => {
    if (!parent) return
    onUpdate(parent.ID_DOCUMENTO, editFormData)
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (!parent) return
    onDelete(parent.ID_DOCUMENTO)
    setDeleteDialog(false)
    onClose()
  }

  if (!parent) return null

  const childrenCount = parent.DOCUMENTOS_ASOCIADOS.length;
  const isVigente = parent.ESTATUS === true;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto md:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar Código</DialogTitle>
            <DialogDescription>
              {parent.CODIGO} • {childrenCount} {childrenCount === 1 ? "hijo" : "hijos"}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Información</TabsTrigger>
              <TabsTrigger value="children">Códigos Hijo</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base">Información del Código Padre</CardTitle>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteDialog(true)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <ParentCodeForm
                      data={editFormData}
                      onChange={setEditFormData}
                      onSubmit={handleSave}
                      onCancel={() => setIsEditing(false)}
                      isEditing
                    />
                  ) : (
                    <>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Código</p>
                            <p className="text-base font-medium font-mono">{parent.CODIGO}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Tipo de Documento</p>
                            <p className="text-base">{parent.TIPO_DOCUMENTO}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Documento</p>
                          <p className="text-base">{parent.NOMBRE_DOCUMENTO}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Fecha de Aprobación</p>
                            <p className="text-base">{parent.APROBACION}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Estatus</p>
                            <Badge variant={isVigente ? "default" : "secondary"}>
                              {isVigente ? "Vigente" : "Inactivo"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <Button onClick={handleEdit} className="w-full">
                          Editar Información
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="children">
              <Card>
                <CardContent className="pt-6">
                  <ChildCodesList
                    parentID={parent.ID_DOCUMENTO} 
                    onAdd={(child) => onAddChild(parent.ID_DOCUMENTO, child)}
                    onEdit={(childId, data) => onEditChild(parent.ID_DOCUMENTO, childId, data)}
                    onDelete={(childId) => onDeleteChild(parent.ID_DOCUMENTO, childId)}
                  >
                    {parent.DOCUMENTOS_ASOCIADOS}
                  </ChildCodesList>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        open={deleteDialog}
        onOpenChange={setDeleteDialog}
        onConfirm={handleDelete}
        title="¿Eliminar código padre?"
        description={`¿Está seguro de eliminar el código ${parent.CODIGO} y todos sus ${childrenCount} códigos hijo? Esta acción no se puede deshacer.`}
      />
    </>
  )
}
