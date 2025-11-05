export interface DashboardResponse {
    ESTADISTICAS: Estadisticas;
    CAPACITACIONES_RECIENTES: CapacitacionReciente[];
    ACTIVIDADES_PROXIMAS: ActividadProxima[];
}

// -------------------------------------------------------------
// I. ESTADÍSTICAS
// -------------------------------------------------------------

export interface Estadisticas {
    totalCapacitaciones: number;
    capacitacionesActivas: number;
    totalParticipantes: number;
    participantesActivos: number;
    planesCompletados: number;
    totalPlanes: number;
    cumplimientoPromedio: number;
    proximasCapacitaciones: number;
    colaboradoresSinSesion: number;
    necesitanReprogramacion: number;
    sesionesEnRevision: number;
    capacitacionesFinalizadasMesActual: number;
    totalProgramas: number;
    colaboradoresEnProgramas: number;
}

// -------------------------------------------------------------
// II. CAPACITACIONES RECIENTES
// -------------------------------------------------------------

export interface CapacitacionReciente {
    ID_CAPACITACION: number;
    nombre: string;
    participantes: number;
    progreso: number;
    estado: 'Iniciando' | 'En progreso' | 'Finalizada' | string;
    colaboradoresSinSesion: number;
    necesitanReprogramacion: number;
    totalSesiones: number;
    sesionesFinalizadas: number;
    fechaActualizacion: string | null;
}

// -------------------------------------------------------------
// III. ACTIVIDADES PRÓXIMAS
// -------------------------------------------------------------

export interface ActividadProxima {
    ID_SESION: number;
    ID_CAPACITACION: number;
    nombre: string; // Nombre de la capacitación
    nombreSesion: string;
    fechaTexto: string; // "Mañana", "Viernes"
    horaTexto: string; // "2:00 PM"
    fechaHora: string; // "Mañana, 2:00 PM"
    participantes: number;
    ubicacion: string;
    tipo: 'CURSO' | 'PROGRAMA' | string;
    estado: 'EN_PROCESO' | 'PROGRAMADA' | string;
    capacitador: string;
    diasRestantes: number;
    esUrgente: 0 | 1; // Booleano representado como número
    progresoRegistro: number;
    fechaRaw: string; // Fecha y hora completa en formato ISO
    horaRaw: string; // Hora con fecha de 1970
    duracionMinutos: number;
    duracionTexto: string; // "1h 30min"
    modalidad: 'INTERNA' | 'EXTERNA' | string;
    aplicaExamen: boolean;
    aplicaDiploma: boolean;
}
