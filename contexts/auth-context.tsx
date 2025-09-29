"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { type User, type AuthContextType, mockUsers } from "@/lib/auth"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
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

  const login = async (email: string, password: string) => {
    setLoading(true)

    try {
      const foundUser = mockUsers.find((u) => u.email === email)

      if (foundUser && password === "password123") {
        setUser(foundUser)
        localStorage.setItem("training_user", JSON.stringify(foundUser))
      } else {
        throw new Error("Credenciales inválidas")
      }
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoggingOut(true)

    await new Promise((res) => setTimeout(res, 500))

    setUser(null)
    localStorage.removeItem("training_user")
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
