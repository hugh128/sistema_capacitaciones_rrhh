"use client"

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { type Persona } from '@/lib/types';
import {
  User,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  Building,
  ClipboardList,
  Clock,
  Fingerprint,
  Globe,
} from "lucide-react"

interface PersonaDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  persona: Persona | null;
}

const parseLocalDate = (dateString: string): Date | null => {
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
};

const formatValue = (key: string, value: unknown): React.ReactNode => {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic">No especificado</span>;
  }

  if (typeof value === 'object' && value !== null && 'NOMBRE' in value && typeof (value as { NOMBRE: unknown }).NOMBRE === 'string') {
    return (value as { NOMBRE: string }).NOMBRE;
  }

  if (key.includes('FECHA')) {
    try {
      if (typeof value === 'string' || typeof value === 'number') {
        const dateStr = String(value);
        const localDate = parseLocalDate(dateStr);
        
        if (localDate) {
          return localDate.toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
        }
        
        return new Date(value).toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
    } catch {
      return String(value);
    }
  }

  if (key === 'ESTADO') {
    const isEstadoActivo = !!value; 
    return (
      <Badge variant={isEstadoActivo ? "default" : "destructive"} className={isEstadoActivo ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-500 hover:bg-red-600"}>
        {isEstadoActivo ? "ACTIVO" : "INACTIVO"}
      </Badge>
    );
  }

  return String(value);
};

interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

const DetailRow: React.FC<DetailRowProps> = ({ icon, label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 py-2 sm:py-1 mb-2 border-b sm:border-b-0 border-border/50 sm:border-0">
    
    <div className="flex items-center gap-2 text-primary dark:text-muted-foreground sm:w-1/3 flex-shrink-0 sm:min-w-[150px]">
      <div className="flex-shrink-0">{icon}</div>
      <p className="text-xs sm:text-sm font-medium sm:font-normal leading-none">
        {label}
      </p>
    </div>

    <div className="flex-1 min-w-0 pl-6 sm:pl-0">
      <div className="font-normal text-sm sm:text-sm text-foreground break-words whitespace-normal leading-snug">
        {value}
      </div>
    </div>
  </div>
);


export function PersonaDetailModal({ open, onOpenChange, persona }: PersonaDetailModalProps) {

  console.log(persona)

  if (!persona) return null;

  const isColaboradorInterno = persona.TIPO_PERSONA === 'INTERNO';
  const fullName = `${persona.NOMBRE || ''} ${persona.APELLIDO || ''}`.trim();
  const initials = (persona.NOMBRE?.[0] || '') + (persona.APELLIDO?.[0] || '');
  const statusBadge = formatValue('ESTADO', persona.ESTADO);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[75vh] overflow-y-auto p-0 sm:p-4">

        <div className="sticky top-0 z-10 bg-background p-4 sm:p-6">
          <DialogHeader>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-primary shadow-lg flex-shrink-0">
                  <AvatarFallback className="text-xl sm:text-2xl font-bold bg-primary text-primary-foreground">
                    {initials || <User className="h-6 w-6 sm:h-8 sm:w-8" />}
                  </AvatarFallback>
                </Avatar>

                <div className="text-center sm:text-left">
                  <DialogTitle className="text-2xl sm:text-3xl font-bold leading-snug text-foreground">
                    {fullName || 'Persona sin nombre'}
                  </DialogTitle>

                  <DialogDescription className="sr-only">
                    Detalles completos de la persona: {fullName}.
                  </DialogDescription>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mt-2">
                    <Badge
                      variant={isColaboradorInterno ? "default" : "outline"}
                      className="text-xs sm:text-sm font-semibold py-1 px-2 sm:px-3"
                    >
                      <Globe className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">
                        {isColaboradorInterno ? 'Colaborador Interno' : 'Persona Externa'}
                      </span>
                      <span className="sm:hidden">
                        {isColaboradorInterno ? 'Interno' : 'Externo'}
                      </span>
                    </Badge>
                    {statusBadge}
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-4 sm:px-6 py-2 space-y-4 sm:space-y-8">

          <section>
            <h3 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-normal text-primary dark:text-foreground mb-3 sm:mb-4 pb-2 border-b-1 border-primary/50">
              <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
              <span className="text-sm sm:text-xl">Datos de Identificación y Contacto</span>
            </h3>

            <div className="-mt-3 space-y-3 sm:space-y-0">
              <DetailRow
                icon={<Fingerprint className="h-4 w-4 sm:h-5 sm:w-5" />}
                label="DPI"
                value={formatValue('DPI', persona.DPI)}
              />
              <DetailRow
                icon={<Mail className="h-4 w-4 sm:h-5 sm:w-5" />}
                label="Correo Electrónico"
                value={formatValue('CORREO', persona.CORREO)}
              />
              <DetailRow
                icon={<Phone className="h-4 w-4 sm:h-5 sm:w-5" />}
                label="Teléfono de Contacto"
                value={formatValue('TELEFONO', persona.TELEFONO)}
              />
              <DetailRow
                icon={<Calendar className="h-4 w-4 sm:h-5 sm:w-5" />}
                label="Fecha de Nacimiento"
                value={formatValue('FECHA_NACIMIENTO', persona.FECHA_NACIMIENTO)}
              />
            </div>
          </section>

          {isColaboradorInterno && (
            <section>
              <h3 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-normal text-primary dark:text-foreground mb-3 sm:mb-4 pb-2 border-b-1 border-primary/50">
                <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                <span className="text-sm sm:text-xl">Información Laboral</span>
              </h3>

              <div className="-mt-3 space-y-3 sm:space-y-0">
                <DetailRow
                  icon={<Building className="h-4 w-4 sm:h-5 sm:w-5" />}
                  label="Empresa"
                  value={formatValue('EMPRESA', persona.EMPRESA)}
                />
                <DetailRow
                  icon={<Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />}
                  label="Puesto / Cargo"
                  value={formatValue('PUESTO', persona.PUESTO)}
                />
                <DetailRow
                  icon={<User className="h-4 w-4 sm:h-5 sm:w-5" />}
                  label="Departamento"
                  value={formatValue('DEPARTAMENTO', persona.DEPARTAMENTO)}
                />
                <DetailRow
                  icon={<Clock className="h-4 w-4 sm:h-5 sm:w-5" />}
                  label="Fecha de Ingreso"
                  value={formatValue('FECHA_INGRESO', persona.FECHA_INGRESO)}
                />
              </div>
            </section>
          )}

        </div>

        <div className="sticky bottom-0 z-10 bg-background p-4 flex justify-end border-t">
          <Button onClick={() => onOpenChange(false)} className="cursor-pointer w-full sm:w-auto">
            Cerrar Detalle
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
