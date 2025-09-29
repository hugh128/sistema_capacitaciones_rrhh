"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Search, Plus, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface AppHeaderProps {
  title: string
  subtitle?: string
  showActions?: boolean
}

export function AppHeader({ title, subtitle, showActions = true }: AppHeaderProps) {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-4">
          {showActions && (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Buscar..." className="pl-10 w-64" />
              </div>

              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4" />
              </Button>

              {user.roles.some((role) => ["RRHH", "Capacitador"].includes(role.nombre)) && (
                <Link href="/capacitaciones">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Capacitación
                  </Button>                
                </Link>
              )}
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-foreground">
                    {user.nombre.charAt(0)}
                    {user.apellido.charAt(0)}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">
                    {user.nombre} {user.apellido}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.roles[0]?.nombre}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
