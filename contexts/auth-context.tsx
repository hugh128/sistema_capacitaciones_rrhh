"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import axios, { AxiosError } from "axios"
import { type UsuarioLogin, type AuthContextType, LoginApiResponse } from "@/lib/auth"
import toast from "react-hot-toast"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UsuarioLogin | null>(null)
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()

  // Función para verificar si el token es válido
  const verifyToken = useCallback(async () => {
    const token = localStorage.getItem("access_token")
    const storedUser = localStorage.getItem("training_user")

    if (!token || !storedUser) {
      setUser(null)
      setLoading(false)
      return false
    }

    try {
      // Hacer una petición ligera para verificar el token
      await apiClient.get('/auth/verify')
      
      setUser(JSON.parse(storedUser))
      setLoading(false)
      return true
    } catch (error) {
      // Si falla, el interceptor ya manejará el cierre de sesión
      // Solo necesitamos limpiar el estado local
      console.log(error);
      setUser(null)
      setLoading(false)
      return false
    }
  }, [])

  // Verificar token al montar el componente
  useEffect(() => {
    verifyToken()
  }, [verifyToken])

  // Verificar token periódicamente (cada 5 minutos)
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        verifyToken()
      }
    }, 5 * 60 * 1000) // 5 minutos

    return () => clearInterval(interval)
  }, [user, verifyToken])

  const login = async (username: string, password: string) => {
    try {
      const response = await apiClient.post<LoginApiResponse>('/auth/login', { 
        username,
        password
      });

      const loggedInUser: UsuarioLogin = response.data.USUARIO.DATA;
      const token: string = response.data.USUARIO.TOKEN;

      localStorage.setItem("access_token", token);
      localStorage.setItem("training_user", JSON.stringify(loggedInUser));

      setUser(loggedInUser);
    } catch (error: unknown) {
      let errorMessage = 'Error de conexión con el servidor.'
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string | string[], error?: string }>

        const responseData = axiosError.response?.data
        if (responseData) {
          if (responseData.message) {
            const apiMessage = responseData.message
            errorMessage = Array.isArray(apiMessage) ? apiMessage.join(', ') : apiMessage
          } else if (responseData.error) {
            errorMessage = responseData.error
          }
        }
      }
      throw new Error(errorMessage);
    }
  }

  const logout = async (showMessage: boolean = true) => {
    setLoggingOut(true)

    await new Promise((res) => setTimeout(res, 500))

    setUser(null)
    localStorage.removeItem("training_user")
    localStorage.removeItem("access_token")
    
    if (showMessage) {
      toast.success("Sesión cerrada exitosamente")
    }
    
    router.push("/")
    setLoggingOut(false)
  }

  // Función para cerrar sesión por token expirado (sin mensaje de éxito)
  const logoutDueToExpiredToken = useCallback(() => {
    setUser(null)
    localStorage.removeItem("training_user")
    localStorage.removeItem("access_token")
    toast.error("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.")
    router.push("/")
  }, [router])

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        login, 
        logout, 
        loading, 
        loggingOut,
        logoutDueToExpiredToken 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
