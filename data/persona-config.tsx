import { Badge } from "@/components/ui/badge"
import { Persona } from "@/lib/types";

export const PERSONA_COLUMNS = [
  { key: "NOMBRE", label: "Nombre" },
  { key: "APELLIDO", label: "Apellido" },
  { key: "CORREO", label: "Correo" },
  { key: "TELEFONO", label: "Teléfono" },
  { key: "DPI", label: "DPI" },
  { key: "TIPO_PERSONA", label: "Tipo persona" },
  {
    key: "PUESTO.NOMBRE",
    label: "Puesto",
  },
  {
    key: "EMPRESA.NOMBRE",
    label: "Empresa",
  },
  {
    key: "DEPARTAMENTO.NOMBRE",
    label: "Departamento",
  },
  {
    key: "FECHA_NACIMIENTO",
    label: "Fecha Nacimiento"
  },
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
  { key: "NOMBRE", label: "Nombre", type: "text" as const, required: true },
  { key: "APELLIDO", label: "Apellido", type: "text" as const, required: true },
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
