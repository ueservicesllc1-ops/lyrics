'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
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
        <Link href="/admin/songs" className="block hover:shadow-lg transition-shadow rounded-lg">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Biblioteca de Canciones</CardTitle>
              <CardDescription>
                Explora todas las canciones disponibles en el repertorio central.
              </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Contenido adicional puede ir aquí si es necesario */}
            </CardContent>
          </Card>
        </Link>
        <Link href="/setlists" className="block hover:shadow-lg transition-shadow rounded-lg">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Mis Setlists</CardTitle>
              <CardDescription>
                Crea y organiza tus setlists personalizados para los eventos.
              </CardDescription>
            </CardHeader>
            <CardContent>
               {/* Contenido adicional puede ir aquí si es necesario */}
            </CardContent>
          </Card>
        </Link>
      </div>
    </main>
  );
}
