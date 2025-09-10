'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function SetlistsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Si estamos en la página de un setlist específico, no mostramos el layout
  if (pathname.startsWith('/setlists/')) {
    return <>{children}</>;
  }


  useEffect(() => {
    if (loading) return; 

    if (!user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Verificando acceso...</p>
      </div>
    );
  }

  return <>{children}</>;
}
