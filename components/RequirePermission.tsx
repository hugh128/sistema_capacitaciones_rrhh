"use client";

import { useAuth } from "@/contexts/auth-context";
import { hasAnyPermission } from "@/lib/permissions";
import React, { useEffect } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { ShieldAlert, Home } from "lucide-react";

interface RequirePermissionProps {
  requiredPermissions?: string[];
  children: React.ReactNode;
}

export const RequirePermission: React.FC<RequirePermissionProps> = ({
  requiredPermissions = [],
  children,
}) => {
  const { user, loading, loggingOut } = useAuth();
  const router = useRouter();

  const hasAccess = user && (requiredPermissions.length === 0 || hasAnyPermission(user, requiredPermissions));

  useEffect(() => {
    if (!loading && !loggingOut && !user) {
      router.push("/");
    }
  }, [loading, loggingOut, user, router]);

  // 1. ESTADO DE CARGA O CIERRE DE SESIÓN
  if (loading || loggingOut) {
    return (
      <div className="flex min-h-svh bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5 bg-[size:40px_40px]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="flex-1 flex items-center justify-center p-4 relative z-10">
          <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-700">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              
              <div className="absolute inset-2 rounded-full border-4 border-t-primary border-r-primary/40 border-b-primary/20 border-l-primary/40 animate-spin" 
                   style={{ animationDuration: '1.5s' }} />
              
              <div className="absolute inset-4 rounded-full border-4 border-b-primary border-l-primary/40 border-t-primary/20 border-r-primary/40 animate-spin" 
                   style={{ animationDuration: '1s', animationDirection: 'reverse' }} />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50" />
              </div>
              
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            </div>

            <div className="text-center space-y-3">
              <p className="text-2xl font-bold text-foreground tracking-tight animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
                {loggingOut ? "Cerrando sesión" : "Cargando"}
              </p>
              <p className="text-base text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
                {loggingOut ? "Hasta pronto..." : "Verificando credenciales..."}
              </p>
            </div>

            <div className="w-48 h-1 bg-muted rounded-full overflow-hidden animate-in fade-in duration-500 delay-500">
              <div className="h-full bg-gradient-to-r from-primary/50 via-primary to-primary/50"
                   style={{ 
                     backgroundSize: '200% 100%',
                     animation: 'shimmer 2s infinite linear'
                   }} />
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
      </div>
    );
  }

  // 2. RUTA PROTEGIDA SIN USUARIO
  if (!user) {
    return null; 
  }

  // 3. ACCESO DENEGADO
  if (!hasAccess) {
    return (
      <div className="flex min-h-svh bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-card border border-border rounded-2xl shadow-lg p-8 space-y-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-destructive/20 rounded-full blur-xl" />
                  <div className="relative bg-destructive/10 p-4 rounded-full">
                    <ShieldAlert className="h-12 w-12 text-destructive" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-foreground tracking-tight">
                    Acceso Denegado
                  </h1>
                  <p className="text-muted-foreground leading-relaxed">
                    No cuentas con los permisos necesarios para acceder a esta página
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                <p className="text-sm text-muted-foreground text-center">
                  Si crees que esto es un error, contacta al administrador del sistema
                </p>
              </div>

              <Button
                onClick={() => router.push("/")}
                className="w-full h-11 text-base font-medium gap-2 shadow-sm hover:shadow transition-all cursor-pointer"
                size="lg"
              >
                <Home className="h-4 w-4" />
                Volver al inicio
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. ACCESO AUTORIZADO
  return <>{children}</>;
};
