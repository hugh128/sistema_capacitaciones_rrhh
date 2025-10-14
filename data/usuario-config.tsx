import { Badge } from "@/components/ui/badge"
import type { Persona, Usuario } from "@/lib/types"
import type { Rol } from "@/lib/auth";

export interface FormFieldConfig {
    key: string;
    label: string;
    type: 'text' | 'password' | 'select' | 'email' | 'multiselect-checkboxes';
    required: boolean;
    options?: { value: string; label: string }[];
    disabled?: boolean;
    autocomplete?: string;
}

export interface UsuarioFormFields {
    PERSONA_ID: string;
    USERNAME: string;
    PASSWORD?: string;
    ID_ROLES: string[];
    ESTADO: "true" | "false";
}

export const getUsuarioColumns = () => [
    { key: "PERSONA.NOMBRE", label: "Nombre" },
    { key: "PERSONA.APELLIDO", label: "Apellido" },
    { key: "USERNAME", label: "Username" },
    {
      key: "USUARIO_ROLES",
      label: "Roles",
      render: (roles: Rol[] | undefined) => (
        <div className="flex gap-1 flex-wrap">
          {roles?.map((role: Rol) => (
            <Badge key={role.ID_ROL} variant="outline" className="text-xs">
              {role.NOMBRE}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "ESTADO",
      label: "Estado",
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "destructive"}>{value ? "Activo" : "Inactivo"}</Badge>
      ),
    },
    {
      key: "ULTIMO_ACCESO",
      label: "Último Acceso",
      render: (value: string | null) => {
        if (!value) return "Nunca"
        return new Date(value).toLocaleDateString()
      },
    },
    {
      key: "FECHA_CREACION",
      label: "Fecha Creación",
      render: (value: string | null) => {
        if (!value) return "Nunca"
        return new Date(value).toLocaleDateString()
      },
    },
];

export const getUsuarioFormFields = (
    personasList: Persona[], 
    rolesList: Rol[], 
    isEditing: boolean
): FormFieldConfig[] => {

    const baseFields: FormFieldConfig[] = [
        {
            key: "PERSONA_ID", 
            label: "Persona",
            type: "select",
            required: true,
            options: personasList.map((p) => ({ 
                value: p.ID_PERSONA.toString(),
                label: `${p.NOMBRE} ${p.APELLIDO}` 
            })),
            disabled: isEditing,
        },
        { key: "USERNAME", label: "Username", type: "text", required: true, autocomplete: "username" },
        {
            key: "ID_ROLES", 
            label: "Roles",
            type: "multiselect-checkboxes", 
            required: true,
            options: rolesList.map((r) => ({ 
                value: r.ID_ROL.toString(),
                label: r.NOMBRE 
            })),
        },
        {
            key: "ESTADO", 
            label: "Estado",
            type: "select",
            required: true,
            options: [
                { value: "true", label: "Activo" },
                { value: "false", label: "Inactivo" },
            ],
        },
    ];

    const passwordField: FormFieldConfig = {
        key: "PASSWORD", 
        label: "Password", 
        type: "password", 
        required: !isEditing, 
        autocomplete: isEditing ? "new-password" : "new-password",
    };
    
    if (isEditing) {
        return baseFields;
    }

    return [
        baseFields[0], 
        baseFields[1],
        passwordField, 
        baseFields[2],
        baseFields[3],
    ];
};
