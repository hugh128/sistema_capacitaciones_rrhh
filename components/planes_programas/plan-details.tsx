"use client"

import { ArrowLeft, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PlanCapacitacion } from "@/lib/planes_programas/types"

interface PlanDetailsProps {
  plan: PlanCapacitacion
  onBack: () => void
  onEdit: (plan: PlanCapacitacion) => void
}

export const getEstatusSpanVariant = (estatus: string) => {
  switch (estatus) {
    case "activo":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"; 
    case "borrador":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    default:
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  }
};

export const getEstatusDocumentoVariant = (estatus: string) => {
  switch (estatus) {
    case "vigente":
      return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400";
    case "proceso":
      return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400";
    case "vencido":
      return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";
    case "obsoleto":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-700/30 dark:text-gray-400";
  }
};

export default function PlanDetails({ plan, onBack, onEdit }: PlanDetailsProps) {
  return (
    <div className="flex-1 bg-card rounded-lg p-6 overflow-y-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="ghost" size="sm" className="text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{plan.NOMBRE}</h1>
            <p className="text-sm text-muted-foreground">
              Plantilla {plan.ID_PLAN} • Al asignar este plan, se incluyen todas las capacitaciones listadas
            </p>
          </div>
        </div>
        <Button onClick={() => onEdit(plan)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Edit className="w-4 h-4 mr-2" />
          Editar Plantilla
        </Button>
      </div>

      {/* General Information */}
      <div className="border border-border rounded-lg p-6 mb-6 bg-card">
        <h2 className="text-lg font-semibold text-foreground mb-4">Información General</h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Tipo</p>
            <span className="px-3 py-1 bg-accent text-accent-foreground rounded text-sm font-medium">{plan.TIPO}</span>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Estado</p>
            <span
              className={`px-3 py-1 rounded text-sm font-medium ${getEstatusSpanVariant(plan.ESTADO.toLowerCase())}`}
            >
              {plan.ESTADO}
            </span>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Fecha de creación</p>
            <p className="text-sm text-foreground font-medium">{plan.FECHA_CREACION}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-1">Descripción</p>
          <p className="text-sm text-foreground">{plan.DESCRIPCION}</p>
        </div>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-2">Departamento Aplicable</p>
          <div className="flex flex-wrap gap-2">
            {plan.DEPARTAMENTO && (
              <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs">
                {plan.DEPARTAMENTO.NOMBRE}
              </span>
            )}
          </div>
        </div>
        {plan.APLICA_TODOS_PUESTOS_DEP ? (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Puestos</p>
            <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-xs">
              Todos los puestos del departamento
            </span>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Puestos Aplicables</p>
            <div className="flex flex-wrap gap-2">
              {plan.PLANES_PUESTOS.map((puesto) => (
                <span key={puesto.ID_PUESTO} className="px-3 py-1 bg-green-700 text-primary-foreground rounded-full text-xs">
                  {puesto.NOMBRE}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Trainings Table */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="bg-muted/50 px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Capacitaciones Predefinidas en esta Plantilla</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Estas capacitaciones se asignarán automáticamente cuando se aplique este plan a un colaborador
            </p>
          </div>
        </div>
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">Codigo</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">Tipo</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">Nombre</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">Estado</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">Version</th>
            </tr>
          </thead>
          <tbody>
            {plan.DOCUMENTOS_PLANES.map((documento) => (
              <tr key={documento.ID_DOCUMENTO} className="border-t border-border hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-foreground">{documento.CODIGO}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm mt-1">{documento.TIPO_DOCUMENTO}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm mt-1">{documento.NOMBRE_DOCUMENTO}</p>
                </td>
                {/* <td className="px-6 py-4 text-sm text-foreground">{training.trainer || "-"}</td> */}
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${getEstatusDocumentoVariant(documento.ESTATUS.toLowerCase())}`}>
                    {documento.ESTATUS}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="text-sm mt-1">{documento.VERSION}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
