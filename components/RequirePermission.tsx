// components/RequirePermission.tsx
import { useAuth } from "@/contexts/auth-context";
import { hasAnyPermission } from "@/lib/permissions";
import React from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

interface RequirePermissionProps {
  requiredPermissions: string[]; 
  children: React.ReactNode;
}

export const RequirePermission: React.FC<RequirePermissionProps> = ({
  requiredPermissions,
  children,
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const isProtected = requiredPermissions.length > 0;
  const hasAccess = user && hasAnyPermission(user, requiredPermissions);

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Cargando datos del usuario...</div>; 
  }
  
  if (isProtected && !hasAccess) {
    return (
      <div className="flex min-h-svh bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Acceso Denegado</h1>
            <p className="text-muted-foreground">No tienes permisos para acceder a esta página</p>
            <Button
              onClick={() => router.push("/")}
              className="cursor-pointer mt-4"
            >
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>;
};
