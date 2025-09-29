"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockAuditLogs, mockPersonas, type AuditLog } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { Shield, Eye, Filter, Calendar, Database, Activity } from "lucide-react"
import { AppHeader } from "@/components/app-header"

export default function AuditoriaPage() {
  const { user } = useAuth()
  const [auditLogs] = useState<AuditLog[]>(mockAuditLogs)
  const [filtroAccion, setFiltroAccion] = useState<string>("todas")
  const [filtroTabla, setFiltroTabla] = useState<string>("todas")
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  if (!user || !user.roles.some((role) => role.nombre === "RRHH")) {
    return <div>No tienes permisos para acceder a esta página</div>
  }

  const logsFiltrados = auditLogs.filter((log) => {
    const matchAccion = filtroAccion === "todas" || log.accion === filtroAccion
    const matchTabla = filtroTabla === "todas" || log.tabla === filtroTabla
    return matchAccion && matchTabla
  })

  const columns = [
    {
      key: "fecha",
      label: "Fecha y Hora",
      render: (value: string) => new Date(value).toLocaleString(),
    },
    {
      key: "accion",
      label: "Acción",
      render: (value: string) => {
        const variants = {
          crear: "default" as const,
          editar: "secondary" as const,
          eliminar: "destructive" as const,
        }
        return <Badge variant={variants[value as keyof typeof variants]}>{value}</Badge>
      },
    },
    {
      key: "tabla",
      label: "Tabla",
      render: (value: string) => <Badge variant="outline">{value}</Badge>,
    },
    { key: "registroId", label: "ID Registro" },
    {
      key: "usuarioId",
      label: "Usuario",
      render: (value: string) => {
        const persona = mockPersonas.find((p) => p.id === value)
        return persona ? `${persona.nombre} ${persona.apellido}` : `Usuario ${value}`
      },
    },
    { key: "ip", label: "IP" },
    {
      key: "id",
      label: "Acciones",
      render: (value: string, row: AuditLog) => (
        <Button variant="ghost" size="sm" onClick={() => setSelectedLog(row)}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  const getActionIcon = (accion: string) => {
    switch (accion) {
      case "crear":
        return <Activity className="w-4 h-4 text-chart-2" />
      case "editar":
        return <Activity className="w-4 h-4 text-chart-4" />
      case "eliminar":
        return <Activity className="w-4 h-4 text-destructive" />
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />
    }
  }

  // Statistics
  const stats = {
    totalAcciones: auditLogs.length,
    creaciones: auditLogs.filter((log) => log.accion === "crear").length,
    ediciones: auditLogs.filter((log) => log.accion === "editar").length,
    eliminaciones: auditLogs.filter((log) => log.accion === "eliminar").length,
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader title="Auditoría del Sistema" subtitle="Registro de todas las acciones realizadas en el sistema" />

        <main className="flex-1 overflow-auto p-6 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Statistics */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Acciones</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalAcciones}</div>
                  <p className="text-xs text-muted-foreground">registros de auditoría</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Creaciones</CardTitle>
                  <Activity className="h-4 w-4 text-chart-2" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-chart-2">{stats.creaciones}</div>
                  <p className="text-xs text-muted-foreground">nuevos registros</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Modificaciones</CardTitle>
                  <Activity className="h-4 w-4 text-chart-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-chart-4">{stats.ediciones}</div>
                  <p className="text-xs text-muted-foreground">registros editados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Eliminaciones</CardTitle>
                  <Activity className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{stats.eliminaciones}</div>
                  <p className="text-xs text-muted-foreground">registros eliminados</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtros de Auditoría
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Tipo de Acción</label>
                    <Select value={filtroAccion} onValueChange={setFiltroAccion}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas las acciones</SelectItem>
                        <SelectItem value="crear">Crear</SelectItem>
                        <SelectItem value="editar">Editar</SelectItem>
                        <SelectItem value="eliminar">Eliminar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Tabla</label>
                    <Select value={filtroTabla} onValueChange={setFiltroTabla}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todas">Todas las tablas</SelectItem>
                        <SelectItem value="usuarios">Usuarios</SelectItem>
                        <SelectItem value="capacitaciones">Capacitaciones</SelectItem>
                        <SelectItem value="participantes">Participantes</SelectItem>
                        <SelectItem value="planes">Planes</SelectItem>
                        <SelectItem value="documentos">Documentos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button variant="outline">
                      <Calendar className="w-4 h-4 mr-2" />
                      Exportar Log
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Actividad Reciente
                </CardTitle>
                <CardDescription>Últimas acciones registradas en el sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {auditLogs.slice(0, 5).map((log) => {
                    const persona = mockPersonas.find((p) => p.id === log.usuarioId)
                    return (
                      <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          {getActionIcon(log.accion)}
                          <div>
                            <p className="font-medium">
                              {persona ? `${persona.nombre} ${persona.apellido}` : `Usuario ${log.usuarioId}`}{" "}
                              <span className="text-muted-foreground">
                                {log.accion === "crear" && "creó"}
                                {log.accion === "editar" && "editó"}
                                {log.accion === "eliminar" && "eliminó"}
                              </span>{" "}
                              un registro en <Badge variant="outline">{log.tabla}</Badge>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(log.fecha).toLocaleString()} • IP: {log.ip}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Audit Log Table */}
            <DataTable
              title="Registro Completo de Auditoría"
              data={logsFiltrados}
              columns={columns}
              searchPlaceholder="Buscar en logs de auditoría..."
            />

            {/* Detail Modal */}
            {selectedLog && (
              <Card className="fixed inset-4 z-50 bg-background border shadow-lg overflow-auto">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Detalle de Auditoría
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedLog(null)}>
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">Acción</label>
                      <p className="text-sm text-muted-foreground">{selectedLog.accion}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Tabla</label>
                      <p className="text-sm text-muted-foreground">{selectedLog.tabla}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">ID Registro</label>
                      <p className="text-sm text-muted-foreground">{selectedLog.registroId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Fecha</label>
                      <p className="text-sm text-muted-foreground">{new Date(selectedLog.fecha).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Usuario</label>
                      <p className="text-sm text-muted-foreground">
                        {mockPersonas.find((p) => p.id === selectedLog.usuarioId)?.nombre || selectedLog.usuarioId}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">IP</label>
                      <p className="text-sm text-muted-foreground">{selectedLog.ip}</p>
                    </div>
                  </div>

                  {selectedLog.valoresAntiguos && (
                    <div>
                      <label className="text-sm font-medium">Valores Anteriores</label>
                      <pre className="text-xs bg-muted p-3 rounded mt-2 overflow-auto">
                        {JSON.stringify(selectedLog.valoresAntiguos, null, 2)}
                      </pre>
                    </div>
                  )}

                  {selectedLog.valoresNuevos && (
                    <div>
                      <label className="text-sm font-medium">Valores Nuevos</label>
                      <pre className="text-xs bg-muted p-3 rounded mt-2 overflow-auto">
                        {JSON.stringify(selectedLog.valoresNuevos, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
