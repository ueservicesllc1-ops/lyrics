'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  // Dashboard en blanco, listo para construir.
  return (
    <div className="container mx-auto p-4">
      {/* El contenido del dashboard de usuario irá aquí */}
      <h1 className="text-2xl font-bold">Dashboard de Usuario</h1>
      <p>Próximamente...</p>
    </div>
  );
}
