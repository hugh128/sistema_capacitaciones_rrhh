"use client"

import { useState } from "react"
import { usePathname } from 'next/navigation'
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Settings,
  Users,
  UserCheck,
  BookOpen,
  Calendar,
  FileText,
  BarChart3,
  Shield,
  LogOut,
  ChevronLeft,
  Building2,
  Briefcase,
  UserCog,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const { user, logout, loggingOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const currentPath = usePathname()

  const getMenuItems = () => {
    const baseItems = [{ icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" }]

    if (user?.roles.some((role) => role.nombre === "RRHH")) {
      return [
        ...baseItems,
        { icon: Users, label: "Personas", href: "/personas" },
        { icon: UserCheck, label: "Usuarios", href: "/usuarios" },
        { icon: Shield, label: "Roles", href: "/roles" },
        { icon: Calendar, label: "Planes", href: "/planes" },
        { icon: BookOpen, label: "Capacitaciones", href: "/capacitaciones" },
        { icon: Users, label: "Participantes", href: "/participantes" },
        { icon: FileText, label: "Documentos", href: "/documentos" },
        { icon: BarChart3, label: "Reportes", href: "/reportes" },
        { icon: Shield, label: "Auditoría", href: "/auditoria" },
        {
          icon: Settings,
          label: "Configuración",
          href: "/configuracion",
          /* children: [
            { icon: Building2, label: "Empresas", href: "/configuracion/empresa" },
            { icon: Briefcase, label: "Departamentos", href: "/configuracion/departamento" },
            { icon: UserCog, label: "Puestos", href: "/configuracion/puesto" },
          ], */
        },
      ]
    }

    if (user?.roles.some((role) => role.nombre === "Capacitador")) {
      return [
        ...baseItems,
        { icon: BookOpen, label: "Mis Capacitaciones", href: "/capacitaciones" },
        { icon: Users, label: "Participantes", href: "/participantes" },
        { icon: FileText, label: "Documentos", href: "/documentos" },
      ]
    }

    if (user?.roles.some((role) => ["Gerente", "Jefe"].includes(role.nombre))) {
      return [
        ...baseItems,
        { icon: Users, label: "Mi Equipo", href: "/equipo" },
        { icon: BarChart3, label: "Reportes", href: "/reportes" },
        { icon: FileText, label: "Expedientes", href: "/expedientes" },
      ]
    }

    return baseItems
  }

  const menuItems = getMenuItems()

  const MobileMenuButton = () => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      className="md:hidden fixed top-4 left-4 z-50 bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent"
    >
      {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
    </Button>
  )

  return (
    <>
      <MobileMenuButton />

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <div
        className={cn(
          "flex flex-col min-h-svh bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
          "fixed md:relative z-50 md:z-auto",
          "md:flex",
          mobileMenuOpen ? "flex" : "hidden md:flex",
          collapsed ? "w-16" : "w-64",
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-sidebar-border">
          <div
            className={cn(
              "flex items-center justify-center w-full transition-all duration-300 h-20",
              collapsed ? "opacity-0 scale-95" : "opacity-100 scale-100"
            )}
          >
            <div className="flex items-center justify-center">
              <Image
                src={theme === "dark" ? "/images/phara-logo-white.png" : "/images/phara-logo-dark.png"}
                alt="Phara Laboratorio"
                width={200}
                height={200}
                className="h-20 w-auto object-contain transition-all duration-300"
                priority={true}
              />
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="text-sidebar-foreground hover:bg-sidebar-accent flex-shrink-0 hidden md:flex relative w-8 h-8"
          >
            <Menu
              className={cn(
                "absolute transition-all duration-300 transform",
                collapsed ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"
              )}
            />
            <X
              className={cn(
                "absolute transition-all duration-300 transform",
                collapsed ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
              )}
            />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 pt-2 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            
            const isDashboard = item.href === '/dashboard'

            const isActive = isDashboard 
              ? currentPath === item.href
              : currentPath === item.href || currentPath.startsWith(item.href + '/')
            
            return (
              <div key={index}>
                <Link href={item.href} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 text-sidebar-foreground hover:bg-accent hover:text-sidebar-accent-foreground cursor-pointer",
                      collapsed && "justify-center px-2",
                      isActive && "bg-sidebar-foreground/12"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Button>
                </Link>

                {/* Submenu for Configuration */}
                {/* {item.children && !collapsed && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child, childIndex) => {
                      const ChildIcon = child.icon
                      return (
                        <Link key={childIndex} href={child.href} onClick={() => setMobileMenuOpen(false)}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start gap-2 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          >
                            <ChildIcon className="w-3 h-3" />
                            <span className="truncate">{child.label}</span>
                          </Button>
                        </Link>
                      )
                    })}
                  </div>
                )} */}
              </div>
            )
          })}
        </nav>

        {/* Logout */}
        <div
          className={cn(
            "p-4 border-t border-sidebar-border space-y-2 transition-all duration-300",
            collapsed && "px-2"
          )}        
        >
          <Button
            variant="ghost"
            onClick={toggleTheme}
            className={cn(
              "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              collapsed && "justify-center px-2",
            )}
          >
            {theme === "light" ? <Moon className="w-4 h-4 flex-shrink-0" /> : <Sun className="w-4 h-4 flex-shrink-0" />}
            <span
              className={cn(
                "transition-all duration-300 ease-in-out",
                collapsed ? "opacity-0 scale-95 translate-x-[-10px]" : "opacity-100 scale-100 translate-x-0"
              )}
            >
              {theme === "light" ? "Modo Oscuro" : "Modo Claro"}
            </span>
          </Button>

          <Button
            variant="ghost"
            onClick={logout}
            disabled={loggingOut}
            className={cn(
              "w-full justify-start gap-3 text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground",
              collapsed && "justify-center px-2",
            )}
          >
            {loggingOut ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-sidebar-foreground"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                {!collapsed && <span>Saliendo...</span>}
              </span>
            ) : (
              <>
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <span
                  className={cn(
                    "transition-all duration-300 ease-in-out",
                    collapsed ? "opacity-0 scale-95 translate-x-[-10px]" : "opacity-100 scale-100 translate-x-0"
                  )}
                >
                  Cerrar Sesión
                </span>
              </>
            )}
          </Button>

        </div>
      </div>
    </>
  )
}
