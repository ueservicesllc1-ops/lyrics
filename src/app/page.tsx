'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Rocket } from 'lucide-react';

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
    <main className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">Dashboard de Usuario</h1>
        <p className="text-muted-foreground">
          Gestiona tu música y tus eventos.
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Biblioteca de Canciones</CardTitle>
            <CardDescription>
              Repertorio central de canciones disponibles.
            </CardDescription>
            <Input
              placeholder="Buscar por título o artista..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-2"
            />
          </CardHeader>
          <CardContent className="flex-grow">
            {isLoadingSongs ? (
              <p>Cargando canciones...</p>
            ) : filteredSongs.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Artista</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSongs.map((song) => (
                      <TableRow key={song.id}>
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

        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Mis Setlists</CardTitle>
            <CardDescription>
              Tus setlists personales para próximos eventos.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {isLoadingSetlists ? (
              <p>Cargando setlists...</p>
            ) : setlists.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto p-1">
                {setlists.map((setlist) => (
                  <SetlistCard key={setlist.id} setlist={setlist} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Aún no has creado ningún setlist.
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/setlists" className='w-full'>
                <Button className='w-full'>Gestionar Setlists</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

       <div className="mt-8">
        <Link href="/setlists" passHref>
          <Button size="lg" className="w-full">
            <Rocket className="mr-2 h-5 w-5" />
            Iniciar Presentación
          </Button>
        </Link>
      </div>
    </main>
  );
}
