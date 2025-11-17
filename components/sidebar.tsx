"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from 'next/navigation'
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
  Moon,
  Sun,
  Menu,
  X,
  Code2,
  ClipboardList,
  UserStar,
  Loader2,
} from "lucide-react"
import Image from "next/image"
import { hasAnyPermission } from "@/lib/permissions"

interface SidebarProps {
  className?: string
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  href: string;
  requiredPermissions: string[]; 
}

const MAIN_MENU_CONFIG: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", requiredPermissions: [] },
  { icon: Users, label: "Personas", href: "/personas", requiredPermissions: ["manage_users"] },
  { icon: UserCheck, label: "Usuarios", href: "/usuarios", requiredPermissions: ["manage_users"] },
  { icon: Shield, label: "Roles y Permisos", href: "/roles", requiredPermissions: ["manage_users"] },
  { icon: Calendar, label: "Planes y Programas", href: "/planes_programas", requiredPermissions: ["view_trainings"] },
  { icon: BookOpen, label: "Capacitaciones", href: "/capacitaciones", requiredPermissions: ["view_trainings"] },
  { icon: ClipboardList, label: "Mis Capacitaciones", href: "/mis-capacitaciones", requiredPermissions: ["manage_trainings", "view_trainings"] },
  { icon: UserStar, label: "Colaboradores", href: "/colaboradores", requiredPermissions: ["view_participants", "view_team"] },
  /* { icon: FileText, label: "Documentos", href: "/documentos", requiredPermissions: ["upload_documents", "view_documents"] }, */
  { icon: Code2, label: "Codigos", href: "/codigos", requiredPermissions: ["codes"] },  
  /* { icon: Shield, label: "Auditoría", href: "/auditoria", requiredPermissions: ["view_audit"] }, */
  { icon: Settings, label: "Configuración", href: "/configuracion", requiredPermissions: ["manage_config"] },
];

export function Sidebar({ className }: SidebarProps) {
  const { user, logout, loggingOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebarCollapsed') === 'true';
    }
    return false;
  })

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [navigatingTo, setNavigatingTo] = useState<string>("")
  const currentPath = usePathname()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', String(collapsed));
    }
  }, [collapsed])

  useEffect(() => {
    setIsNavigating(false)
    setNavigatingTo("")
  }, [currentPath])

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  const getMenuItems = () => {
    if (!user) {
      return MAIN_MENU_CONFIG.filter(item => item.requiredPermissions.length === 0);
    }

    const accessibleItems = MAIN_MENU_CONFIG.filter((item) => {
      if (item.requiredPermissions.length === 0) {
        return true; 
      }

      return hasAnyPermission(user, item.requiredPermissions);
    });

    return accessibleItems;
  }

  const menuItems = getMenuItems()

  const handleNavigation = (href: string, label: string) => {
    if (href === currentPath) return;
    
    setIsNavigating(true)
    setNavigatingTo(label)
    setMobileMenuOpen(false)
    router.push(href)
  }

  const MobileMenuButton = () => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      className="md:hidden fixed top-4 left-1 z-20 bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent"
    >
      {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
    </Button>
  )

  return (
    <>
      <MobileMenuButton />

      {isNavigating && (
        <div className="fixed inset-0 bg-background/5 z-[100] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 bg-card p-6 rounded-lg shadow-lg border dark:border-foreground/10">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-sm text-foreground">Cargando {navigatingTo}...</p>
          </div>
        </div>
      )}

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <div
        className={cn(
          "flex flex-col min-h-svh h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
          "fixed md:relative z-50 md:z-auto",
          "md:flex",
          mobileMenuOpen ? "flex" : "hidden md:flex",
          mobileMenuOpen ? "w-64" : (collapsed ? "w-16" : "w-64"),
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-sidebar-border">
          <div
            className={cn(
              "flex items-center justify-center w-full transition-all duration-300 h-20",
              collapsed && !mobileMenuOpen ? "opacity-0 scale-95" : "opacity-100 scale-100"
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
                <Button
                  variant="ghost"
                  onClick={() => handleNavigation(item.href, item.label)}
                  disabled={isNavigating}
                  title={collapsed && !mobileMenuOpen ? item.label : undefined}
                  className={cn(
                    "w-full justify-start gap-3 text-sidebar-foreground hover:bg-accent hover:text-sidebar-accent-foreground cursor-pointer",
                    collapsed && !mobileMenuOpen ? "justify-center px-2" : "", 
                    isActive && "bg-sidebar-foreground/12"
                  )}
                >
                  {isNavigating && navigatingTo === item.label ? (
                    <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4 flex-shrink-0" />
                  )}
                  {(!collapsed || mobileMenuOpen) && <span className="truncate">{item.label}</span>} 
                </Button>
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        <div
          className={cn(
            "p-4 border-t border-sidebar-border space-y-2 transition-all duration-300",
            collapsed && !mobileMenuOpen && "px-2" 
          )}    
        >
          <Button
            variant="ghost"
            onClick={toggleTheme}
            className={cn(
              "w-full justify-start gap-3 text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-accent cursor-pointer",
              collapsed && !mobileMenuOpen && "justify-center px-2", 
            )}
            title={collapsed ? (theme === "light" ? "Modo Oscuro" : "Modo Claro") : undefined}
          >
            {theme === "light" ? <Moon className="w-4 h-4 flex-shrink-0" /> : <Sun className="w-4 h-4 flex-shrink-0" />}
            <span
              className={cn(
                "transition-all duration-300 ease-in-out",
                collapsed && !mobileMenuOpen ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto" 
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
              "w-full justify-start gap-3 text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground cursor-pointer",
              collapsed && !mobileMenuOpen && "justify-center px-2",
            )}
            title={collapsed ? "Cerrar Sesión" : undefined}
          >
            {loggingOut ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                  <span
                    className={cn(
                      "transition-all duration-300 ease-in-out",
                      collapsed && !mobileMenuOpen ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
                    )}
                  >
                    Saliendo...
                  </span>
              </span>
            ) : (
              <>
                <LogOut className="w-4 h-4 flex-shrink-0" />
                  <span
                    className={cn(
                      "transition-all duration-300 ease-in-out",
                      collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto" 
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
