import { Badge } from "@/components/ui/badge"
import { Empresa } from "@/lib/types"

export const EMPRESA_COLUMNS = [
  { key: "NOMBRE", label: "Nombre" },
  { key: "DIRECCION", label: "Direccion" },
  { key: "NIT", label: "Nit" },
  { key: "TELEFONO", label: "Teléfono" },
  { key: "CORREO", label: "Email" },
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
];

export const EMPRESA_FORM_FIELDS = [
  { key: "NOMBRE", label: "Nombre", type: "text" as const, required: true },
  { key: "DIRECCION", label: "Dirección", type: "text" as const },
  { key: "NIT", label: "Nit", type: "text" as const, required: true },
  { key: "TELEFONO", label: "Telefono", type: "tel" as const },
  { key: "CORREO", label: "Email", type: "email" as const },
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
];

export const DEFAULT_NEW_EMPRESA_DATA: Partial<Empresa> = {
  ESTADO: true,
};