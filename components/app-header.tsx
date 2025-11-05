"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Plus, User } from "lucide-react"
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
    <header className="sticky top-0 z-10 border-b border-border bg-card">
      <div className="flex items-center justify-between px-4 sm:px-4 py-3 sm:py-4 ml-7 md:ml-0">
        
        <div className="min-w-0 pr-4">
          <h1 className="text-xl sm:text-2xl font-bold text-card-foreground truncate">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground hidden sm:block">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {showActions && (
            <>
              {user.ROLES.some((role) => ["RRHH", "Capacitador"].includes(role.NOMBRE)) && (
                <div className="hidden sm:block"> 
                  {getNavigationButtons()}
                </div>
              )}
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 px-2 sm:px-3" 
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-foreground">
                    {user.NOMBRE.charAt(0)}
                    {user.APELLIDO.charAt(0)}
                  </span>
                </div>
                <div className="text-left hidden sm:block"> 
                  <p className="text-sm font-medium truncate">
                    {user.NOMBRE} {user.APELLIDO}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.ROLES[0]?.NOMBRE}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="block sm:hidden">
                    {user.NOMBRE} {user.APELLIDO}
                    <p className="text-xs text-muted-foreground">{user.ROLES[0]?.NOMBRE}</p>
                </div>
                <div className="hidden sm:block">
                    Mi Cuenta
                </div>
              </DropdownMenuLabel>
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
