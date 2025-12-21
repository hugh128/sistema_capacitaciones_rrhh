"use client"

import { useState, useMemo, useEffect, useCallback, memo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"
import { ParentCodeForm } from "./parent-code-form"
import { ChildCodesList } from "./child-codes-list"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"
import { VersionChangeDialog } from "./version-change-dialog"
import type { CodigoPadre, NuevoCodigoPadre, NuevoCodigoHijo, Recapacitacion } from "@/lib/codigos/types"
import { getEstatusBadgeVariant } from "./codes-table"
import toast from "react-hot-toast"

interface ParentCodeEditProps {
  parent: CodigoPadre | null
  open: boolean
  onClose: () => void
  onUpdate: (id: number, data: NuevoCodigoPadre) => void
  onDelete: (id: number) => void
  onAddChild: (parentId: number, child: NuevoCodigoHijo) => void
  onEditChild: (parentId: number, childId: number, data: NuevoCodigoHijo) => void
  onDeleteChild: (parentId: number, childId: number) => void
  onRecapacitar: (idDocumento: number, nuevaVersion: number, requiereRecapacitacion: boolean, usuario: string) => Promise<Recapacitacion>
  currentUser: string
}

export const ParentCodeEdit = memo(function ParentCodeEdit({
  parent,
  open,
  onClose,
  onUpdate,
  onDelete,
  onAddChild,
  onEditChild,
  onDeleteChild,
  onRecapacitar,
  currentUser,
}: ParentCodeEditProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  
  const [pendingUpdate, setPendingUpdate] = useState<NuevoCodigoPadre | null>(null)
  const [versionChangeDialog, setVersionChangeDialog] = useState(false)
  const [isProcessingRecapacitacion, setIsProcessingRecapacitacion] = useState(false)
  const [recapacitacionResult, setRecapacitacionResult] = useState<Recapacitacion | null>(null)
  
  const dialogStateRef = useRef({
    isOpen: false,
    result: null as Recapacitacion | null,
    pendingData: null as NuevoCodigoPadre | null,
  })
  
  const isRecapacitacionInProgressRef = useRef(false)

  const initialFormData = useMemo<NuevoCodigoPadre>(() => {
    if (!parent) {
      return {
        CODIGO: "",
        TIPO_DOCUMENTO: "",
        NOMBRE_DOCUMENTO: "",
        APROBACION: "",
        VERSION: 1,
        ESTATUS: "VIGENTE",
        DEPARTAMENTO_CODIGO: ""
      }
    }
    return {
      CODIGO: parent.CODIGO,
      TIPO_DOCUMENTO: parent.TIPO_DOCUMENTO,
      NOMBRE_DOCUMENTO: parent.NOMBRE_DOCUMENTO,
      APROBACION: parent.APROBACION,
      VERSION: parent.VERSION,
      ESTATUS: parent.ESTATUS,
      DEPARTAMENTO_CODIGO: parent.DEPARTAMENTO_CODIGO
    }
  }, [parent])

  useEffect(() => {
    if (!open && !isRecapacitacionInProgressRef.current) {
      setIsEditing(false);
      setPendingUpdate(null);
      setVersionChangeDialog(false);
      setRecapacitacionResult(null);
      dialogStateRef.current = {
        isOpen: false,
        result: null,
        pendingData: null,
      };
    }
  }, [open]);

  const handleEdit = useCallback(() => {
    setIsEditing(true)
  }, [])

  const handleSave = useCallback(async (data: NuevoCodigoPadre) => {
    if (!parent) return

    const versionIncreased = data.VERSION > parent.VERSION

    if (versionIncreased) {
      setPendingUpdate(data)
      setVersionChangeDialog(true)
      dialogStateRef.current = {
        isOpen: true,
        result: null,
        pendingData: data,
      }
    } else {
      onUpdate(parent.ID_DOCUMENTO, data)
      setIsEditing(false)
    }
  }, [parent, onUpdate])

  const handleProcessRecapacitacion = useCallback(async (requiereRecapacitacion: boolean) => {
    if (!parent || !pendingUpdate) return

    setIsProcessingRecapacitacion(true)
    isRecapacitacionInProgressRef.current = true

    try {
      //await new Promise(resolve => setTimeout(resolve, 300))
      
      const result = await onRecapacitar(
        parent.ID_DOCUMENTO,
        pendingUpdate.VERSION,
        requiereRecapacitacion,
        currentUser
      )

      onUpdate(parent.ID_DOCUMENTO, pendingUpdate)

      dialogStateRef.current = {
        isOpen: true,
        result: result,
        pendingData: pendingUpdate,
      }
      
      setTimeout(() => {
        setRecapacitacionResult(result)
        setVersionChangeDialog(true)
        
        isRecapacitacionInProgressRef.current = false
      }, 100)
    } catch (error) {
      console.error("❌ Error en recapacitación:", error)
      toast.error("Error al procesar la recapacitación")
      setVersionChangeDialog(false)
      setPendingUpdate(null)
      setRecapacitacionResult(null)
      dialogStateRef.current = {
        isOpen: false,
        result: null,
        pendingData: null,
      }
      isRecapacitacionInProgressRef.current = false
    } finally {
      setIsProcessingRecapacitacion(false)
    }
  }, [parent, pendingUpdate, onRecapacitar, onUpdate, currentUser])

  const handleConfirmRecapacitacion = useCallback(async () => {
    await handleProcessRecapacitacion(true)
  }, [handleProcessRecapacitacion])

  const handleCancelRecapacitacion = useCallback(async () => {
    await handleProcessRecapacitacion(false)
  }, [handleProcessRecapacitacion])

  const handleCloseVersionDialog = useCallback(() => {
    setVersionChangeDialog(false)
    setPendingUpdate(null)
    setRecapacitacionResult(null)
    setIsEditing(false)
    isRecapacitacionInProgressRef.current = false
    dialogStateRef.current = {
      isOpen: false,
      result: null,
      pendingData: null,
    }
  }, [])

  const handleCancel = useCallback(() => {
    setIsEditing(false)
  }, [])

  const handleDelete = useCallback(() => {
    if (!parent) return
    onDelete(parent.ID_DOCUMENTO)
    setDeleteDialog(false)
    onClose()
  }, [parent, onDelete, onClose])

  if (!parent) return null

  const childrenCount = parent.DOCUMENTOS_ASOCIADOS.length;

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
                      Inactivar
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <ParentCodeForm
                      initialData={initialFormData}
                      onSubmit={handleSave}
                      onCancel={handleCancel}
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
                            <p className="text-sm text-muted-foreground">Codigo Departamento</p>
                            <p className="text-base">{parent.DEPARTAMENTO_CODIGO ?? "Sin codigo de departamento"}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Version</p>
                            <p className="text-base">{parent.VERSION}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Estatus</p>
                            <Badge variant={getEstatusBadgeVariant(parent.ESTATUS)}>
                              {parent.ESTATUS}
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
        title="¿Inactivar código padre?"
        description={`¿Está seguro de inactivar el código ${parent.CODIGO}? Esta acción no se puede deshacer.`}
      />

      {parent && (pendingUpdate || dialogStateRef.current.pendingData) && (
        <VersionChangeDialog
          open={versionChangeDialog || dialogStateRef.current.isOpen}
          oldVersion={parent.VERSION}
          newVersion={(pendingUpdate || dialogStateRef.current.pendingData)?.VERSION || parent.VERSION}
          codigoPadre={parent.CODIGO}
          isLoading={isProcessingRecapacitacion}
          result={recapacitacionResult || dialogStateRef.current.result}
          onConfirm={handleConfirmRecapacitacion}
          onCancel={handleCancelRecapacitacion}
          onClose={handleCloseVersionDialog}
        />
      )}
    </>
  )
});
