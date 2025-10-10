import { type Persona } from "@/lib/types";

interface PersonaApi {
    ID_PERSONA: number;
    NOMBRE: string;
    APELLIDO: string;
    CORREO: string;
    TELEFONO: string | null;
    DPI: string | null;
    FECHA_NACIMIENTO: string | null;
    TIPO_PERSONA: string;
    FECHA_INGRESO: string | null;
    EMPRESA_ID: number | null; 
    DEPARTAMENTO_ID: number | null;
    PUESTO_ID: number | null;
    ESTADO: boolean;
    EMPRESA: { NOMBRE: string } | null; 
    DEPARTAMENTO: { NOMBRE: string } | null;
    PUESTO: { NOMBRE: string } | null;
}

export const transformApiToFrontend = (apiData: PersonaApi): Persona => {
    
    const safeIdToString = (id: number | null | undefined): string | undefined => {
        if (id !== null && id !== undefined) {
            return id.toString();
        }
        return undefined;
    }

    const safeDate = (date: string | null | undefined): string | undefined => {
        if (date) {
            return date.split('T')[0];
        }
        return undefined;
    }
    
    return {
        id: apiData.ID_PERSONA.toString(),
        nombre: apiData.NOMBRE,
        apellido: apiData.APELLIDO,
        correo: apiData.CORREO,
        telefono: apiData.TELEFONO || undefined,
        dpi: apiData.DPI || undefined,
        
        fechaNacimiento: safeDate(apiData.FECHA_NACIMIENTO),
        fechaIngreso: safeDate(apiData.FECHA_INGRESO),
        
        tipoPersona: apiData.TIPO_PERSONA as Persona['tipoPersona'],
        estado: apiData.ESTADO ? "activo" : "inactivo",
        
        empresaId: safeIdToString(apiData.EMPRESA_ID),
        departamentoId: safeIdToString(apiData.DEPARTAMENTO_ID),
        puestoId: safeIdToString(apiData.PUESTO_ID),
        
        nombreDepartamento: apiData.DEPARTAMENTO?.NOMBRE || 'N/A',
        nombrePuesto: apiData.PUESTO?.NOMBRE || 'N/A',
    };
};

export const transformFrontendToApi = (frontendData: Partial<Persona>) => {
    
    const apiData: any = {
        NOMBRE: frontendData.nombre,
        APELLIDO: frontendData.apellido,
        CORREO: frontendData.correo,
        TELEFONO: frontendData.telefono,
        DPI: frontendData.dpi,
        FECHA_NACIMIENTO: frontendData.fechaNacimiento,
        TIPO_PERSONA: frontendData.tipoPersona,
        FECHA_INGRESO: frontendData.fechaIngreso,
        
        ESTADO: frontendData.estado === 'activo',

        EMPRESA_ID: frontendData.empresaId ? parseInt(frontendData.empresaId, 10) : undefined,
        DEPARTAMENTO_ID: frontendData.departamentoId ? parseInt(frontendData.departamentoId, 10) : undefined,
        PUESTO_ID: frontendData.puestoId ? parseInt(frontendData.puestoId, 10) : undefined,
    };
    
    return Object.fromEntries(
        Object.entries(apiData).filter(([, value]) => value !== undefined && value !== null)
    );
};