'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const ADMIN_EMAIL = 'ueservicesllc1@gmail.com';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Espera a que termine la carga

    if (!user) {
      // Si no hay usuario, redirige al login
      router.push('/login');
    } else if (user.email !== ADMIN_EMAIL) {
      // Si el usuario no es el admin, redirige al inicio
      router.push('/');
    }
  }, [user, loading, router]);

  // Muestra un estado de carga mientras se verifica el usuario
  if (loading || !user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Verificando acceso de administrador...</p>
      </div>
    );
  }

  // Si todo está correcto, muestra el contenido del panel de admin
  return <>{children}</>;
}
