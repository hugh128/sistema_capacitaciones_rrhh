"use client"

import { memo, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { BookOpen } from "lucide-react"
import { Combobox, ComboboxCreable } from "@/components/ui/combobox"
import type { ProgramaCapacitacion, CapacitadorLms } from "@/lib/capacitaciones/capacitacion-lms.types"

const CATEGORIAS_BASE = [
  "ACON","ASR","BOD","CC","CCFQ","CCMIC","COM","DG","GC",
  "I&D","IMP","MANT","OP","PROD","PRODLIQ","PRODSEM",
  "PRODSOL","RRHH","SSO","VAL","OTROS",
]

interface Props {
  programas: ProgramaCapacitacion[]
  capacitadores: CapacitadorLms[]

  nombre: string
  setNombre: (v: string) => void
  categoriaCapacitacion: string
  setCategoriaCapacitacion: (v: string) => void
  tipoCapacitacion: string
  setTipoCapacitacion: (v: string) => void
  modalidad: string
  setModalidad: (v: string) => void
  fechaProgramada: string
  setFechaProgramada: (v: string) => void
  categoriaSesion: string
  setCategoriaSesion: (v: string) => void
  aplicaExamen: boolean
  setAplicaExamen: (v: boolean) => void
  notaMinima: string
  setNotaMinima: (v: string) => void

  programaId: number | null
  setProgramaId: (v: number | null) => void
  capacitadorId: number | null
  setCapacitadorId: (v: number | null) => void
}

export const FormularioInfoCapacitacion = memo(function FormularioInfoCapacitacion({
  programas,
  capacitadores,
  nombre, setNombre,
  categoriaCapacitacion, setCategoriaCapacitacion,
  tipoCapacitacion, setTipoCapacitacion,
  modalidad, setModalidad,
  fechaProgramada, setFechaProgramada,
  categoriaSesion, setCategoriaSesion,
  aplicaExamen, setAplicaExamen, setNotaMinima,
  programaId, setProgramaId,
  capacitadorId, setCapacitadorId,
}: Props) {

  const opcionesProgramas = useMemo(() =>
    programas.map((p) => ({
      value: String(p.ID_PROGRAMA),
      label: p.NOMBRE,
      sublabel: `${p.TIPO} · ${p.PERIODO}`,
    })),
    [programas]
  )

  const opcionesCapacitadores = useMemo(() =>
    capacitadores.map((c) => ({
      value: String(c.PERSONA_ID),
      label: `${c.NOMBRE} ${c.APELLIDO}`,
      sublabel: c.CORREO,
    })),
    [capacitadores]
  )

  const opcionesCategorias = useMemo(() =>
    CATEGORIAS_BASE.map((cat) => ({ value: cat, label: cat })),
    []
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/40">
            <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-base">Información de la Capacitación</CardTitle>
            <CardDescription className="text-sm">Datos generales del registro</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">

        {/* ── Nombre ─────────────────────────────────────────────── */}
        <div className="space-y-2">
          <Label htmlFor="nombre">
            Nombre de la capacitación <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: CCMIC-PEO-085_V-002_25-02-2026"
          />
        </div>

        {/* ── Programa ────────────────────────────────────────────── */}
        <div className="space-y-2">
          <Label>
            Programa de capacitación <span className="text-red-500">*</span>
          </Label>
          <Combobox
            options={opcionesProgramas}
            value={programaId ? String(programaId) : ""}
            onValueChange={(v) => setProgramaId(v ? Number(v) : null)}
            placeholder="Seleccionar programa..."
            searchPlaceholder="Buscar programa por nombre..."
            emptyText="No se encontraron programas."
            className="cursor-pointer"
          />
        </div>

        {/* ── Capacitador ─────────────────────────────────────────── */}
        <div className="space-y-2">
          <Label>
            Capacitador <span className="text-red-500">*</span>
          </Label>
          <Combobox
            options={opcionesCapacitadores}
            value={capacitadorId ? String(capacitadorId) : ""}
            onValueChange={(v) => setCapacitadorId(v ? Number(v) : null)}
            placeholder="Seleccionar capacitador..."
            searchPlaceholder="Buscar por nombre o correo..."
            emptyText="No se encontraron capacitadores."
            className="cursor-pointer"
          />
        </div>

        {/* ── Fila: categoría capacitación + tipo ─────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>
              Categoría capacitación <span className="text-red-500">*</span>
            </Label>
            <Select value={categoriaCapacitacion} onValueChange={setCategoriaCapacitacion}>
              <SelectTrigger className="w-full cursor-pointer">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GENERAL">GENERAL</SelectItem>
                <SelectItem value="ESPECIFICA">ESPECÍFICA</SelectItem>
                <SelectItem value="CONTINUA">CONTINUA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Tipo de capacitación <span className="text-red-500">*</span>
            </Label>
            <Select value={tipoCapacitacion} onValueChange={setTipoCapacitacion}>
              <SelectTrigger className="w-full cursor-pointer">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INTERNA">INTERNA</SelectItem>
                <SelectItem value="EXTERNA">EXTERNA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ── Modalidad ──────────────────────────────────────────── */}
          <div className="space-y-2">
            <Label>
              Modalidad <span className="text-red-500">*</span>
            </Label>
            <Select value={modalidad} onValueChange={setModalidad}>
              <SelectTrigger className="w-full cursor-pointer">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INTERNA">INTERNA</SelectItem>
                <SelectItem value="EXTERNA">EXTERNA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ── Categoría sesión ───────────────────────────────────── */}
          <div className="space-y-2">
            <Label>
              Categoría sesión <span className="text-red-500">*</span>
            </Label>
            <ComboboxCreable
              options={opcionesCategorias}
              value={categoriaSesion}
              onValueChange={setCategoriaSesion}
              placeholder="Seleccionar o escribir..."
              searchPlaceholder="Buscar o escribir categoría..."
              crearLabel={(v) => `Usar "${v}"`}
              className="cursor-pointer"
            />
            {categoriaSesion && !CATEGORIAS_BASE.includes(categoriaSesion) && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Categoría personalizada: <strong>{categoriaSesion}</strong>
              </p>
            )}
          </div>

          {/* ── Fecha ──────────────────────────────────────────────── */}
          <div className="space-y-2 dark-mode-date-fix sm:col-span-2 md:col-span-1">
            <Label htmlFor="fecha">
              Fecha programada <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fecha"
              type="date"
              value={fechaProgramada}
              onChange={(e) => setFechaProgramada(e.target.value)}
            />
          </div>
        </div>

        {/* ── Aplica examen ───────────────────────────────────────── */}
        <div className="pt-2 border-t space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="aplicaExamen"
              checked={aplicaExamen}
              onCheckedChange={(checked) => {
                setAplicaExamen(checked as boolean)
                if (!checked) setNotaMinima("")
              }}
              className="dark:border dark:border-gray-600 data-[state=checked]:dark:border-transparent cursor-pointer"
            />
            <Label htmlFor="aplicaExamen" className="cursor-pointer">
              Aplica Examen
            </Label>
          </div>

{/*           {aplicaExamen && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="notaMinima">Nota mínima (0–100)</Label>
              <Input
                id="notaMinima"
                type="number"
                min={0}
                max={100}
                value={notaMinima}
                onChange={(e) => setNotaMinima(e.target.value)}
                placeholder="70"
                className="w-32"
              />
            </div>
          )} */}
        </div>

      </CardContent>
    </Card>
  )
})
