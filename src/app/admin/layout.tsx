'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Este layout ahora solo protege el panel de administración
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAdminView } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; 

    if (!user) {
      router.push('/login');
    } else if (!isAdminView) {
      router.push('/'); // Si no está en vista de admin, va al dashboard principal
    }
  }, [user, loading, router, isAdminView]);

  if (loading || !user || !isAdminView) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Verificando acceso de administrador...</p>
      </div>
    );
  }

  return <>{children}</>;
}