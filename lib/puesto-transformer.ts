import { type Puesto } from "@/lib/types";

interface DepartamentoApi {
    ID_DEPARTAMENTO: number;
    NOMBRE: string;
}

interface PuestoApi {
    ID_PUESTO: number;
    NOMBRE: string;
    DESCRIPCION: string;
    ESTADO: boolean;
    DEPARTAMENTO_ID: number;
    FECHA_CREACION: string;
    departamento?: DepartamentoApi; 
}

export const transformApiToFrontend = (apiData: PuestoApi): Puesto => {
    return {
        id: apiData.ID_PUESTO.toString(),
        nombre: apiData.NOMBRE,
        descripcion: apiData.DESCRIPCION,
        
        estado: apiData.ESTADO ? "activo" : "inactivo",
        
        departamentoId: apiData.DEPARTAMENTO_ID.toString(), 
        
        nombreDepartamento: apiData.departamento?.NOMBRE || 'Desconocido',

        requiereCapacitacion: false, // Valor por defecto, si es necesario.
        
        fechaCreacion: apiData.FECHA_CREACION ? apiData.FECHA_CREACION.split('T')[0] : 'N/A',
        
        nivel: 'operativo', 
    };
};

export const transformFrontendToApi = (frontendData: Partial<Puesto>) => {
    
    const departamentoId = frontendData.departamentoId ? parseInt(frontendData.departamentoId, 10) : undefined;
    
    const apiData = {
        nombre: frontendData.nombre,
        descripcion: frontendData.descripcion,
        estado: frontendData.estado === 'activo',
        departamentoId: departamentoId, 
    };
    
    return Object.fromEntries(
        Object.entries(apiData).filter(([, value]) => value !== undefined && value !== null)
    );
};

export const transformApiDepartamentoToSelect = (apiData: DepartamentoApi) => {
    return {
        id: apiData.ID_DEPARTAMENTO.toString(),
        nombre: apiData.NOMBRE,
    }
}