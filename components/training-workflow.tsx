"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { mockParticipantes, mockPersonas, type Capacitacion } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { Play, CheckCircle, XCircle, Clock, Users, FileText, Award, Upload } from "lucide-react"

interface TrainingWorkflowProps {
  capacitacion: Capacitacion
  onStatusChange: (newStatus: Capacitacion["estado"]) => void
}

export function TrainingWorkflow({ capacitacion, onStatusChange }: TrainingWorkflowProps) {
  const { user } = useAuth()
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<Capacitacion["estado"] | null>(null)
  const [notes, setNotes] = useState("")

  // Get participants for this training
  const participantes = mockParticipantes.filter((p) => p.capacitacionId === capacitacion.id)
  const totalParticipantes = participantes.length
  const asistieron = participantes.filter((p) => p.estado === "asistió" || p.estado === "aprobado").length
  const aprobados = participantes.filter((p) => p.estado === "aprobado").length
  const reprobados = participantes.filter((p) => p.estado === "reprobado").length
  const pendientes = participantes.filter((p) => p.estado === "pendiente").length

  // Check if user can modify training status
  const canModifyStatus = user?.roles.some(
    (role) => role.nombre === "RRHH" || (role.nombre === "Capacitador" && capacitacion.capacitadorId === user.id),
  )

  // Check workflow requirements
  const hasParticipants = totalParticipantes > 0
  const hasAttendance = asistieron > 0
  const allExamsGraded = capacitacion.aplicaExamen
    ? participantes.filter((p) => p.asistencia).every((p) => p.notaExamen !== undefined)
    : true
  const evidencesUploaded = true // This would check actual evidence uploads

  const getStatusColor = (estado: Capacitacion["estado"]) => {
    switch (estado) {
      case "activa":
        return "bg-chart-4 text-chart-4-foreground"
      case "finalizada":
        return "bg-chart-2 text-chart-2-foreground"
      case "cancelada":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getWorkflowSteps = () => {
    return [
      {
        id: "creation",
        title: "Creación",
        description: "Capacitación creada por RRHH",
        status: "completed",
        icon: <CheckCircle className="w-4 h-4" />,
        canExecute: false,
      },
      {
        id: "assignment",
        title: "Asignación de Participantes",
        description: `${totalParticipantes} participantes asignados`,
        status: hasParticipants ? "completed" : "pending",
        icon: hasParticipants ? <CheckCircle className="w-4 h-4" /> : <Users className="w-4 h-4" />,
        canExecute: canModifyStatus && !hasParticipants,
      },
      {
        id: "execution",
        title: "Ejecución",
        description: "Capacitación en progreso",
        status: capacitacion.estado === "activa" ? "active" : hasParticipants ? "pending" : "blocked",
        icon: capacitacion.estado === "activa" ? <Play className="w-4 h-4" /> : <Clock className="w-4 h-4" />,
        canExecute: canModifyStatus && hasParticipants && capacitacion.estado !== "activa",
      },
      {
        id: "attendance",
        title: "Registro de Asistencia",
        description: `${asistieron}/${totalParticipantes} asistieron`,
        status: hasAttendance ? "completed" : capacitacion.estado === "activa" ? "pending" : "blocked",
        icon: hasAttendance ? <CheckCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />,
        canExecute: canModifyStatus && capacitacion.estado === "activa",
      },
      {
        id: "grading",
        title: "Calificación de Exámenes",
        description: capacitacion.aplicaExamen
          ? `${participantes.filter((p) => p.notaExamen !== undefined).length}/${asistieron} calificados`
          : "No aplica examen",
        status: !capacitacion.aplicaExamen
          ? "not-applicable"
          : allExamsGraded
            ? "completed"
            : hasAttendance
              ? "pending"
              : "blocked",
        icon: !capacitacion.aplicaExamen ? (
          <XCircle className="w-4 h-4" />
        ) : allExamsGraded ? (
          <CheckCircle className="w-4 h-4" />
        ) : (
          <FileText className="w-4 h-4" />
        ),
        canExecute: canModifyStatus && capacitacion.aplicaExamen && hasAttendance && !allExamsGraded,
      },
      {
        id: "evidence",
        title: "Carga de Evidencias",
        description: "Evidencias documentales subidas",
        status: evidencesUploaded ? "completed" : hasAttendance ? "pending" : "blocked",
        icon: evidencesUploaded ? <CheckCircle className="w-4 h-4" /> : <Upload className="w-4 h-4" />,
        canExecute: canModifyStatus && hasAttendance,
      },
      {
        id: "completion",
        title: "Finalización",
        description: "Capacitación completada",
        status:
          capacitacion.estado === "finalizada"
            ? "completed"
            : hasAttendance && allExamsGraded && evidencesUploaded
              ? "pending"
              : "blocked",
        icon:
          capacitacion.estado === "finalizada" ? <CheckCircle className="w-4 h-4" /> : <Award className="w-4 h-4" />,
        canExecute:
          canModifyStatus &&
          hasAttendance &&
          allExamsGraded &&
          evidencesUploaded &&
          capacitacion.estado !== "finalizada",
      },
    ]
  }

  const handleStatusChange = (newStatus: Capacitacion["estado"]) => {
    setPendingStatus(newStatus)
    setConfirmationOpen(true)
  }

  const confirmStatusChange = () => {
    if (pendingStatus) {
      onStatusChange(pendingStatus)
      setConfirmationOpen(false)
      setPendingStatus(null)
      setNotes("")
    }
  }

  const getStatusActions = () => {
    const actions = []

    if (capacitacion.estado === "activa" && canModifyStatus) {
      actions.push(
        <Button
          key="finalize"
          onClick={() => handleStatusChange("finalizada")}
          disabled={!hasAttendance || !allExamsGraded || !evidencesUploaded}
          className="gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Finalizar Capacitación
        </Button>,
      )

      actions.push(
        <Button key="cancel" variant="destructive" onClick={() => handleStatusChange("cancelada")} className="gap-2">
          <XCircle className="w-4 h-4" />
          Cancelar
        </Button>,
      )
    }

    if (
      capacitacion.estado !== "activa" &&
      capacitacion.estado !== "finalizada" &&
      canModifyStatus &&
      hasParticipants
    ) {
      actions.push(
        <Button key="activate" onClick={() => handleStatusChange("activa")} className="gap-2">
          <Play className="w-4 h-4" />
          Iniciar Capacitación
        </Button>,
      )
    }

    return actions
  }

  const workflowSteps = getWorkflowSteps()
  const completedSteps = workflowSteps.filter(
    (step) => step.status === "completed" || step.status === "not-applicable",
  ).length
  const totalSteps = workflowSteps.length
  const progressPercentage = (completedSteps / totalSteps) * 100

  return (
    <div className="space-y-6">
      {/* Training Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {capacitacion.nombre}
                <Badge className={getStatusColor(capacitacion.estado)}>{capacitacion.estado}</Badge>
              </CardTitle>
              <CardDescription>
                Código: {capacitacion.codigo} • Tipo: {capacitacion.tipo}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{Math.round(progressPercentage)}%</div>
              <div className="text-sm text-muted-foreground">Completado</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progressPercentage} className="h-2" />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{totalParticipantes}</div>
                <div className="text-sm text-muted-foreground">Participantes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-2">{aprobados}</div>
                <div className="text-sm text-muted-foreground">Aprobados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-chart-4">{asistieron}</div>
                <div className="text-sm text-muted-foreground">Asistieron</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">{pendientes}</div>
                <div className="text-sm text-muted-foreground">Pendientes</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">{getStatusActions()}</div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Flujo de Trabajo</CardTitle>
          <CardDescription>Seguimiento del proceso de capacitación</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflowSteps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-4">
                <div
                  className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2
                  ${
                    step.status === "completed"
                      ? "bg-chart-2 border-chart-2 text-white"
                      : step.status === "active"
                        ? "bg-chart-4 border-chart-4 text-white"
                        : step.status === "not-applicable"
                          ? "bg-muted border-muted text-muted-foreground"
                          : step.status === "pending"
                            ? "border-chart-4 text-chart-4"
                            : "border-muted text-muted-foreground"
                  }
                `}
                >
                  {step.icon}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {step.status === "completed" && (
                        <Badge variant="outline" className="text-chart-2 border-chart-2">
                          Completado
                        </Badge>
                      )}
                      {step.status === "active" && (
                        <Badge variant="outline" className="text-chart-4 border-chart-4">
                          En Progreso
                        </Badge>
                      )}
                      {step.status === "pending" && (
                        <Badge variant="outline" className="text-warning border-warning">
                          Pendiente
                        </Badge>
                      )}
                      {step.status === "blocked" && (
                        <Badge variant="outline" className="text-muted-foreground border-muted">
                          Bloqueado
                        </Badge>
                      )}
                      {step.status === "not-applicable" && (
                        <Badge variant="outline" className="text-muted-foreground border-muted">
                          No Aplica
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Participants Detail */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Participantes</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Todos ({totalParticipantes})</TabsTrigger>
              <TabsTrigger value="approved">Aprobados ({aprobados})</TabsTrigger>
              <TabsTrigger value="attended">Asistieron ({asistieron})</TabsTrigger>
              <TabsTrigger value="pending">Pendientes ({pendientes})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-2">
              {participantes.map((participante) => {
                const persona = mockPersonas.find((p) => p.id === participante.personaId)
                return (
                  <div key={participante.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">
                        {persona?.nombre} {persona?.apellido}
                      </p>
                      <p className="text-sm text-muted-foreground">Asignado: {participante.fechaAsignacion}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          participante.estado === "aprobado"
                            ? "default"
                            : participante.estado === "asistió"
                              ? "secondary"
                              : participante.estado === "reprobado"
                                ? "destructive"
                                : "outline"
                        }
                      >
                        {participante.estado}
                      </Badge>
                      {participante.notaExamen && (
                        <span className="text-sm text-muted-foreground">{participante.notaExamen}/100</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </TabsContent>

            <TabsContent value="approved" className="space-y-2">
              {participantes
                .filter((p) => p.estado === "aprobado")
                .map((participante) => {
                  const persona = mockPersonas.find((p) => p.id === participante.personaId)
                  return (
                    <div key={participante.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">
                          {persona?.nombre} {persona?.apellido}
                        </p>
                        <p className="text-sm text-muted-foreground">Completado: {participante.fechaCompletado}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default">Aprobado</Badge>
                        <span className="text-sm font-medium text-chart-2">{participante.notaExamen}/100</span>
                      </div>
                    </div>
                  )
                })}
            </TabsContent>

            <TabsContent value="attended" className="space-y-2">
              {participantes
                .filter((p) => p.asistencia)
                .map((participante) => {
                  const persona = mockPersonas.find((p) => p.id === participante.personaId)
                  return (
                    <div key={participante.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">
                          {persona?.nombre} {persona?.apellido}
                        </p>
                        <p className="text-sm text-muted-foreground">Estado: {participante.estado}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-chart-2" />
                        {participante.notaExamen && (
                          <span className="text-sm text-muted-foreground">{participante.notaExamen}/100</span>
                        )}
                      </div>
                    </div>
                  )
                })}
            </TabsContent>

            <TabsContent value="pending" className="space-y-2">
              {participantes
                .filter((p) => p.estado === "pendiente" || p.estado === "asignado")
                .map((participante) => {
                  const persona = mockPersonas.find((p) => p.id === participante.personaId)
                  return (
                    <div key={participante.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">
                          {persona?.nombre} {persona?.apellido}
                        </p>
                        <p className="text-sm text-muted-foreground">Asignado: {participante.fechaAsignacion}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{participante.estado}</Badge>
                        <Clock className="w-4 h-4 text-warning" />
                      </div>
                    </div>
                  )
                })}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Status Change Confirmation Dialog */}
      <Dialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Cambio de Estado</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cambiar el estado de la capacitación a {pendingStatus}?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Agrega cualquier observación sobre este cambio..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmationOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmStatusChange}>Confirmar Cambio</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
