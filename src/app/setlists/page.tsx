'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
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
import { CalendarIcon, AlertTriangle, PlusCircle, Rocket } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import SetlistCard from '@/components/SetlistCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();

  const fetchSetlists = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const q = query(
        collection(db, 'setlists'),
        where('userId', '==', user.uid),
        orderBy('name', 'asc')
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
      songs: [], // Start with an empty array of songs
    };
    
    try {
      await addDoc(collection(db, 'setlists'), newSetlistData);
      setName('');
      setDate(undefined);
      await fetchSetlists(); // Refresh the list
      setIsDialogOpen(false); // Close the dialog on success
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
          <h1 className="text-4xl font-bold glow-primary-text">Mis Setlists</h1>
          <p className="text-muted-foreground">
            Crea y organiza tus setlists para los eventos.
          </p>
        </div>
        <div className="flex items-center gap-4">
           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="glow-primary-box">
                <PlusCircle className="mr-2 h-4 w-4" />
                Crear Nuevo Setlist
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md glassmorphism">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Setlist</DialogTitle>
                <DialogDescription>
                  Dale un nombre y una fecha a tu próximo evento. Haz clic en
                  crear cuando termines.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSetlist}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="setlist-name" className="text-right">
                      Nombre
                    </Label>
                    <Input
                      id="setlist-name"
                      placeholder="Ej: Servicio Dominical"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="setlist-date" className="text-right">
                      Fecha
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'col-span-3 justify-start text-left font-normal',
                            !date && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? (
                            format(date, 'PPP')
                          ) : (
                            <span>Elige una fecha</span>
                          )}
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
                   {error && !isLoading && (
                    <Alert variant="destructive" className="col-span-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isLoading} className="glow-primary-box">
                    {isLoading ? 'Creando...' : 'Crear Setlist'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Link href="/">
            <Button variant="outline">Volver al Inicio</Button>
          </Link>
        </div>
      </header>

      <div>
        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
            <CardDescription>
              Aquí aparecerán tus setlists guardados. Haz clic para añadir canciones y lanzar el teleprompter.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading && setlists.length === 0 ? (
              <p>Cargando setlists...</p>
            ) : setlists.length === 0 && !error ? (
              <p className="text-muted-foreground text-center py-8 col-span-full">
                Aún no has creado ningún setlist.
              </p>
            ) : error ? (
                <Alert variant="destructive" className="col-span-full">
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
       <div className="mt-8 text-center">
            <Button size="lg" disabled className="cursor-not-allowed">
                <Rocket className="mr-2 h-5 w-5" />
                Elige un setlist para iniciar la presentación
            </Button>
        </div>
    </main>
  );
}
