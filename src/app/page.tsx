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
} from 'firebase/firestore';
import SetlistCard from '@/components/SetlistCard';
import type { Setlist } from '@/app/setlists/page';
import { Search, PlusCircle, CheckCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';

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
               <Link href="/setlists" className='w-full'>
                <Button className="w-full">Crear Nuevo Setlist</Button>
               </Link>
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
