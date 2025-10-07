import { type Empresa } from "@/lib/types";

interface EmpresaApi {
    ID_EMPRESA: number;
    NOMBRE: string;
    DIRECCION: string;
    NIT: string;
    TELEFONO: string;
    CORREO: string;
    ESTADO: boolean;
    FECHA_CREACION: string;
    DESCRIPCION?: string; 
}

export const transformApiToFrontend = (apiData: EmpresaApi): Empresa => {
    return {
        id: apiData.ID_EMPRESA.toString(),
        nombre: apiData.NOMBRE,
        direccion: apiData.DIRECCION,
        nit: apiData.NIT,
        telefono: apiData.TELEFONO,
        email: apiData.CORREO,
        
        estado: apiData.ESTADO ? "activa" : "inactiva", 
        
        fechaCreacion: apiData.FECHA_CREACION ? apiData.FECHA_CREACION.split('T')[0] : 'N/A', 
        
        descripcion: apiData.DESCRIPCION || "", 
    };
};

export const transformFrontendToApi = (frontendData: Partial<Empresa>) => {
    
    const apiData = {
        nombre: frontendData.nombre,
        direccion: frontendData.direccion,
        nit: frontendData.nit,
        telefono: frontendData.telefono,
        correo: frontendData.email,
        
        estado: frontendData.estado === 'activa', 
    };
    
    return Object.fromEntries(
        Object.entries(apiData).filter(([, value]) => value !== undefined && value !== null)
    );
};
