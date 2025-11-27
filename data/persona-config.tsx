import { Badge } from "@/components/ui/badge"
import { Persona } from "@/lib/types";

export const PERSONA_COLUMNS = [
  { key: "NOMBRE", label: "Nombres" },
  { key: "APELLIDO", label: "Apellidos" },
  /* { key: "CORREO", label: "Correo" }, */
/*   { key: "TELEFONO", label: "Teléfono" },
  { key: "DPI", label: "DPI" }, */
  {
    key: "TIPO_PERSONA",
    label: "Tipo persona",
    render: (value: string) => (
      <Badge
        className={
          value === 'INTERNO'
            ? 'bg-blue-100 text-blue-700 dark:bg-transparent dark:border-2 dark:text-foreground dark:border-primary'
            : 'bg-green-100 text-green-700 dark:bg-transparent dark:border-2 dark:text-foreground dark:border-green-800'
        }
      >
        {value === 'INTERNO' ? 'Colaborador' : 'Persona Externa'}
      </Badge>
    ),
  },
  {
    key: "PUESTO.NOMBRE",
    label: "Puesto",
  },
  {
    key: "DEPARTAMENTO.NOMBRE",
    label: "Departamento",
  },
  {
    key: "EMPRESA.NOMBRE",
    label: "Empresa",
  },
/*   {
    key: "FECHA_NACIMIENTO",
    label: "Fecha Nacimiento"
  }, */
  {
    key: "FECHA_INGRESO",
    label: "Fecha Ingreso"
  },
  {
    key: "ESTADO",
    label: "Estado",
    render: (value: boolean) => <Badge variant={value ? "default" : "destructive"}>{value ? "Activo" : "Inactivo"}</Badge>,
  },
]

export const PERSONA_FORM_FIELDS = [
  { key: "NOMBRE", label: "Nombres", type: "text" as const, required: true },
  { key: "APELLIDO", label: "Apellidos", type: "text" as const, required: true },
  { key: "CORREO", label: "Correo", type: "email" as const, required: true },
  { key: "TELEFONO", label: "Teléfono", type: "tel" as const },
  { key: "DPI", label: "DPI", type: "text" as const },
  {
    key: "TIPO_PERSONA",
    label: "Tipo Persona",
    type: "select" as const,
    required: true,
    options: [
      { value: "INTERNO", label: "Interno" },
      { value: "EXTERNO", label: "Externo" },
    ],
    placeholder: "Tipo de persona"
  },
  {
    key: "EMPRESA_ID",
    label: "Empresa",
    type: "select" as const,
    required: true,
    options: [],
    placeholder: "Empresa"
  },
  {
    key: "DEPARTAMENTO_ID",
    label: "Departamento",
    type: "select" as const,
    required: true,
    options: [],
    placeholder: "Departamento"
  },
  {
    key: "PUESTO_ID",
    label: "Puesto",
    type: "select" as const,
    required: true,
    options: [],
    placeholder: "Puesto"
  },
  {
    key: "FECHA_NACIMIENTO",
    label: "Fecha de Nacimiento",
    type: "date" as const,
  },
  {
    key: "FECHA_INGRESO",
    label: "Fecha de Ingreso",
    type: "date" as const,
  },
  {
    key: "ESTADO",
    label: "Estado",
    type: "select" as const,
    required: true,
    options: [
      { value: "true", label: "Activo" },
      { value: "false", label: "Inactivo" },
    ],
  },
]

export const DEFAULT_NEW_DATA: Partial<Persona> = {
  ESTADO: true,
};
