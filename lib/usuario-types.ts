interface PersonaRelacion {
    ID_PERSONA: number;
    NOMBRE: string;
    APELLIDO: string;
    CORREO: string;
}

export interface UsuarioApi {
    ID_USUARIO: number;
    PERSONA_ID: number;
    USERNAME: string; // Se mapeará a 'email' en el frontend
    PASSWORD?: string; // Solo para POST, no debe venir en GET
    ESTADO: boolean;
    ULTIMO_ACCESO: string | null;
    FECHA_CREACION: string;
    PERSONA: PersonaRelacion;
    ROLES?: any[]; 
}

export interface CreateUsuarioFrontendDto {
    personaId: string; // ID de la persona a asociar
    email: string; // Mapea a USERNAME
    password?: string; // Requerido solo al crear o actualizar contraseña
    estado: 'activo' | 'inactivo';
    rolId: string; // ID del rol seleccionado (solo uno por ahora para simplificar el formulario)
}