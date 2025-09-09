'use client';

import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { Button } from './ui/button';

export default function AuthStatus() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="text-muted-foreground">Cargando...</p>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground hidden sm:inline">
          {user.email || user.displayName || 'Usuario'}
        </span>
        <Button variant="outline" onClick={() => auth.signOut()}>
          Cerrar Sesión
        </Button>
      </div>
    );
  }

  return (
    <Link href="/login">
      <Button variant="outline">Iniciar Sesión</Button>
    </Link>
  );
}
