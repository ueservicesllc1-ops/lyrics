'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  arrayUnion,
  addDoc,
} from 'firebase/firestore';
import SetlistCard from '@/components/SetlistCard';
import type { Setlist } from '@/app/setlists/page';
import { Search, PlusCircle, CheckCircle, CalendarIcon, AlertTriangle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';


interface Song {
  id: string;
  title: string;
  artist: string;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [isLoadingSetlists, setIsLoadingSetlists] = useState(true);

  const [feedback, setFeedback] = useState<{ songId: string; message: string } | null>(null);

  // State for the new setlist dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSetlistName, setNewSetlistName] = useState('');
  const [newSetlistDate, setNewSetlistDate] = useState<Date | undefined>();
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);


  const fetchSongs = useCallback(async () => {
    setIsLoadingSongs(true);
    try {
      const q = query(collection(db, 'songs'), orderBy('title', 'asc'));
      const querySnapshot = await getDocs(q);
      const songsData = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Song)
      );
      setSongs(songsData);
    } catch (e) {
      console.error('Error fetching songs: ', e);
    } finally {
      setIsLoadingSongs(false);
    }
  }, []);

  const fetchSetlists = useCallback(async () => {
    if (!user) return;
    setIsLoadingSetlists(true);
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
      console.error('Error fetching setlists: ', e);
    } finally {
      setIsLoadingSetlists(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user) {
      fetchSongs();
      fetchSetlists();
    }
  }, [user, loading, router, fetchSongs, fetchSetlists]);

  const handleAddSongToSetlist = async (songId: string, setlistId: string) => {
    try {
      const setlistRef = doc(db, 'setlists', setlistId);
      await updateDoc(setlistRef, {
        songs: arrayUnion(songId),
      });
      setFeedback({ songId, message: '¡Añadida!' });
      setTimeout(() => setFeedback(null), 2000); // Reset feedback after 2s
      fetchSetlists(); // Refresh setlist data to update song counts
    } catch (error) {
      console.error('Error adding song to setlist:', error);
      setFeedback({ songId, message: 'Error' });
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const handleCreateSetlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setCreateError('Debes estar autenticado para crear un setlist.');
      return;
    }
    if (!newSetlistName || !newSetlistDate) {
      setCreateError('El nombre y la fecha son obligatorios.');
      return;
    }
    setIsCreating(true);
    setCreateError(null);
    
    const newSetlistData = {
      name: newSetlistName,
      date: newSetlistDate.toISOString(),
      userId: user.uid,
      songs: [],
    };
    
    try {
      await addDoc(collection(db, 'setlists'), newSetlistData);
      setNewSetlistName('');
      setNewSetlistDate(undefined);
      await fetchSetlists();
      setIsDialogOpen(false);
    } catch (e) {
      console.error('Error adding document: ', e);
      setCreateError(`No se pudo guardar el setlist.`);
    } finally {
      setIsCreating(false);
    }
  };


  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (song.artist &&
        song.artist.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <main className="container mx-auto p-4 sm:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda - Biblioteca */}
        <div className="lg:col-span-2">
           <Card className="h-full flex flex-col card-metallic">
            <CardHeader>
              <CardTitle>Biblioteca de Canciones</CardTitle>
               <div className="relative mt-4">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar en la biblioteca..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              {isLoadingSongs ? (
                <p>Cargando canciones...</p>
              ) : filteredSongs.length > 0 ? (
                <div className="overflow-y-auto max-h-[60vh]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-border/60 hover:bg-transparent">
                        <TableHead>Título</TableHead>
                        <TableHead>Artista</TableHead>
                        <TableHead className='text-right'>Acción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSongs.map((song) => (
                        <TableRow key={song.id} className="border-b-border/60">
                          <TableCell className="font-medium">
                            {song.title}
                          </TableCell>
                          <TableCell>{song.artist || 'N/A'}</TableCell>
                          <TableCell className="text-right">
                             {feedback?.songId === song.id ? (
                                <div className='flex items-center justify-end gap-2 text-green-500'>
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-sm font-medium">{feedback.message}</span>
                                </div>
                            ) : (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className='h-8 w-8'>
                                        <PlusCircle className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Añadir a Setlist</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {isLoadingSetlists ? (
                                        <DropdownMenuItem disabled>Cargando...</DropdownMenuItem>
                                    ) : setlists.length > 0 ? (
                                        setlists.map((setlist) => (
                                            <DropdownMenuItem 
                                                key={setlist.id} 
                                                onClick={() => handleAddSongToSetlist(song.id, setlist.id)}
                                                disabled={setlist.songs?.includes(song.id)}
                                            >
                                                {setlist.name}
                                                {setlist.songs?.includes(song.id) && <CheckCircle className="h-4 w-4 ml-auto text-green-500"/>}
                                            </DropdownMenuItem>
                                        ))
                                    ) : (
                                        <DropdownMenuItem disabled>No hay setlists</DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  {songs.length > 0
                    ? 'No se encontraron canciones.'
                    : 'No hay canciones en la biblioteca.'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha - Setlists */}
        <div className="lg:col-span-1">
           <Card className="h-full flex flex-col card-metallic">
            <CardHeader>
              <CardTitle>Mis Setlists</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              {isLoadingSetlists ? (
                <p>Cargando setlists...</p>
              ) : setlists.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {setlists.map((setlist) => (
                    <SetlistCard key={setlist.id} setlist={setlist} />
                  ))}
                </div>
              ) : (
                 <div className="text-center py-4 flex flex-col items-center justify-center h-full">
                    <p className="text-muted-foreground mb-4">
                        Aún no has creado ningún setlist.
                    </p>
                </div>
              )}
            </CardContent>
             <CardFooter className="flex-col gap-4 items-stretch">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full">Crear Nuevo Setlist</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Crear Nuevo Setlist</DialogTitle>
                            <DialogDescription>
                            Dale un nombre y una fecha a tu próximo evento.
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
                                    placeholder="Ej: Concierto Acústico"
                                    value={newSetlistName}
                                    onChange={(e) => setNewSetlistName(e.target.value)}
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
                                            !newSetlistDate && 'text-muted-foreground'
                                        )}
                                        >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {newSetlistDate ? (
                                            format(newSetlistDate, 'PPP')
                                        ) : (
                                            <span>Elige una fecha</span>
                                        )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                        mode="single"
                                        selected={newSetlistDate}
                                        onSelect={setNewSetlistDate}
                                        initialFocus
                                        />
                                    </PopoverContent>
                                    </Popover>
                                </div>
                                {createError && !isCreating && (
                                    <Alert variant="destructive" className="col-span-4">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>{createError}</AlertDescription>
                                    </Alert>
                                )}
                            </div>
                            <DialogFooter>
                            <Button type="submit" disabled={isCreating} className='bg-accent hover:bg-accent/90 text-accent-foreground'>
                                {isCreating ? 'Creando...' : 'Crear Setlist'}
                            </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
               <Link href="/setlists" className='w-full'>
                <Button className="w-full" variant="secondary">Ir a Mis Setlists</Button>
               </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}
