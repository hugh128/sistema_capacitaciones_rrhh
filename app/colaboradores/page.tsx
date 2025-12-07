"use client"

import { Sidebar } from "@/components/sidebar"
import { RequirePermission } from "@/components/RequirePermission"
import { AppHeader } from "@/components/app-header"
import { useCallback, useEffect, useState, useRef } from "react"
import type { Colaborador } from "@/lib/colaboradores/type"
import CollaboratorsList from "@/components/colaboradores/CollaboratorsList"
import ProfileContent from "@/components/colaboradores/profile-content"
import { useColaboradores } from "@/hooks/useColaboradores"
import { useAuth } from "@/contexts/auth-context"
import { Toaster } from "react-hot-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ColaboradoresPage() {
  const { user } = useAuth()
  const [selectedCollaborator, setSelectedCollaborator] = useState<Colaborador | null>(null)
  const [filterStatus, setFilterStatus] = useState<"all" | "activo" | "inactivo">("all")
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const hasFetchedRef = useRef(false)
  const isFetchingRef = useRef(false)

  const {
    colaboradores,
    obtenerColaboradores,
  } = useColaboradores(user)

  const handleSelectCollaborator = useCallback((colaborador: Colaborador) => {
    setSelectedCollaborator(colaborador)
  }, [])

  const handleBackToList = useCallback(() => {
    setSelectedCollaborator(null)
  }, [])

  const fetchColaboradores = useCallback(async () => {
    if (!user || isFetchingRef.current) {
      setIsLoading(false)
      return
    }

    const roles = user.ROLES?.map((r) => r.NOMBRE) || []
    const hasPermission = roles.includes("RRHH") || 
                         roles.includes("Auditoria") || 
                         roles.includes("Gerente") || 
                         roles.includes("Jefe")

    if (!hasPermission) {
      console.warn("Usuario sin permisos para ver colaboradores")
      setIsLoading(false)
      setHasError(true)
      setErrorMessage("No tienes permisos para ver colaboradores")
      return
    }

    isFetchingRef.current = true
    setIsLoading(true)
    setHasError(false)
    setErrorMessage("")

    try {
      if (roles.includes("RRHH") || roles.includes("Auditoria")) {
        await obtenerColaboradores()
      } else if (roles.includes("Gerente") || roles.includes("Jefe")) {
        await obtenerColaboradores(user.PERSONA_ID)
      }
      hasFetchedRef.current = true
    } catch (error) {
      console.error('Error al cargar colaboradores:', error)
      setHasError(true)
      
      if (error && typeof error === 'object' && 'code' in error) {
        const axiosError = error as { code?: string; message?: string }
        if (axiosError.code === 'ERR_NETWORK') {
          setErrorMessage("No se pudo conectar con el servidor. Verifica tu conexión.")
        } else {
          setErrorMessage(axiosError.message || "Error desconocido al cargar colaboradores")
        }
      } else {
        setErrorMessage("Error inesperado al cargar colaboradores")
      }
    } finally {
      setIsLoading(false)
      isFetchingRef.current = false
    }
  }, [user, obtenerColaboradores])

  useEffect(() => {
    if (!hasFetchedRef.current) {
      fetchColaboradores()
    }
  }, [fetchColaboradores])

  if (isLoading) {
    return (
      <RequirePermission requiredPermissions={["employees_access"]}>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <AppHeader title="Colaboradores" subtitle="Gestiona el perfil y estado de todos los colaboradores de tu organización" />
            
            <main className="flex-1 flex items-center justify-center p-6">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                  </div>
                  <CardTitle className="text-center">Cargando Colaboradores</CardTitle>
                  <CardDescription className="text-center">
                    Obteniendo información de los colaboradores...
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </RequirePermission>
    )
  }

  if (hasError) {
    return (
      <RequirePermission requiredPermissions={["employees_access"]}>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <AppHeader title="Colaboradores" subtitle="Gestiona el perfil y estado de todos los colaboradores de tu organización" />
            
            <main className="flex-1 flex items-center justify-center p-6">
              <Card className="w-full max-w-2xl border-destructive">
                <CardHeader className="text-center">
                  <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                  </div>
                  <CardTitle className="text-2xl">Error al Cargar Colaboradores</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {errorMessage}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <Button 
                    onClick={() => {
                      hasFetchedRef.current = false
                      fetchColaboradores()
                    }}
                    className="w-full"
                    size="lg"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reintentar
                  </Button>
                  <p className="text-sm text-center text-muted-foreground">
                    Si el problema persiste, contacta a <span className="font-bold">sistemas</span>.
                  </p>
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </RequirePermission>
    )
  }

  return (
    <RequirePermission requiredPermissions={["employees_access"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader title="Colaboradores" subtitle="Gestiona el perfil y estado de todos los colaboradores de tu organización" />

          <main className="flex-1 overflow-auto p-6 custom-scrollbar">
            <Toaster />

            <div className="max-w-7xl mx-auto">
              {selectedCollaborator ? (
                <ProfileContent 
                  collaborator={selectedCollaborator} 
                  onBack={handleBackToList} 
                />
              ) : (
                <CollaboratorsList
                  colaboradores={colaboradores}
                  filterStatus={filterStatus}
                  setFilterStatus={setFilterStatus}
                  onSelectCollaborator={handleSelectCollaborator}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </RequirePermission>  
  )
}
