"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Key, Eye, EyeOff } from "lucide-react";

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (password: string) => void;
  loading: boolean;
  username: string;
}

export function ChangePasswordModal({
  open,
  onOpenChange,
  onSubmit,
  loading,
  username,
}: ChangePasswordModalProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const resetForm = () => {
    setPassword("");
    setShowPassword(false);
  };
  
  const handleOpenChange = (newOpenState: boolean) => {
    onOpenChange(newOpenState);
    if (!newOpenState) {
      resetForm();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onSubmit(password);
      resetForm();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const VisibilityIcon = showPassword ? EyeOff : Eye;
  
  const inputType = showPassword ? "text" : "password";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Key className="mr-2 h-5 w-5" /> Cambiar Contraseña
          </DialogTitle>
          <DialogDescription>
            {`Establece una nueva contraseña para el usuario: ${username}.`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <input 
              type="text" 
              name="username" 
              id="username-hidden"
              autoComplete="username" 
              defaultValue={username}
              className="hidden"
              tabIndex={-1}
          />
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={inputType}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="new-password" 
                  className="pr-10" 
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-1 hover:bg-transparent cursor-pointer"
                  onClick={togglePasswordVisibility}
                  disabled={loading}
                >
                  <VisibilityIcon className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="cursor-pointer dark:border-gray-600 dark:text-gray-300"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!password.trim() || loading} className="cursor-pointer">
              {loading ? "Guardando..." : "Guardar Contraseña"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
