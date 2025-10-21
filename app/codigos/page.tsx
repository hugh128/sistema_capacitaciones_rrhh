"use client"

import type React from "react"

import { useState, useRef, useEffect, useMemo, useTransition, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Upload, Download, Search, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Sidebar } from "@/components/sidebar"
import { AppHeader } from "@/components/app-header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CodesTable } from "@/components/codigos/codes-table"
import { ParentCodeForm } from "@/components/codigos/parent-code-form"
import { ParentCodeView } from "@/components/codigos/parent-code-view"
import { ParentCodeEdit } from "@/components/codigos/parent-code-edit"
import { exportToExcel, importFromExcel } from "@/lib/codigos/excel-utils"
import { useCodigosFilter, useCodigosPagination } from "@/lib/codigos/hooks"
import type { CodigoPadre, NuevoCodigoPadre, NuevoCodigoHijo } from "@/lib/codigos/types"
import toast, { Toaster } from "react-hot-toast"
import { useCodigos } from "@/hooks/useCodigos"
import { useAuth } from "@/contexts/auth-context"

type ImportConfirmationState = {
  isOpen: boolean;
  file: File | null;
  codigosAImportar: CodigoPadre[] | null;
};

export default function CodigosAsociadosPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { user } = useAuth()
  const {
    codigos,
    createParent,
    updateParent,
    deleteParent,
    addChild,
    updateChild,
    deleteChild,
    refreshCodigos
  } = useCodigos(user)

  const [importConfirmation, setImportConfirmation] = useState<ImportConfirmationState>({
    isOpen: false,
    file: null,
    codigosAImportar: null,
  });
  const [isImporting, setIsImporting] = useState(false);
  const [isPending, startTransition] = useTransition()

  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  const [isAddParentOpen, setIsAddParentOpen] = useState(false)
  const [viewParent, setViewParent] = useState<CodigoPadre | null>(null)
  const [editParent, setEditParent] = useState<CodigoPadre | null>(null)

  const [newParentData, setNewParentData] = useState<NuevoCodigoPadre>({
    CODIGO: "",
    TIPO_DOCUMENTO: "",
    NOMBRE_DOCUMENTO: "",
    APROBACION: "",
    VERSION: 0,
    ESTATUS: "VIGENTE",
    DEPARTAMENTO_CODIGO: ""
  })

  const filteredCodigos = useCodigosFilter(codigos, searchQuery)
  const paginatedCodigos = useCodigosPagination(filteredCodigos, currentPage, itemsPerPage)
  const totalPages = useMemo(
    () => Math.ceil(filteredCodigos.length / itemsPerPage),
    [filteredCodigos.length, itemsPerPage],
  )

  useEffect(() => {
    if (editParent) {
      const updatedParent = codigos.find(c => c.ID_DOCUMENTO === editParent.ID_DOCUMENTO);
      if (updatedParent && updatedParent !== editParent) {
        setEditParent(updatedParent);
      } else if (!updatedParent) {
        setEditParent(null);
      }
    }
  }, [codigos, editParent]);


  const handleAddParent = async () => {
    if (
      !newParentData.CODIGO ||
      !newParentData.TIPO_DOCUMENTO ||
      !newParentData.NOMBRE_DOCUMENTO ||
      !newParentData.APROBACION ||
      !newParentData.VERSION ||
      !newParentData.DEPARTAMENTO_CODIGO
    ) {
      toast.error("Por favor complete todos los campos obligatorios")
      return
    }

    try {
      await createParent(newParentData)
      toast.success("Código padre agregado correctamente.");
      
      setNewParentData({
        CODIGO: "",
        TIPO_DOCUMENTO: "",
        NOMBRE_DOCUMENTO: "",
        VERSION: 1,
        APROBACION: "",
        ESTATUS: "VIGENTE",
        DEPARTAMENTO_CODIGO: ""
      })
      setIsAddParentOpen(false)

    } catch (error) {
      console.error("Error en handleAddParent:", error)
    }
  }

  const handleUpdateParent = async (id: number, data: Omit<CodigoPadre, "ID_DOCUMENTO" | "DOCUMENTOS_ASOCIADOS">) => {
    try {
      const updatedParentData: NuevoCodigoPadre = {
        CODIGO: data.CODIGO,
        TIPO_DOCUMENTO: data.TIPO_DOCUMENTO,
        NOMBRE_DOCUMENTO: data.NOMBRE_DOCUMENTO,
        APROBACION: data.APROBACION,
        VERSION: data.VERSION,
        ESTATUS: data.ESTATUS,
        DEPARTAMENTO_CODIGO: data.DEPARTAMENTO_CODIGO
      }

      await updateParent(id, updatedParentData)
      setEditParent(null)
    } catch (error) {
      console.error("Error en handleUpdateParent:", error)
    }
  }

  const handleDeleteParent = async (id: number) => {
    try {
      await deleteParent(id)
      setViewParent(null)
      setEditParent(null)
    } catch (error) {
      console.error("Error en handleDeleteParent:", error)
    }
  }

  const handleAddChild = async (parentId: number, child: NuevoCodigoHijo) => {
    try {
      await addChild(parentId, child)
      toast.success("Código hijo agregado correctamente.");
    } catch (error) {
      console.error("Error en handleAddChild:", error)
    }
  }

  const handleEditChild = async (parentId: number, childId: number, data: NuevoCodigoHijo) => {
    try {
      await updateChild(childId, data)
    } catch (error) {
      console.error("Error en handleEditChild:", error)
    }
  }

  const handleDeleteChild = async (parentId: number, childId: number) => {
    try {
      await deleteChild(childId)
    } catch (error) {
      console.error("Error en handleDeleteChild:", error)
    }
  }

  const handleView = useCallback((parent: CodigoPadre) => {
    startTransition(() => {
      setViewParent(parent)
    })
  }, [])

  const handleEdit = useCallback((parent: CodigoPadre) => {
    startTransition(() => {
      setEditParent(parent)
    })
  }, [])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  const handleCancelImport = () => {
    setImportConfirmation({
      isOpen: false,
      file: null,
      codigosAImportar: null,
    });
  };

  const handleExportExcel = () => {
    try {
      exportToExcel(codigos); 
      toast.success("El archivo Excel se descargó correctamente");
    } catch (error) {
      console.error("Error exporting Excel:", error)
      toast.error("No se pudo generar el archivo Excel")
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    toast.loading("Procesando archivo... Esto puede tardar si el archivo es grande.", { id: 'import-loading' });

    try {
      const parsedCodigos = await importFromExcel(file);

      if (parsedCodigos.length === 0) {
        toast.dismiss('import-loading');
        toast.error("No se encontraron códigos válidos para importar en el archivo.");
        return;
      }

      toast.dismiss('import-loading');
      setImportConfirmation({
        isOpen: true,
        file: file,
        codigosAImportar: parsedCodigos,
      });
    } catch (error) {
      toast.dismiss('import-loading');
      const errorMessage = error instanceof Error ? error.message : "Error desconocido al procesar el archivo.";
      toast.error(errorMessage);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadErrorLog = (errors: string[], filename = "errores_importacion.txt") => {
    const blob = new Blob([errors.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleConfirmImport = async () => {
    const codesToImport = importConfirmation.codigosAImportar;
    if (!codesToImport || codesToImport.length === 0) return;

    setIsImporting(true);
    setImportConfirmation((prev) => ({ ...prev, isOpen: true }));

    let successCount = 0;
    const errorMessages = [];

    try {
      for (const parent of codesToImport) {
        try {
          const parentData = {
            CODIGO: parent.CODIGO,
            TIPO_DOCUMENTO: parent.TIPO_DOCUMENTO,
            NOMBRE_DOCUMENTO: parent.NOMBRE_DOCUMENTO,
            APROBACION: parent.APROBACION,
            VERSION: parent.VERSION,
            ESTATUS: parent.ESTATUS,
            DEPARTAMENTO_CODIGO: parent.DEPARTAMENTO_CODIGO
          };

          const existingParent = codigos.find(c => c.CODIGO === parent.CODIGO);
          let newParentId;
          let childrenSuccess = 0;

          if (existingParent) {
            newParentId = existingParent.ID_DOCUMENTO;
          } else {
            try {
              const response = await createParent(parentData);
              newParentId = response[0].ID_DOCUMENTO;
            } catch (e) {
              console.log(`Errores en cada iteracio: ${e}`)
              const errorMsg = e instanceof Error ? e.message : "Error desconocido";
              errorMessages.push(`Falló al crear Padre ${parent.CODIGO}: ${errorMsg}`);
              continue;
            }
          }

          if (newParentId) {
            for (const child of parent.DOCUMENTOS_ASOCIADOS) {
              const childExists = existingParent?.DOCUMENTOS_ASOCIADOS.some(
                existingChild => existingChild.CODIGO === child.CODIGO
              );

              if (!childExists) {
                try {
                  const childData = {
                    CODIGO: child.CODIGO,
                    NOMBRE_DOCUMENTO: child.NOMBRE_DOCUMENTO,
                    FECHA_APROBACION: child.FECHA_APROBACION,
                    VERSION: child.VERSION,
                    ESTATUS: child.ESTATUS,
                    DOCUMENTO_ID: newParentId,
                  };
                  await addChild(newParentId, childData);
                  childrenSuccess++;
                } catch (e) {
                  const errorMsg = e instanceof Error ? e.message : "Error desconocido";
                  errorMessages.push(`Falló al asociar Hijo ${child.CODIGO} al Padre ${parent.CODIGO}: ${errorMsg}`);
                }
              }
            }
          }
          
          if (!existingParent || childrenSuccess > 0) {
            successCount++;
          }

        } catch (error) {
          console.error(`Error inesperado al procesar ${parent.CODIGO}:`, error);
          errorMessages.push(`Error inesperado al procesar ${parent.CODIGO}. ${error}`);
        }
      }

      //await refreshCodigos();

      const totalProcessed = codesToImport.length;
      const failCount = totalProcessed - successCount;

      if (errorMessages.length > 0) {
        const summaryMsg = `⚠️ Importación con errores: ${successCount} éxitos, ${failCount} fallos.`;
        
        toast.error(summaryMsg, { duration: 8000 });
        console.group("DETALLES DE ERRORES DE IMPORTACIÓN");
        errorMessages.forEach(msg => console.error(msg));
        console.groupEnd();

        downloadErrorLog(errorMessages)

      } else if (successCount > 0) {
        toast.success(`Importación completada: ${successCount} códigos procesados.`, { duration: 5000 });
      } else {
        toast.success(`Importación finalizada. No se encontraron registros nuevos para añadir.`, { duration: 5000 });
      }

    } catch (err) {
      console.error("Error grave en la importación masiva:", err);
      toast.error("Ocurrió un error inesperado durante la importación masiva.");
    } finally {
      setIsImporting(false);
      handleCancelImport();
      await refreshCodigos();
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader title="Códigos Asociados" subtitle="Gestión jerárquica de códigos padre e hijos" />

        <main className="flex-1 overflow-auto p-6">

          <Toaster />

          <div className="max-w-7xl mx-auto space-y-6">
            {codigos.length > 5000 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Los datos son extensos ({codigos.length} códigos). Se recomienda filtrar o paginar para mejorar el
                  rendimiento.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Importar Excel
                </Button>
                <Button onClick={handleExportExcel} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Excel
                </Button>
              </div>
              <Button onClick={() => setIsAddParentOpen(true)} className="cursor-pointer">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Código Padre
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código, tipo de documento o estatus..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground whitespace-nowrap">Mostrar:</Label>
                <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Códigos</CardTitle>
                <CardDescription>
                  {searchQuery ? (
                    <>
                      {filteredCodigos.length} de {codigos.length} códigos padre • Página {currentPage} de {totalPages}
                    </>
                  ) : (
                    <>
                      {codigos.length} códigos padre • {codigos.reduce((acc, c) => acc + c.DOCUMENTOS_ASOCIADOS.length, 0)} códigos
                      hijo • Página {currentPage} de {totalPages}
                    </>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodesTable
                  codigos={paginatedCodigos}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDeleteParent}
                />

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {(currentPage - 1) * itemsPerPage + 1} -{" "}
                      {Math.min(currentPage * itemsPerPage, filteredCodigos.length)} de {filteredCodigos.length} códigos
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Anterior
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum: number
                          if (totalPages <= 5) {
                            pageNum = i + 1
                          } else if (currentPage <= 3) {
                            pageNum = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="w-9 h-9 p-0"
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Siguiente
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Dialog open={isAddParentOpen} onOpenChange={setIsAddParentOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agregar Código Padre</DialogTitle>
            <DialogDescription>Complete los campos para crear un nuevo código padre</DialogDescription>
          </DialogHeader>
          <ParentCodeForm
            data={newParentData}
            onChange={setNewParentData}
            onSubmit={handleAddParent}
            onCancel={() => setIsAddParentOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ParentCodeView
        parent={viewParent}
        open={!!viewParent}
        onClose={() => {
          startTransition(() => {
            setViewParent(null)
          })
        }}
      />

      <ParentCodeEdit
        parent={editParent}
        open={!!editParent}
        onClose={() => {
          startTransition(() => {
            setEditParent(null)
          })
        }}
        onUpdate={(id: number, data) => handleUpdateParent(id, data)}
        onDelete={(id: number) => handleDeleteParent(id)}
        onAddChild={(parentId: number, child) => handleAddChild(parentId, child)}
        onEditChild={(parentId: number, childId: number, data) => handleEditChild(parentId, childId, data)}
        onDeleteChild={(parentId: number, childId: number) => handleDeleteChild(parentId, childId)}
      />

      <Dialog open={importConfirmation.isOpen} onOpenChange={handleCancelImport}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Importación de Excel</DialogTitle>
            <DialogDescription>
              Se ha procesado el archivo **{importConfirmation.file?.name}**.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Se detectaron **{importConfirmation.codigosAImportar?.length} códigos padre únicos** para importar.
              Los códigos hijo serán asociados a sus respectivos códigos padre.
            </p>
            <Alert variant="default">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                ⚠️ **Advertencia**: Esta acción creará nuevos códigos en el sistema.
              </AlertDescription>
            </Alert>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={handleCancelImport} 
              disabled={isImporting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmImport} 
              disabled={isImporting || !importConfirmation.codigosAImportar}
            >
              {isImporting ? "Importando..." : "Confirmar Importación"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
