export interface ResumenGeneral {
  SECCION: string
  Total_Colaboradores_Activos: number
  Planes_Activos: number
  Capacitaciones_Vigentes: number
  Total_Sesiones_Periodo: number
  Sesiones_Finalizadas: number
  Sesiones_Programadas_Futuras: number
  Colaboradores_Capacitados: number
  Horas_Totales_Capacitacion: number
  Diplomas: number
  Promedio_General_Notas: number
}

export interface CumplimientoPorPlan {
  SECCION: string
  Plan: string
  Tipo_Plan: string
  Total_Documentos: number
  Colaboradores_Asignados: number
  Capacitaciones_Completadas: number
  Capacitaciones_Pendientes: number
  Cumplimiento_Promedio_Porcentaje: number
  Planes_Completados: number
  Colaboradores_Completaron_Porcentaje: number
}

export interface CumplimientoPorPrograma {
  SECCION: string
  Programa: string
  Tipo_Programa: string
  Periodo: number
  Total_Capacitaciones: number
  Colaboradores_Asignados: number
  Capacitaciones_Completadas: number
  Capacitaciones_Pendientes: number
  Cumplimiento_Promedio_Porcentaje: number
  Programas_Completados_Porcentaje: number
  Colaboradores_Completaron_Porcentaje: number
}

export interface TopDepartamentos {
  SECCION: string
  Departamento: string
  Total_Capacitaciones: number
  Total_Sesiones: number
  Colaboradores_Capacitados: number
  Total_Participaciones: number
}

export interface TopCapacitaciones {
  SECCION: string
  Capacitación: string
  Sesiones_Impartidas: number
  Colaboradores: number
}

export interface DashboardEjecutivo {
  RESUMEN_GENERAL: ResumenGeneral
  CUMPLIMIENTO_POR_PLAN: CumplimientoPorPlan[]
  CUMPLIMIENTO_POR_PROGRAMA: CumplimientoPorPrograma[]
  TOP_DEPARTAMENTOS: TopDepartamentos[]
  TOP_CAPACITACIONES: TopCapacitaciones[]
}
