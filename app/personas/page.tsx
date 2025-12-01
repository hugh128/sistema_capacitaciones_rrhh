"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { type FormData as FormValues } from "@/components/form-modal"
import { PersonaFormModal } from "@/components/persona-form-modal"
import { type Persona, Departamento, Empresa, Puesto } from "@/lib/types"
import type { CambiarPlanResponse, AnalizarCambioPlanResponse } from "@/lib/planes_programas/types"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { AppHeader } from "@/components/app-header"
import { usePersonas } from "@/hooks/usePersonas"
import { Toaster, toast } from 'react-hot-toast'
import { PERSONA_FORM_FIELDS, PERSONA_COLUMNS, DEFAULT_NEW_DATA } from "@/data/persona-config"
import { PersonaDataTable } from "@/components/persona-data-table"
import { PersonaDetailModal } from "@/components/persona-detail-modal"
import { RequirePermission } from "@/components/RequirePermission"
import { usePlanesCapacitacion } from "@/hooks/usePlanesCapacitacion"
import { CambioPlanModal } from "@/components/planes_programas/cambio-plan"

const getDepartamentosList = async () => {
  try {
    const { data } = await apiClient.get<Departamento[]>('/departamento');
    return data;
  } catch (err) {
    console.error("Error al cargar lista de departamentos para select:", err);
    return [];
  }
}

const getEmpresasList = async () => {
  try {
    const { data } = await apiClient.get<Empresa[]>('/empresa');
    return data;
  } catch (err) {
    console.error("Error al cargar lista de empresas para select:", err);
    return [];
  }
}

const getPuestosList = async () => {
  try {
    const { data } = await apiClient.get<Puesto[]>('/puesto');
    return data;
  } catch (err) {
    console.error("Error al cargar lista de puestos para select:", err);
    return [];
  }
}

interface Option {
  value: string;
  label: string;
}

const mapToOptions = <T extends { NOMBRE: string }>(
  list: T[], 
  idKey: keyof T
): Option[] => {
  return list.map(item => ({
    label: item.NOMBRE, 
    value: (item[idKey] as { toString: () => string }).toString(), 
  }));
};

