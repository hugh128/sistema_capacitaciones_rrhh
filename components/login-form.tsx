"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { ThemeToggle } from "@/components/theme-toggle"
import { Eye, EyeOff, User, Lock } from "lucide-react"
import Image from "next/image"

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const { theme } = useTheme()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(username, password)
      setError("")
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al iniciar sesión"
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen max-h-full phara-bg flex items-center justify-center">
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-7xl mx-auto flex items-center justify-center min-h-screen py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center justify-items-center w-full">
          <div className="text-center mb-15">
            <Image
              src={theme === "dark" ? "/images/phara-logo-white.png" : "/images/phara-logo-dark.png"}
              alt="Phara Laboratorio"
              width={500}
              height={500}
              className="h-25 sm:h-30 md:h-35 lg:h-40 w-auto object-contain mx-auto"
              priority={true}
            />
          </div>

          <div className="flex flex-col items-center justify-center flex-1 max-w-md mx-auto w-full">

            <Card className="w-full phara-card border-0 shadow-2xl relative">

              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl sm:text-3xl font-bold text-primary mb-2 dark:text-primary-foreground">Iniciar Sesión</CardTitle>
                <div className="w-16 h-1 bg-[#F7AC25] mx-auto rounded-full"></div>
              </CardHeader>

              <CardContent className="space-y-6 px-6 sm:px-8 pb-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium text-foreground">
                      Usuario
                    </Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="Usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-12 h-12 sm:h-14 bg-input/50 border-border/50 rounded-xl text-base focus:ring-2 focus:ring-primary/20"
                        required
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-foreground">
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-12 pr-12 h-12 sm:h-14 bg-input/50 border-border/50 rounded-xl text-base focus:ring-2 focus:ring-primary/20"
                        required
                        autoComplete="current-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <Eye className="w-5 h-5 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <div className="text-sm text-destructive bg-destructive/10 p-4 rounded-xl text-center border border-destructive/20">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 sm:h-14 bg-[#F7AC25] hover:bg-[#F7AC25]/90 text-accent-foreground font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={loading}
                  >
                    {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>
                </form>

                <div className="pt-6 border-t border-border/30">
                  <p className="text-xs text-muted-foreground text-center mb-3">
                    Cuentas de prueba: <span className="font-mono bg-muted px-2 py-1 rounded">rrhh</span>,{" "}
                    <span className="font-mono bg-muted px-2 py-1 rounded">capacitador</span>,{" "}
                    <span className="font-mono bg-muted px-2 py-1 rounded">gerente</span>
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    Contraseña: <code className="bg-muted px-2 py-1 rounded text-xs font-mono">password123</code>
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="text-center mt-8 text-sm text-primary font-medium dark:text-primary-foreground">
              <p>Sistema de Gestión de Capacitaciones</p>
              <p className="text-xs text-muted-foreground mt-1">versión 1.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
