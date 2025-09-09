'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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

  // Dashboard con dos tarjetas principales
  return (
    <main className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">Dashboard de Usuario</h1>
        <p className="text-muted-foreground">
          Gestiona tu música y tus eventos.
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Biblioteca de Canciones</CardTitle>
            <CardDescription>
              Explora todas las canciones disponibles en el repertorio central.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Link href="/admin/songs">
              <Button>Ver Biblioteca</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mis Setlists</CardTitle>
            <CardDescription>
              Crea y organiza tus setlists personalizados para los eventos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/setlists">
              <Button>Gestionar Mis Setlists</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
