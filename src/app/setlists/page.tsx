import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SetlistsPage() {
  return (
    <main className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">Mis Setlists</h1>
        <p className="text-muted-foreground">
          Crea y organiza tus setlists para los eventos.
        </p>
      </header>
      <div className="text-center py-16 border-dashed border-2 rounded-lg">
        <h2 className="text-2xl font-semibold">¡Próximamente!</h2>
        <p className="text-muted-foreground mt-2">
          La funcionalidad para crear y gestionar setlists estará disponible muy pronto.
        </p>
      </div>
       <div className="mt-8">
        <Link href="/admin">
          <Button variant="outline">Volver al Panel</Button>
        </Link>
      </div>
    </main>
  );
}
