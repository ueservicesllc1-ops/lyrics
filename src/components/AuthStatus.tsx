'use client';

import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { Button } from './ui/button';
import { Shield, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


export default function AuthStatus() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <p className="text-muted-foreground text-xs">...</p>;
  }

  if (user) {
    const userInitial = user.email ? user.email.charAt(0).toUpperCase() : 'U';
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-neutral-700 text-white font-bold text-sm">
                            {userInitial}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName || 'Usuario'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <Link href="/admin">
                    <DropdownMenuItem className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Panel de Admin</span>
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuItem onClick={() => auth.signOut()} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
  }

  return (
    <Link href="/login">
      <Button variant="secondary" className="h-9 px-4 rounded-md font-semibold">
        Iniciar Sesión
      </Button>
    </Link>
  );
}
