import { Badge } from "@/components/ui/badge"
import { Departamento } from "@/lib/types";

export const DEPARTAMENTO_COLUMNS = [
  { key: "NOMBRE", label: "Nombre" },
  { key: "DESCRIPCION", label: "Descripción" },
  {
    key: "ESTADO",
    label: "Estado",
    render: (value: boolean) => <Badge variant={value ? "default" : "destructive"}>{value ? "Activo" : "Inactivo"}</Badge>,
  },
  {
    key: "FECHA_CREACION",
    label: "Fecha Creacion",
    render: (value: string) => {
      if (!value) return 'Sin fecha';

      const date = new Date(value);

      return date.toLocaleDateString();
    }
  },
]

export const DEPARTAMENTO_FORM_FIELDS = [
  { key: "NOMBRE", label: "Nombre", type: "text" as const, required: true },
  { key: "DESCRIPCION", label: "Descripción", type: "textarea" as const },
/*   {
    key: "empresaId",
    label: "Empresa",
    type: "select" as const,
    required: true,
    options: [],
  }, */
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

export const DEFAULT_NEW_DATA: Partial<Departamento> = {
  ESTADO: true,
};