'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function SetlistsPage() {
  const [name, setName] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateSetlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date) {
      setError('El nombre y la fecha son obligatorios.');
      return;
    }
    setError(null);
    setIsLoading(true);

    // Lógica para guardar el setlist (se implementará más adelante)
    console.log({ name, date });

    setTimeout(() => {
      setIsLoading(false);
      // Lógica para después de guardar (ej. limpiar formulario, etc.)
    }, 1000);
  };

  return (
    <main className="container mx-auto p-4">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Mis Setlists</h1>
          <p className="text-muted-foreground">
            Crea y organiza tus setlists para los eventos.
          </p>
        </div>
        <Link href="/">
          <Button variant="outline">Volver al Inicio</Button>
        </Link>
      </header>

      <div className="grid gap-12 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Crear Nuevo Setlist</CardTitle>
            <CardDescription>
              Dale un nombre y una fecha a tu próximo evento.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateSetlist}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="setlist-name">Nombre</Label>
                <Input
                  id="setlist-name"
                  placeholder="Ej: Servicio Dominical"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="setlist-date">Día del servicio</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : <span>Elige una fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-start">
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creando...' : 'Crear Setlist'}
              </Button>
            </CardFooter>
          </form>
        </Card>
        <Card>
           <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
             <CardDescription>
              Aquí aparecerán tus setlists guardados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Aún no has creado ningún setlist.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
