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

  const getNavigationButtons = () => {
    if (user.ROLES.some((role) => ["RRHH"].includes(role.NOMBRE))) {
      return (
        <Link href="/capacitaciones">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Capacitaciones
          </Button>
        </Link>
      )
    } else if (user.ROLES.some((role) => ["Capacitador"].includes(role.NOMBRE)))  {
      return (
        <Link href="/mis-capacitaciones">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Mis Capacitaciones
          </Button>
        </Link>
      )
    }
    return null
  }


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
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4" />
              </Button>

              {user.ROLES.some((role) => ["RRHH", "Capacitador"].includes(role.NOMBRE)) && (
                getNavigationButtons()
              )}
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-foreground">
                    {user.NOMBRE.charAt(0)}
                    {user.APELLIDO.charAt(0)}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">
                    {user.NOMBRE} {user.APELLIDO}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.ROLES[0]?.NOMBRE}</p>
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
