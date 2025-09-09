'use client';

import { useState, useEffect } from 'react';
import { db, auth, onAuthStateChanged } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';

interface Song {
  id: string;
  title: string;
  artist: string;
  lyrics: string;
}

export default function SongsPage() {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const fetchSongs = async () => {
    if (!user) return;
    try {
      const querySnapshot = await getDocs(collection(db, 'songs'));
      const songsData = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Song)
      );
      setSongs(songsData);
    } catch (e) {
      console.error('Error fetching documents: ', e);
      setError('No se pudieron cargar las canciones. Revisa los permisos de la base de datos.');
    }
  };

  useEffect(() => {
    if (user) {
      fetchSongs();
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Debes estar autenticado para añadir canciones.');
      return;
    }
    if (!title || !lyrics) {
      setError('El título y la letra son obligatorios.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const docRef = await addDoc(collection(db, 'songs'), {
        title,
        artist,
        lyrics,
        userId: user.uid,
      });
      console.log('Document written with ID: ', docRef.id);
      setTitle('');
      setArtist('');
      setLyrics('');
      await fetchSongs(); // Refresh the list
    } catch (e) {
      console.error('Error adding document: ', e);
      setError('No se pudo guardar la canción. Revisa los permisos de la base de datos.');
    } finally {
      setIsLoading(false);
    }
  };
  
    if (!user) {
    return (
      <main className="container mx-auto p-4 flex justify-center items-center h-screen">
        <p>Autenticando...</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4">
       <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Mis Canciones</h1>
          <p className="text-muted-foreground">
            Añade y gestiona las canciones de tu repertorio.
          </p>
        </div>
        <Link href="/admin">
          <Button variant="outline">Volver al Panel</Button>
        </Link>
      </header>

      <div className="grid gap-12 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Añadir Nueva Canción</CardTitle>
            <CardDescription>
              Completa los detalles y haz clic en guardar.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleAddSong}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title">Título</label>
                <Input
                  id="title"
                  placeholder="Título de la canción"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="artist">Artista (Opcional)</label>
                <Input
                  id="artist"
                  placeholder="Nombre del artista"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lyrics">Letra</label>
                <Textarea
                  id="lyrics"
                  placeholder="Escribe la letra de la canción aquí..."
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  className="h-48"
                />
              </div>
            </CardContent>
            <CardFooter className='flex-col items-start'>
               {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Guardando...' : 'Guardar Canción'}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Repertorio</CardTitle>
             <CardDescription>
              Esta es tu lista de canciones guardadas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Artista</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {songs.map((song) => (
                  <TableRow key={song.id}>
                    <TableCell className="font-medium">{song.title}</TableCell>
                    <TableCell>{song.artist || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
