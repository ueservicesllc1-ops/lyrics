'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import SetlistCard from '@/components/SetlistCard';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface Setlist {
  id: string;
  name: string;
  date: string;
  userId: string;
  songs: string[];
}

export default function SetlistsPage() {
  const [name, setName] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchSetlists = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const q = query(
        collection(db, 'setlists'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const setlistsData = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Setlist)
      );
      setSetlists(setlistsData);
    } catch (e) {
      console.error('Error fetching documents: ', e);
       if ((e as any).code === 'permission-denied') {
        setError('Error de permisos. Asegúrate de que las reglas de seguridad de Firestore estén bien configuradas.');
      } else {
        setError('No se pudieron cargar los setlists.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSetlists();
    }
  }, [user, fetchSetlists]);

  const handleCreateSetlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Debes estar autenticado para crear un setlist.');
      return;
    }
    if (!name || !date) {
      setError('El nombre y la fecha son obligatorios.');
      return;
    }
    setIsLoading(true);
    setError(null);
    
    const newSetlistData = {
      name,
      date: date.toISOString(),
      userId: user.uid,
    };
    
    try {
      await addDoc(collection(db, 'setlists'), newSetlistData);
      setName('');
      setDate(undefined);
      await fetchSetlists(); // Refresh the list
    } catch (e) {
      console.error('Error adding document: ', e);
       if ((e as any).code === 'permission-denied') {
           setError('No se pudo guardar. Revisa las reglas de seguridad de Firestore.');
       } else {
            setError(`No se pudo guardar el setlist.`);
       }
    } finally {
      setIsLoading(false);
    }
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
               {error && !isLoading && (
                <Alert variant="destructive" className="mb-4 w-full">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
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
          <CardContent className="space-y-4">
            {isLoading && setlists.length === 0 ? (
              <p>Cargando setlists...</p>
            ) : setlists.length === 0 && !error ? (
              <p className="text-muted-foreground text-center py-8">
                Aún no has creado ningún setlist.
              </p>
            ) : error ? (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            ) : (
              setlists.map((setlist) => (
                <SetlistCard key={setlist.id} setlist={setlist} />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
