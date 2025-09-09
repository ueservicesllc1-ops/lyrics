import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold">¡Bienvenido!</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Gestiona las letras de tus canciones y usa el teleprompter en vivo.
        </p>
      </div>
      <div className="mt-8 flex gap-4">
        <Link href="/teleprompter">
          <Button size="lg">Ir al Teleprompter</Button>
        </Link>
        <Link href="/setlists">
          <Button size="lg" variant="secondary">Crear Setlist</Button>
        </Link>
      </div>
    </main>
  );
}
