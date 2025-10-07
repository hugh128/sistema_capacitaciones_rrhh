import { type Departamento } from "@/lib/types";

interface DepartamentoApi {
    ID_DEPARTAMENTO: number;
    NOMBRE: string;
    DESCRIPCION: string;
    ESTADO: boolean;
    FECHA_CREACION: string;
}

export const transformApiToFrontend = (apiData: DepartamentoApi): Departamento => {
    return {
        id: apiData.ID_DEPARTAMENTO.toString(),
        nombre: apiData.NOMBRE,
        descripcion: apiData.DESCRIPCION,
        
        estado: apiData.ESTADO ? "activo" : "inactivo", 
        
        fechaCreacion: apiData.FECHA_CREACION ? apiData.FECHA_CREACION.split('T')[0] : 'N/A', 
        
        empresaId: 'MOCK'
    };
};

export const transformFrontendToApi = (frontendData: Partial<Departamento>) => {
    
    const apiData = {
        nombre: frontendData.nombre,
        descripcion: frontendData.descripcion,
        
        estado: frontendData.estado === 'activo', 
    };
    
    return Object.fromEntries(
        Object.entries(apiData).filter(([, value]) => value !== undefined && value !== null)
    );
};