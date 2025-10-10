import { type Usuario, type Role } from "@/lib/types";
import { type UsuarioApi, type CreateUsuarioFrontendDto } from "@/lib/usuario-types";

const MOCK_ROLES: Role[] = [
    { id: "1", nombre: "RRHH", estado: "activo", descripcion: "Recursos Humanos" },
    { id: "2", nombre: "Administrador", estado: "activo", descripcion: "Administrador del Sistema" },
    { id: "3", nombre: "Usuario", estado: "activo", descripcion: "Usuario estandar" },
];

export const transformApiToFrontend = (apiData: UsuarioApi): Usuario => {
    
    const mockRole: Role = MOCK_ROLES.find(r => r.nombre === 'Usuario') || MOCK_ROLES[0]; 

    return {
        id: apiData.ID_USUARIO.toString(),
        personaId: apiData.PERSONA_ID.toString(),
        email: apiData.USERNAME,
        estado: apiData.ESTADO ? "activo" : "inactivo",
        nombreCompletoPersona: `${apiData.PERSONA.NOMBRE} ${apiData.PERSONA.APELLIDO}`,
        
        ultimoAcceso: apiData.ULTIMO_ACCESO ? new Date(apiData.ULTIMO_ACCESO).toISOString() : undefined,
        fechaCreacion: new Date(apiData.FECHA_CREACION).toISOString().split('T')[0],

        roles: [mockRole],
    };
};

export const transformFrontendToApi = (frontendData: Partial<CreateUsuarioFrontendDto>) => {
    
    const apiData: any = {
        PERSONA_ID: frontendData.personaId ? parseInt(frontendData.personaId, 10) : undefined,
        USERNAME: frontendData.email,
        PASSWORD: frontendData.password, // Solo si es POST o para endpoint de password
        ESTADO: frontendData.estado === 'activo', // Conversión a boolean
    };

    return Object.fromEntries(
        Object.entries(apiData).filter(([, value]) => value !== undefined && value !== null)
    );
};
