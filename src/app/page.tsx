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
} from 'firebase/firestore';
import SetlistCard from '@/components/SetlistCard';
import type { Setlist } from '@/app/setlists/page';
import { Search } from 'lucide-react';

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
           <Card className="h-full flex flex-col bg-card/80 backdrop-blur-sm border-border/20">
            <CardHeader>
              <CardTitle className="text-primary">Biblioteca de Canciones</CardTitle>
               <div className="relative mt-4">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-neutral-800 border-neutral-700 focus:ring-primary"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              {isLoadingSongs ? (
                <p>Cargando canciones...</p>
              ) : filteredSongs.length > 0 ? (
                <div className="overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-border/20">
                        <TableHead>Título</TableHead>
                        <TableHead>Artista</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSongs.map((song) => (
                        <TableRow key={song.id} className="border-b-border/20">
                          <TableCell className="font-medium">
                            {song.title}
                          </TableCell>
                          <TableCell>{song.artist || 'N/A'}</TableCell>
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
           <Card className="h-full flex flex-col bg-card/80 backdrop-blur-sm border-border/20">
            <CardHeader>
              <CardTitle className="text-primary">Mis Setlists</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              {isLoadingSetlists ? (
                <p>Cargando setlists...</p>
              ) : setlists.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {setlists.map((setlist) => (
                    <SetlistCard key={setlist.id} setlist={setlist} />
                  ))}
                   <Link href="/setlists" className='w-full mt-2'>
                        <Button variant="ghost" className="w-full text-left justify-between hover:bg-neutral-700/50 p-4 h-auto">
                            <div>
                                <p>Ver todos los Setlists</p>
                            </div>
                        </Button>
                   </Link>
                </div>
              ) : (
                 <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">
                        Aún no has creado ningún setlist.
                    </p>
                    <Link href="/setlists">
                        <Button className="bg-[#D4A32D] text-black hover:bg-[#D4A32D]/90 font-bold">
                            Crear Mi Primer Setlist
                        </Button>
                    </Link>
                </div>
              )}
            </CardContent>
             <CardFooter>
               <Link href="/setlists" className='w-full'>
                <Button className="w-full bg-[#D4A32D] text-black hover:bg-[#D4A32D]/90 font-bold">Crear Nuevo Setlist</Button>
               </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}
