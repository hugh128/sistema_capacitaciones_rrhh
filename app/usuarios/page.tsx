"use client"

import { useCallback, useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DataTable } from "@/components/data-table"
import { FormModal } from "@/components/form-modal"
import { Badge } from "@/components/ui/badge"
import { mockUsuarios, mockPersonas, mockRoles, type Usuario, Persona } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { AppHeader } from "@/components/app-header"
import { transformApiToFrontend, transformFrontendToApi } from "@/lib/usuario-transformer"
import { CreateUsuarioFrontendDto } from "@/lib/usuario-types"

export default function UsuariosPage() {
  const { user } = useAuth()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null)
  const [personas, setPersonas] = useState<Persona[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)


  const fetchUsuarios = useCallback(async () => {
      setLoading(true)
      setError(null)
      try {
          const response = await apiClient.get('/usuario')

          const transformedData = response.data.map(transformApiToFrontend)
          setUsuarios(transformedData)
      } catch (err) {
          setError('Error al cargar los usuarios.')
          console.error('API Error (Usuarios):', err)
      } finally {
          setLoading(false)
      }
  }, [])

      const fetchDependencies = async () => {
        try {
            const personaResponse = await apiClient.get('/persona')
            const availablePersonas: Persona[] = personaResponse.data.map((p: any) => ({
                id: p.ID_PERSONA.toString(),
                nombre: p.NOMBRE,
                apellido: p.APELLIDO,
                correo: p.CORREO,
                estado: p.ESTADO ? "activo" : "inactivo",
                tipoPersona: p.TIPO_PERSONA
            }));
            setPersonas(availablePersonas)

        } catch (err) {
            console.error('Error cargando dependencias (Personas/Roles):', err)
            setPersonas(mockPersonas);
            setRoles(mockRoles);
        }
    }


    useEffect(() => {
        if (user && user.roles.some((role) => role.nombre === "RRHH")) {
            const loadData = async () => {
                setLoading(true);
                await Promise.all([fetchUsuarios(), fetchDependencies()]); 
                setLoading(false);
            }
            loadData()
        }
    }, [user, fetchUsuarios])

  if (!user || !user.roles.some((role) => role.nombre === "RRHH")) {
    return <div>No tienes permisos para acceder a esta página</div>
  }

  const columns = [
    {
      key: "personaId",
      label: "Persona",
      render: (value: string) => {
        const persona = mockPersonas.find((p) => p.id === value)
        return persona ? `${persona.nombre} ${persona.apellido}` : "N/A"
      },
    },
    { key: "email", label: "Email" },
    {
      key: "roles",
      label: "Roles",
      render: (value: any[]) => (
        <div className="flex gap-1 flex-wrap">
          {value.map((role) => (
            <Badge key={role.id} variant="outline" className="text-xs">
              {role.nombre}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "estado",
      label: "Estado",
      render: (value: string) => <Badge variant={value === "activo" ? "default" : "secondary"}>{value}</Badge>,
    },
    {
      key: "ultimoAcceso",
      label: "Último Acceso",
      render: (value: string) => {
        if (!value) return "Nunca"
        return new Date(value).toLocaleDateString()
      },
    },
    { key: "fechaCreacion", label: "Fecha Creación" },
  ]

  const formFields = [
    {
      key: "personaId",
      label: "Persona",
      type: "select" as const,
      required: true,
      options: mockPersonas.map((p) => ({ value: p.id, label: `${p.nombre} ${p.apellido}` })),
    },
    {
      key: "email", label: "Email", type: "email" as const, required: true
    },
    {
      key: "password", label: "Password", type: "password" as const, required: true
    },
    {
      key: "roles",
      label: "Roles",
      type: "select" as const,
      required: true,
      options: mockRoles.map((r) => ({ value: r.id, label: r.nombre })),
    },
    {
      key: "estado",
      label: "Estado",
      type: "select" as const,
      required: true,
      options: [
        { value: "activo", label: "Activo" },
        { value: "inactivo", label: "Inactivo" },
      ],
    },
  ]

  const handleAdd = () => {
    setEditingUsuario(null)
    setModalOpen(true)
  }

  const handleEdit = (usuario: Usuario) => {
    console.log("Click en editar usuario")
    setEditingUsuario(usuario)
    setModalOpen(true)
  }

  const handleDelete = async (usuario: Usuario) => {
    try {
        await apiClient.delete(`/usuario/${usuario.id}`);
        
        fetchUsuarios();

    } catch (err) {
        setError("Error al dar de baja al usuario.");
        console.error("Delete Error:", err);
    }
  }

    const handleSubmit = async (data: CreateUsuarioFrontendDto) => {
        setError(null);
        try {
            const apiData = transformFrontendToApi(data);
            
            if (editingUsuario) {
                const updateDto = { USERNAME: apiData.USERNAME, ESTADO: apiData.ESTADO };
                await apiClient.patch(`/usuario/${editingUsuario.id}`, updateDto);

                if (data.password) {
                    await apiClient.patch(`/usuario/${editingUsuario.id}/password`, { PASSWORD: data.password });
                }

            } else {
                if (!apiData.PASSWORD) {
                    throw new Error("La contraseña es obligatoria para la creación.");
                }
                
                await apiClient.post('/usuario', apiData);
            }
            
            fetchUsuarios();
            
          } catch (err) {
            const msg = editingUsuario ? "actualizar" : "crear";
            const apiError = err as any;
            let errorMessage = `Fallo al ${msg} el usuario.`;
            
            if (apiError.response?.data?.message) {
              errorMessage = Array.isArray(apiError.response.data.message) 
              ? apiError.response.data.message.join(' | ') 
                    : apiError.response.data.message;
                  } else if (err instanceof Error) {
                    errorMessage = err.message;
            }
            
            setError(errorMessage);
            console.error("Submit Error:", err);
          } finally {            
            setModalOpen(false);
        }
    }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader title="Gestión de Usuarios" subtitle="Administra los usuarios del sistema y sus permisos" />

        <main className="flex-1 overflow-auto p-6 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <DataTable
              title="Usuarios"
              data={usuarios}
              columns={columns}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchPlaceholder="Buscar usuarios..."
            />
          </div>
        </main>
      </div>

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingUsuario ? "Editar Usuario" : "Nuevo Usuario"}
        description={editingUsuario ? "Modifica los datos del usuario" : "Agrega un nuevo usuario al sistema"}
        fields={formFields}
        initialData={
          editingUsuario
            ? {
                ...editingUsuario,
                roles: editingUsuario.roles[0]?.id || "",
              }
            : {}
        }
        onSubmit={handleSubmit}
      />
    </div>
  )
}
