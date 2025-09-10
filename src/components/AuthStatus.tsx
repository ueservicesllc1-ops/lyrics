'use client';

import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { Button } from './ui/button';
import { Shield } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function AuthStatus() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <p className="text-muted-foreground">Cargando...</p>;
  }

  if (user) {
    const userInitial = user.email ? user.email.charAt(0).toUpperCase() : 'U';
    return (
      <div className="flex items-center gap-4">
        {isAdmin && (
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="hover:bg-neutral-800">
              <Shield className="h-5 w-5 text-primary" />
              <span className="sr-only">Admin Panel</span>
            </Button>
          </Link>
        )}
         <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-neutral-700 text-white font-bold text-sm">
                {userInitial}
            </AvatarFallback>
        </Avatar>
        <Button variant="secondary" onClick={() => auth.signOut()} className="bg-[#D4A32D] text-black hover:bg-[#D4A32D]/90 h-9 px-4 rounded-full font-semibold">
          Cerrar Sesión
        </Button>
      </div>
    );
  }

  return (
    <Link href="/login">
      <Button variant="secondary" className="bg-[#D4A32D] text-black hover:bg-[#D4A32D]/90 h-9 px-4 rounded-full font-semibold">
        Iniciar Sesión
      </Button>
    </Link>
  );
}
