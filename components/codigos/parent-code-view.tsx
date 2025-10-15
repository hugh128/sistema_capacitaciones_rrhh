"use client"

import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useMemo } from "react"
import type { CodigoPadre } from "@/lib/codigos/types"

interface ParentCodeViewProps {
  parent: CodigoPadre | null
  open: boolean
  onClose: () => void
}

export function ParentCodeView({ parent, open, onClose }: ParentCodeViewProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const itemsPerPage = 10

  const { totalPages, visibleChildren, filteredCount } = useMemo(() => {
    if (!parent) return { totalPages: 0, visibleChildren: [], filteredCount: 0 }

    const filtered = parent.DOCUMENTOS_ASOCIADOS.filter((child) => {
      const query = searchQuery.toLowerCase()
      return (
        child.CODIGO.toLowerCase().includes(query) ||
        child.NOMBRE_DOCUMENTO.toLowerCase().includes(query)
      )
    })

    const total = Math.ceil(filtered.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const visible = filtered.slice(startIndex, startIndex + itemsPerPage)

    return { totalPages: total, visibleChildren: visible, filteredCount: filtered.length }
  }, [parent, currentPage, searchQuery])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  if (!parent) return null

  const childrenCount = parent.DOCUMENTOS_ASOCIADOS.length; 
  const isVigente = parent.ESTATUS === true; 

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto md:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalles del Código</DialogTitle>
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
              <CardHeader>
                <CardTitle className="text-base">Información del Código Padre</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="children">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">
                      Códigos Hijo ({searchQuery ? `${filteredCount} de ${childrenCount}` : childrenCount})
                    </h4>
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

                  {childrenCount === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground border rounded-lg">
                      No hay códigos hijo asociados
                    </div>
                  ) : filteredCount === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground border rounded-lg">
                      No se encontraron códigos hijo que coincidan con &quot;{searchQuery}&quot;
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {visibleChildren.map((child) => (
                          <div key={child.ID_DOC_ASOCIADO} className="p-3 bg-muted/50 rounded-lg">
                            <div className="grid grid-cols-[1fr_2fr_0.5fr] gap-3 items-center">
                              <div>
                                <p className="text-xs text-muted-foreground">Dato Asociado</p>
                                <p className="text-sm font-medium truncate">{child.CODIGO}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Nombre de Documento</p>
                                <p className="text-sm break-words">{child.NOMBRE_DOCUMENTO}</p> 
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground invisible">Estatus</p>
                                <Badge variant={child.ESTATUS ? "default" : "secondary"} className="font-normal whitespace-nowrap">
                                  {child.ESTATUS ? "Vigente" : "Inactivo"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-2">
                          <div className="text-xs text-muted-foreground">
                            Mostrando {(currentPage - 1) * itemsPerPage + 1}-
                            {Math.min(currentPage * itemsPerPage, filteredCount)} de {filteredCount}
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
