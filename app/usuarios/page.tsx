"use client"

import { useEffect, useState, useMemo } from "react"
import { Sidebar } from "@/components/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { AppHeader } from "@/components/app-header"
import type { Rol } from "@/lib/auth"
import { useUsuarios } from "@/hooks/useUsuarios"
import { Toaster } from "react-hot-toast"
import type { Persona, Usuario, usuarioPayload, usuarioCreatePayload } from "@/lib/types"
import { UsuarioDataTable } from "@/components/usuario-data-table"
import { ChangePasswordModal } from "@/components/change-password-modal"
import { getUsuarioColumns, getUsuarioFormFields, type UsuarioFormFields } from "@/data/usuario-config"
import { FormModal, type FormData as FormValues } from "@/components/form-modal" 
import { RequirePermission } from "@/components/RequirePermission"


const getRolesList = async () => {
  try {
    const { data } = await apiClient.get<Rol[]>('/rol');
    return data;
  } catch (error) {
    console.error("Error al cargar lista roles ", error);
    return [];
  }
}

const getPersonasList = async () => {
  try {
    const { data } = await apiClient.get<Persona[]>('/persona');
    return data;
  } catch (error) {
    console.error("Error al cargar lista personas ", error);
    return [];
  }
}

const transformFrontendToApi = (data: UsuarioFormFields, isEditing: boolean): usuarioPayload | usuarioCreatePayload => {
  const frontendRoles = data.ID_ROLES;
  
  const rolIdsNumbers = Array.isArray(frontendRoles) 
    ? frontendRoles.map(id => parseInt(id, 10)).filter(id => !isNaN(id))
    : [];

  const estadoBoolean = data.ESTADO === "true";
  
  const updatePayload: usuarioPayload = {
    USERNAME: data.USERNAME,
    ESTADO: estadoBoolean,
    ID_ROLES: rolIdsNumbers, 
  };
  
  if (isEditing) {
    return updatePayload;
  }
  
  const createPayload: usuarioCreatePayload = {
    ...updatePayload,
    PERSONA_ID: parseInt(data.PERSONA_ID, 10),
    PASSWORD: data.PASSWORD!,
  };
  
  return createPayload;
};

export default function UsuariosPage() {
  const { user } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null)
  const [personasList, setPersonasList] = useState<Persona[]>([])
  const [rolesList, setRolesList] = useState<Rol[]>([])

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [userToChangePassword, setUserToChangePassword] = useState<Usuario | null>(null);

  const {
    usuarios,
    isMutating,
    saveUsuario,
    deleteUsuario,
    updatePassword,
    loading,
  } = useUsuarios(user);

  useEffect(() => {
    if (user) {
      getRolesList().then(setRolesList);
      getPersonasList().then(setPersonasList);
    }
  }, [user])

  const columns = useMemo(() => getUsuarioColumns(), []);

  const formFields = useMemo(() => 
    getUsuarioFormFields(personasList, rolesList, !!editingUsuario), 
    [personasList, rolesList, editingUsuario]
  );
  
  const initialData = useMemo(() => {
    if (!editingUsuario) {
      return {
        ESTADO: "true", 
        ID_ROLES: [], 
      };
    }

    return {
      PERSONA_ID: editingUsuario.PERSONA_ID.toString(),
      USERNAME: editingUsuario.USERNAME,
      ID_ROLES: editingUsuario.USUARIO_ROLES 
        ? editingUsuario.USUARIO_ROLES.map(ur => ur.ID_ROL.toString()) 
        : [],
      ESTADO: editingUsuario.ESTADO ? "true" : "false", 
    };
  }, [editingUsuario]);

  const handleAdd = () => {
    setEditingUsuario(null)
    setModalOpen(true)
  }

  const handleEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario)
    setModalOpen(true)
  }

  const handleDelete = async (usuario: Usuario) => {
    try {
      await deleteUsuario(usuario.ID_USUARIO);
    } catch (err) {
      console.error("Delete Error:", err);
    }
  }

  const handleChangePasswordClick = (usuario: Usuario) => {
    setUserToChangePassword(usuario);
    setPasswordModalOpen(true);
  };

  const handlePasswordSubmit = async (newPassword: string) => {
    if (!userToChangePassword) return;

    try {
        await updatePassword(userToChangePassword.ID_USUARIO, newPassword);
        setPasswordModalOpen(false);
        setUserToChangePassword(null);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (data: FormValues) => {
    try {
      const formData = data as unknown as UsuarioFormFields; 
      
      const isEditing = !!editingUsuario;
      const apiPayload = transformFrontendToApi(formData, isEditing);
      const idToEdit = editingUsuario?.ID_USUARIO;

      await saveUsuario(apiPayload, idToEdit); 
      setModalOpen(false);
        
    } catch (err) {
      console.error("Submit Error:", err);
    }
  }

  return (
    <RequirePermission requiredPermissions={["employees_access"]}>

      <div className="flex h-screen bg-background">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">

          <AppHeader title="Gestión de Usuarios" subtitle="Administra los usuarios del sistema y sus permisos" />

          <main className="flex-1 overflow-auto p-6 custom-scrollbar">

            <Toaster />

            <div className="max-w-7xl mx-auto">
              <UsuarioDataTable
                title="Usuarios"
                data={usuarios}
                columns={columns}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPasswordChange={handleChangePasswordClick}
                searchPlaceholder="Buscar usuarios..."
                loading={loading}
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
          initialData={initialData}
          onSubmit={handleSubmit}
          loading={isMutating}
        />

        {userToChangePassword && (
          <ChangePasswordModal
              open={passwordModalOpen}
              onOpenChange={setPasswordModalOpen}
              onSubmit={handlePasswordSubmit}
              loading={isMutating}
              username={userToChangePassword.USERNAME}
          />
        )}
      </div>

    </RequirePermission>
  )
}
