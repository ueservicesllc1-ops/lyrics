import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function AdminPage() {
  return (
    <main className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">Panel de Administración</h1>
        <p className="text-muted-foreground">
          Gestiona tus canciones y setlists.
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Canciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Añade nuevas canciones o edita las existentes en tu repertorio.
            </p>
            <Link href="/admin/songs">
              <Button>Gestionar Canciones</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Setlists</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Crea y organiza tus setlists para los eventos.
            </p>
            <Link href="/setlists">
              <Button variant="secondary">Gestionar Setlists</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
       <div className="mt-8">
        <Link href="/">
          <Button variant="outline">Volver al Inicio</Button>
        </Link>
      </div>
    </main>
  );
}
