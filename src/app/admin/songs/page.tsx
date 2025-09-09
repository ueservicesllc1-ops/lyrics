'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
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
import { useAuth } from '@/context/AuthContext';

interface Song {
  id: string;
  title: string;
  artist: string;
  lyrics: string;
  userId: string;
}

export default function SongsPage() {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchSongs = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const q = query(collection(db, 'songs'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const songsData = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Song)
      );
      setSongs(songsData);
    } catch (e) {
      console.error('Error fetching documents: ', e);
      setError('No se pudieron cargar las canciones.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSongs();
    }
  }, [user, fetchSongs]);

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
      await addDoc(collection(db, 'songs'), {
        title,
        artist,
        lyrics,
        userId: user.uid,
      });
      setTitle('');
      setArtist('');
      setLyrics('');
      await fetchSongs(); // Refresh the list
    } catch (e) {
      console.error('Error adding document: ', e);
      setError('No se pudo guardar la canción.');
    } finally {
      setIsLoading(false);
    }
  };

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
             {isLoading && songs.length === 0 ? (
              <p>Cargando canciones...</p>
            ) : songs.length === 0 ? (
              <p>Aún no has añadido ninguna canción.</p>
            ) : (
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
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
