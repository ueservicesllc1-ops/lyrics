'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Este layout ahora solo protege el panel de administración
const ADMIN_EMAIL = 'ueservicesllc1@gmail.com';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; 

    if (!user) {
      router.push('/login');
    } else if (user.email !== ADMIN_EMAIL) {
      router.push('/'); // Si no es admin, va al dashboard principal
    }
  }, [user, loading, router]);

  if (loading || !user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Verificando acceso de administrador...</p>
      </div>
    );
  }

  return <>{children}</>;
}
