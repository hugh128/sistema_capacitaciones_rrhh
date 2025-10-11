import { Badge } from "@/components/ui/badge"
import { Puesto } from "@/lib/types";

export const PUESTO_COLUMNS = [
  { key: "NOMBRE", label: "Nombre" },
  { key: "DESCRIPCION", label: "Descripción" },
  {
    key: "DEPARTAMENTO.NOMBRE",
    label: "Departamento",
  },
  {
    key: "ESTADO",
    label: "Estado",
    render: (value: boolean) => <Badge variant={value ? "default" : "destructive"}>{value ? "Activo" : "Inactivo"}</Badge>,
  },
]

export const PUESTO_FORM_FIELDS = [
  { key: "NOMBRE", label: "Nombre", type: "text" as const, required: true },
  { key: "DESCRIPCION", label: "Descripción", type: "textarea" as const },
  {
    key: "DEPARTAMENTO_ID",
    label: "Departamento",
    type: "select" as const,
    required: true,
    options: [],
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

export const DEFAULT_NEW_DATA: Partial<Puesto> = {
  ESTADO: true,
};
