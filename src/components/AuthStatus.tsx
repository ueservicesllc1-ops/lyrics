'use client';

import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { Button } from './ui/button';
import { Shield } from 'lucide-react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

export default function AuthStatus() {
  const { user, loading, isAdmin, isAdminView, toggleViewAsAdmin } = useAuth();

  if (loading) {
    return <p className="text-muted-foreground">Cargando...</p>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        {isAdmin && (
          <div className="flex items-center space-x-2">
            <Switch
              id="admin-view-switch"
              checked={isAdminView}
              onCheckedChange={toggleViewAsAdmin}
            />
            <Label htmlFor="admin-view-switch" className="text-white">
              {isAdminView ? 'Admin' : 'User'} View
            </Label>
          </div>
        )}

        {isAdminView && (
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="hover:bg-blue-800 hover:text-white">
              <Shield className="h-6 w-6" />
              <span className="sr-only">Admin Panel</span>
            </Button>
          </Link>
        )}
        <span className="text-sm hidden sm:inline">
          {user.email || user.displayName || 'Usuario'}
        </span>
        <Button variant="outline" onClick={() => auth.signOut()} className="bg-transparent border-white text-white hover:bg-white hover:text-blue-900">
          Cerrar Sesión
        </Button>
      </div>
    );
  }

  return (
    <Link href="/login">
      <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-900">Iniciar Sesión</Button>
    </Link>
  );
}