export default function PersonasPage() {
  const { user } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [cambioPlanModalOpen, setCambioPlanModalOpen] = useState(false)
  const [viewingPersona, setViewingPersona] = useState<Persona | null>(null)
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null)
  const [empresasList, setEmpresasList] = useState<Empresa[]>([])
  const [departamentosList, setDepartamentosList] = useState<Departamento[]>([])
  const [puestosList, setPuestosList] = useState<Puesto[]>([])
  const [pendingFormData, setPendingFormData] = useState<FormValues | null>(null)
  const [verificacionPlan, setVerificacionPlan] = useState<CambiarPlanResponse | null>(null)

  const {
    personas,
    isMutating,
    deletePersona,
    savePersona,
    fetchPersonas
  } = usePersonas(user)

  const {
    analizarCambioPlan,
    verificarCambioPlan,
    cambiarPlanColaborador,
  } = usePlanesCapacitacion(user)

  useEffect(() => {
    if (user) {
      getEmpresasList().then(setEmpresasList);
      getDepartamentosList().then(setDepartamentosList);
      getPuestosList().then(setPuestosList);
    }
  }, [user]);

  const empresasOptions = mapToOptions(empresasList, 'ID_EMPRESA');
  const departamentosOptions = mapToOptions(departamentosList, 'ID_DEPARTAMENTO');
  const puestosOptions = mapToOptions(puestosList, 'ID_PUESTO');
  
  const optionMap = {
    'EMPRESA_ID': empresasOptions,
    'DEPARTAMENTO_ID': departamentosOptions,
    'PUESTO_ID': puestosOptions,
  };

  const formFields = PERSONA_FORM_FIELDS.map(field => {
    const keyToLookup = field.key as keyof typeof optionMap; 
    const optionsToInject = optionMap[keyToLookup];
    
    if (optionsToInject) {
      return { ...field, options: optionsToInject };
    }
    
    return field;
  });

  const handleAdd = () => {
    setEditingPersona(null)
    setModalOpen(true)
  }

  const handleEdit = (persona: Persona) => {
    setEditingPersona(persona)
    setModalOpen(true)
  }

  const handleViewDetail = (persona: Persona) => {
    setViewingPersona(persona);
    setDetailModalOpen(true);
  }

  const handleDelete = async (persona: Persona) => {
    await deletePersona(persona)
  }

  const handleSubmit = async (formData: FormValues) => {
    const isInterno = formData.TIPO_PERSONA === 'INTERNO'
    const isEditing = !!editingPersona
    const eraInternoAntes = editingPersona?.TIPO_PERSONA === 'INTERNO'
    
    if (isInterno && isEditing && editingPersona && eraInternoAntes) {
      const departamentoChanged = 
        formData.DEPARTAMENTO_ID && 
        Number(formData.DEPARTAMENTO_ID) !== editingPersona.DEPARTAMENTO_ID
      
      const puestoChanged = 
        formData.PUESTO_ID && 
        Number(formData.PUESTO_ID) !== editingPersona.PUESTO_ID
      
      if (departamentoChanged || puestoChanged) {
        setPendingFormData(formData)
        
        try {
          const verificacion = await verificarCambioPlan({
            ID_COLABORADOR: editingPersona.ID_PERSONA,
            NUEVO_DEPARTAMENTO_ID: Number(formData.DEPARTAMENTO_ID),
            NUEVO_PUESTO_ID: Number(formData.PUESTO_ID),
          })
          
          if (verificacion) {
            setVerificacionPlan(verificacion)
            
            if (verificacion.REQUIERE_CAMBIO_PLAN && verificacion.PLAN_NUEVO_ID) {
              setCambioPlanModalOpen(true)
            } else {
              await finalizarGuardado(formData)
            }
          }
        } catch (error) {
          console.error('Error al verificar cambio de plan:', error)
          toast.error('Error al verificar el cambio de plan')
        }
        
        return
      }
    }
    
    await finalizarGuardado(formData)
  }

  const finalizarGuardado = async (formData: FormValues) => {
    const success = await savePersona(formData, editingPersona)
    
    if (success) {
      setModalOpen(false)
      
      setTimeout(() => {
        setPendingFormData(null)
        setVerificacionPlan(null)
        setEditingPersona(null)
      }, 100)
    }
  }

  const handleAnalizarCambioPlan = async (): Promise<AnalizarCambioPlanResponse | null> => {
    if (!verificacionPlan || !editingPersona) return null
    
    try {
      const analisis = await analizarCambioPlan({
        ID_COLABORADOR: editingPersona.ID_PERSONA,
        NUEVO_DEPARTAMENTO_ID: verificacionPlan.NUEVO_DEPARTAMENTO_ID,
        NUEVO_PUESTO_ID: verificacionPlan.NUEVO_PUESTO_ID,
      })
      
      return analisis
    } catch (error) {
      console.error('Error al analizar cambio de plan:', error)
      toast.error('Error al analizar el cambio de plan')
      return null
    }
  }

  const handleConfirmarCambioPlan = async (capacitacionesSeleccionadas: number[]): Promise<boolean> => {
    if (!verificacionPlan || !editingPersona || !pendingFormData || !user) return false
    
    try {
      const resultado = await cambiarPlanColaborador({
        ID_COLABORADOR: editingPersona.ID_PERSONA,
        NUEVO_DEPARTAMENTO_ID: verificacionPlan.NUEVO_DEPARTAMENTO_ID,
        NUEVO_PUESTO_ID: verificacionPlan.NUEVO_PUESTO_ID,
        IDS_CAPACITACIONES_MIGRAR: capacitacionesSeleccionadas,
        USUARIO: user.USERNAME
      })
      
      if (!resultado) {
        toast.error('Error al realizar el cambio de plan')
        return false
      }
      
      const hayOtrosCambios = Object.keys(pendingFormData).some(key => {
        if (key === 'ID_PERSONA' || key === 'TIPO_PERSONA' || key === 'DEPARTAMENTO_ID' || key === 'PUESTO_ID') return false
        return pendingFormData[key] !== (editingPersona as Persona)[key as keyof Persona]
      })
      
      if (hayOtrosCambios) {
        const datosActualizados = {
          ...pendingFormData,
          ID_PERSONA: editingPersona.ID_PERSONA,
          DEPARTAMENTO_ID: verificacionPlan.NUEVO_DEPARTAMENTO_ID,
          PUESTO_ID: verificacionPlan.NUEVO_PUESTO_ID,
          TIPO_PERSONA: 'INTERNO'
        }
        
        const saveSuccess = await savePersona(datosActualizados as FormValues, editingPersona)
        
        if (!saveSuccess) {
          toast.error('Plan cambiado exitosamente, pero hubo un error al actualizar otros campos')
        }
      }
      
      toast.success(
        `Cambio de plan realizado exitosamente. ${resultado.CapacitacionesMigradas} capacitaciones migradas.`
      )
      
      await fetchPersonas()
      
      setCambioPlanModalOpen(false)
      setModalOpen(false)
      
      setTimeout(() => {
        setPendingFormData(null)
        setVerificacionPlan(null)
        setEditingPersona(null)
      }, 100)
      
      return true
    } catch (error) {
      console.error('Error al cambiar plan:', error)
      toast.error('Error al realizar el cambio de plan. No se realizaron cambios.')
      return false
    }
  }

  const handleGuardarSinCambioPlan = async () => {
    if (!pendingFormData) return
    
    setCambioPlanModalOpen(false)
    
    await finalizarGuardado(pendingFormData)
    
    setTimeout(() => {
      setPendingFormData(null)
      setVerificacionPlan(null)
    }, 100)
  }

  const handleCancelarCambioPlan = () => {
    setCambioPlanModalOpen(false)
  }

  return (
    <RequirePermission requiredPermissions={["manage_users", "view_team"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader title="Gestión de Personas" subtitle="Administra la información personal de los colaboradores" />

          <main className="flex-1 overflow-auto p-6 custom-scrollbar">
            <Toaster />

            <div className="max-w-7xl mx-auto">
              <PersonaDataTable
                title="Personas"
                data={personas}
                columns={PERSONA_COLUMNS}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewDetail={handleViewDetail}
                searchPlaceholder="Buscar personas..."
              />
            </div>
          </main>
        </div>

        <PersonaFormModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          title={editingPersona ? "Editar Persona" : "Nueva Persona"}
          description={editingPersona ? "Modifica los datos de la persona" : "Agrega una nueva persona al sistema"}
          allFields={formFields} 
          initialFormData={(editingPersona || DEFAULT_NEW_DATA || {}) as FormValues}
          onSubmit={handleSubmit}
          initialPersonaData={editingPersona}
          loading={isMutating}
          cambioPlanPendiente={cambioPlanModalOpen}
          puestosList={puestosList}
        />

        <PersonaDetailModal
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          persona={viewingPersona}
        />

        <CambioPlanModal
          open={cambioPlanModalOpen}
          onOpenChange={setCambioPlanModalOpen}
          onCancel={handleCancelarCambioPlan}
          onGuardarSinCambio={handleGuardarSinCambioPlan}
          verificacionData={verificacionPlan}
          onAnalizar={handleAnalizarCambioPlan}
          onConfirm={handleConfirmarCambioPlan}
        />
      </div>
    </RequirePermission>
  )
}
