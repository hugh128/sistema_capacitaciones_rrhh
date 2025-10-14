"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import axios, { AxiosError } from "axios"
import { type UsuarioLogin, type AuthContextType, LoginApiResponse } from "@/lib/auth"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UsuarioLogin | null>(null)
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem("training_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

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

  const logout = async () => {
    setLoggingOut(true)

    await new Promise((res) => setTimeout(res, 500))

    setUser(null)
    localStorage.removeItem("training_user")
    localStorage.removeItem("access_token")
    router.push("/")
    setLoggingOut(false)
  }

  return <AuthContext.Provider value={{ user, login, logout, loading, loggingOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
