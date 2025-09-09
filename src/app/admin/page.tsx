
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Upload, Bell } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (user?.email !== 'ueservicesllc1@gmail.com')) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || user?.email !== 'ueservicesllc1@gmail.com') {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-transparent text-foreground font-sans gap-4">
      <Header />
      <main className="flex-1 p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Panel de Administración</CardTitle>
            <CardDescription>Selecciona una opción para gestionar la aplicación.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <Button variant="outline" className="flex-1 justify-start p-6 text-lg">
                <Users className="mr-4 h-6 w-6" />
                Administrador de Usuarios
              </Button>
              <Button variant="outline" className="flex-1 justify-start p-6 text-lg">
                <Upload className="mr-4 h-6 w-6" />
                Subir Letras
              </Button>
              <Button variant="outline" className="flex-1 justify-start p-6 text-lg">
                <Bell className="mr-4 h-6 w-6" />
                Notificaciones
              </Button>
            </div>
            <div className="mt-6">
              <Link href="/" className="text-accent-foreground underline mt-4 inline-block">
                Volver a la aplicación principal
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
