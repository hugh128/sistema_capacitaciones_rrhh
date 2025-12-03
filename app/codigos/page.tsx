"use client"

import type React from "react"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
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
import type { CodigoPadre, NuevoCodigoPadre, NuevoCodigoHijo } from "@/lib/codigos/types"
import toast, { Toaster } from "react-hot-toast"
import { useCodigos } from "@/hooks/useCodigos"
import { useAuth } from "@/contexts/auth-context"
import { useDebounce } from "@/hooks/useDebounde"
import type { Recapacitacion } from "@/lib/codigos/types"

type ImportConfirmationState = {
  isOpen: boolean;
  file: File | null;
  codigosAImportar: CodigoPadre[] | null;
};

export default function CodigosAsociadosPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isRecapacitacionActiveRef = useRef(false)

  const { user } = useAuth()
  const {
    codigos,
    createParent,
    updateParent,
    deleteParent,
    addChild,
    updateChild,
    deleteChild,
    refreshCodigos,
    recapacitarPorCambioVersion,
  } = useCodigos(user)

  const [importConfirmation, setImportConfirmation] = useState<ImportConfirmationState>({
    isOpen: false,
    file: null,
    codigosAImportar: null,
  });
  const [isImporting, setIsImporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTableReady, setIsTableReady] = useState(false);
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [isAddParentOpen, setIsAddParentOpen] = useState(false)
  const [viewParent, setViewParent] = useState<CodigoPadre | null>(null)
  const [editParent, setEditParent] = useState<CodigoPadre | null>(null)

  const [searchQuery, setSearchQuery] = useState("")

  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const filteredCodigos = useMemo(() => {
    if (!debouncedSearchQuery) return codigos;
    
    const query = debouncedSearchQuery.toLowerCase();
    
    return codigos.filter(codigo => {
      if (codigo.CODIGO?.toLowerCase().includes(query)) return true;
      if (codigo.TIPO_DOCUMENTO?.toLowerCase().includes(query)) return true;
      if (codigo.ESTATUS?.toLowerCase().includes(query)) return true;
      if (codigo.NOMBRE_DOCUMENTO?.toLowerCase().includes(query)) return true;
      return false;
    });
  }, [codigos, debouncedSearchQuery]);

  const totalPages = useMemo(
    () => Math.ceil(filteredCodigos.length / itemsPerPage),
    [filteredCodigos.length, itemsPerPage]
  )

  const paginatedCodigos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCodigos.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCodigos, currentPage, itemsPerPage]);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return; 
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    if (!isTableReady && codigos.length > 0) {
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => setIsTableReady(true));
      } else {
        setTimeout(() => setIsTableReady(true), 0);
      }
    }
  }, [codigos.length, isTableReady]);

  useEffect(() => {
    if (!editParent) return;
    
    if (isRecapacitacionActiveRef.current) {
      return;
    }
    
    const updatedParent = codigos.find(c => c.ID_DOCUMENTO === editParent.ID_DOCUMENTO);
    
    if (!updatedParent) {
      setEditParent(null);
      return;
    }
    
    const hasChanged = (
      updatedParent.CODIGO !== editParent.CODIGO ||
      updatedParent.TIPO_DOCUMENTO !== editParent.TIPO_DOCUMENTO ||
      updatedParent.NOMBRE_DOCUMENTO !== editParent.NOMBRE_DOCUMENTO ||
      updatedParent.ESTATUS !== editParent.ESTATUS ||
      updatedParent.VERSION !== editParent.VERSION ||
      updatedParent.DOCUMENTOS_ASOCIADOS.length !== editParent.DOCUMENTOS_ASOCIADOS.length
    );
    
    if (hasChanged) {
      setEditParent(updatedParent);
    }
  }, [codigos, editParent]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }, [])

  const handleItemsPerPageChange = useCallback((value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }, [])

  const handleAddParent = async (data: NuevoCodigoPadre) => {
    if (
      !data.CODIGO ||
      !data.TIPO_DOCUMENTO ||
      !data.NOMBRE_DOCUMENTO ||
      !data.APROBACION ||
      !data.VERSION ||
      !data.DEPARTAMENTO_CODIGO
    ) {
      toast.error("Por favor complete todos los campos obligatorios")
      return
    }

    try {
      await createParent(data)
      toast.success("Código padre agregado correctamente.");
      setIsAddParentOpen(false)
    } catch (error) {
      console.error("Error en handleAddParent:", error)
    }
  }

  const handleUpdateParent = async (id: number, data: NuevoCodigoPadre) => {
    try {
      await updateParent(id, data)
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
    setViewParent(parent)
  }, [])

  const handleEdit = useCallback((parent: CodigoPadre) => {
    setEditParent(parent)
  }, [])

  const handleCancelImport = useCallback(() => {
    setImportConfirmation({
      isOpen: false,
      file: null,
      codigosAImportar: null,
    });
  }, []);

  const handleExportExcel = useCallback(() => {
    try {
      exportToExcel(codigos); 
      toast.success("El archivo Excel se descargó correctamente");
    } catch (error) {
      console.error("Error exporting Excel:", error)
      toast.error("No se pudo generar el archivo Excel")
    }
  }, [codigos])

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
              console.log(`Errores en cada iteracion: ${e}`)
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

  const handleRecapacitar = useCallback(async (
    idDocumento: number, 
    nuevaVersion: number,
    requiereRecapacitacion: boolean,
    usuario: string
  ): Promise<Recapacitacion> => {
    try {
      isRecapacitacionActiveRef.current = true
      
      const result = await recapacitarPorCambioVersion({
        idDocumento,
        nuevaVersion,
        requiereRecapacitacion,
        usuario
      })
      
      await refreshCodigos()
      
      setTimeout(() => {
        isRecapacitacionActiveRef.current = false
      }, 2000)
      
      return result
    } catch (error) {
      isRecapacitacionActiveRef.current = false
      throw error
    }
  }, [recapacitarPorCambioVersion, refreshCodigos])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Cargando Detalles...</CardTitle>
            <CardDescription>Obteniendo información de los codigos.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                {!isTableReady && codigos.length > 0 ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <CodesTable
                    codigos={paginatedCodigos}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDeleteParent}
                  />
                )}

                {totalPages > 1 && isTableReady && (
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
                        className="dark:text-foreground dark:hover:border-white/40 cursor-pointer"

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
                              className="w-9 h-9 p-0 dark:text-foreground dark:hover:border-white/40 cursor-pointer"
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
                        className="dark:text-foreground dark:hover:border-white/40 cursor-pointer"
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

      {isAddParentOpen && (
        <Dialog open={isAddParentOpen} onOpenChange={setIsAddParentOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agregar Código Padre</DialogTitle>
              <DialogDescription>Complete los campos para crear un nuevo código padre</DialogDescription>
            </DialogHeader>
            <ParentCodeForm
              onSubmit={handleAddParent}
              onCancel={() => setIsAddParentOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {viewParent && (
        <ParentCodeView
          parent={viewParent}
          open={!!viewParent}
          onClose={() => setViewParent(null)}
        />
      )}

      {editParent && (
        <ParentCodeEdit
          parent={editParent}
          open={!!editParent}
          onClose={() => setEditParent(null)}
          onUpdate={(id: number, data) => handleUpdateParent(id, data)}
          onDelete={(id: number) => handleDeleteParent(id)}
          onAddChild={(parentId: number, child) => handleAddChild(parentId, child)}
          onEditChild={(parentId: number, childId: number, data) => handleEditChild(parentId, childId, data)}
          onDeleteChild={(parentId: number, childId: number) => handleDeleteChild(parentId, childId)}
          onRecapacitar={handleRecapacitar}
          currentUser={user?.USERNAME || user?.CORREO || "Usuario"}
        />
      )}

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
