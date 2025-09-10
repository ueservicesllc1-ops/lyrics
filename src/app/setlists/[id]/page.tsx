'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Trash2, Rocket } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';

// Interfaces
interface Song {
  id: string;
  title: string;
  artist: string;
  lyrics: string;
}

interface Setlist {
  id: string;
  name: string;
  date: string | { toDate: () => Date }; // Can be ISO string or Firestore Timestamp
  songs: string[];
  userId: string;
}

export default function SetlistDetailPage() {
  const router = useRouter();
  const params = useParams();
  const setlistId = params.id as string;
  
  const { user, loading: authLoading } = useAuth();

  const [setlist, setSetlist] = useState<Setlist | null>(null);
  const [songsInSetlist, setSongsInSetlist] = useState<Song[]>([]);
  const [availableSongs, setAvailableSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSetlistAndSongs = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      // Fetch the specific setlist document
      const setlistDocRef = doc(db, 'setlists', setlistId);
      const setlistDoc = await getDoc(setlistDocRef);

      if (!setlistDoc.exists() || setlistDoc.data().userId !== user.uid) {
        throw new Error('El setlist no fue encontrado o no tienes permiso para verlo.');
      }
      
      const setlistData = { id: setlistDoc.id, ...setlistDoc.data() } as Setlist;
      // Ensure songs array exists
      if (!setlistData.songs) {
        setlistData.songs = [];
      }
      setSetlist(setlistData);

      // Fetch all available songs from the general library
      const songsQuery = query(collection(db, 'songs'), orderBy('title', 'asc'));
      const songsSnapshot = await getDocs(songsQuery);
      const allSongsData = songsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Song));
      
      setAvailableSongs(allSongsData);

      // Filter songs that are in the current setlist
      if (setlistData.songs && setlistData.songs.length > 0) {
        // We need to fetch the full song details for the IDs in the setlist
        const songDetailsPromises = setlistData.songs.map(songId => getDoc(doc(db, 'songs', songId)));
        const songDetailsDocs = await Promise.all(songDetailsPromises);
        const songsIn = songDetailsDocs
            .filter(doc => doc.exists())
            .map(doc => ({ id: doc.id, ...doc.data() } as Song));
        setSongsInSetlist(songsIn);
      } else {
        setSongsInSetlist([]);
      }

    } catch (e: any) {
      console.error("Error fetching data: ", e);
      setError(e.message || 'No se pudieron cargar los datos del setlist.');
    } finally {
      setIsLoading(false);
    }
  }, [user, setlistId]);
  
  useEffect(() => {
    if (!authLoading) {
        if(user) {
            fetchSetlistAndSongs();
        } else {
            router.push('/login');
        }
    }
  }, [user, authLoading, fetchSetlistAndSongs, router]);


  const handleAddSongToSetlist = async () => {
    if (!selectedSong) return;
    setError(null);
    try {
      const setlistDocRef = doc(db, 'setlists', setlistId);
      await updateDoc(setlistDocRef, {
        songs: arrayUnion(selectedSong)
      });
      setSelectedSong('');
      await fetchSetlistAndSongs(); // Refresh data
    } catch (e: any) {
       console.error("Error adding song: ", e);
       setError('No se pudo añadir la canción. ' + e.message);
    }
  };
  
  const handleRemoveSongFromSetlist = async (songId: string) => {
    setError(null);
    try {
      const setlistDocRef = doc(db, 'setlists', setlistId);
      await updateDoc(setlistDocRef, {
        songs: arrayRemove(songId)
      });
      await fetchSetlistAndSongs(); // Refresh data
    } catch (e: any) {
      console.error("Error removing song: ", e);
      setError('No se pudo quitar la canción. ' + e.message);
    }
  };


  if (isLoading || authLoading) {
    return <div className="container mx-auto p-4 text-center">Cargando detalles del setlist...</div>;
  }

  if (error) {
     return (
      <main className="container mx-auto p-4">
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
             <Button variant="outline" onClick={() => router.push('/setlists')}>Volver a Setlists</Button>
        </div>
      </main>
    )
  }
  
  if (!setlist) {
    return <div className="container mx-auto p-4 text-center">No se encontró el setlist.</div>;
  }
  
  const setlistDate = typeof setlist.date === 'string'
    ? parseISO(setlist.date)
    : setlist.date.toDate();

  return (
    <main className="container mx-auto p-4">
       <header className="mb-8 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
         <div>
          <h1 className="text-4xl font-bold">{setlist.name}</h1>
          <p className="text-muted-foreground">{format(setlistDate, 'PPP')}</p>
        </div>
        <div className="flex items-center gap-2">
            <Link href="/">
                <Button variant="outline">Volver al Inicio</Button>
            </Link>
            <Button variant="outline" onClick={() => router.push('/setlists')}>
                Volver a Setlists
            </Button>
        </div>
      </header>
      
      <div className="grid gap-12 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Canciones en este Setlist</CardTitle>
            <CardDescription>Esta es la lista de canciones para el evento. El orden aquí no afecta al teleprompter.</CardDescription>
          </CardHeader>
          <CardContent>
            {songsInSetlist.length > 0 ? (
              <ul className="space-y-2">
                {songsInSetlist.map(song => (
                  <li key={song.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                    <span>{song.title} <span className="text-sm text-muted-foreground">- {song.artist || 'N/A'}</span></span>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveSongFromSetlist(song.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">Aún no hay canciones en este setlist.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Añadir Canción al Setlist</CardTitle>
            <CardDescription>Selecciona una canción de la biblioteca.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select onValueChange={setSelectedSong} value={selectedSong}>
              <SelectTrigger>
                <SelectValue placeholder="Elige una canción..." />
              </SelectTrigger>
              <SelectContent>
                {availableSongs.length > 0 ? availableSongs
                    .filter(song => !setlist?.songs?.includes(song.id))
                    .map(song => (
                      <SelectItem key={song.id} value={song.id}>
                        {song.title}
                      </SelectItem>
                    ))
                : <p className="p-4 text-sm text-muted-foreground">No hay más canciones disponibles.</p>}
              </SelectContent>
            </Select>
            <Button onClick={handleAddSongToSetlist} disabled={!selectedSong}>
              Añadir Canción
            </Button>
             {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
          </CardContent>
        </Card>
      </div>

       <div className="mt-12 text-center">
            <Link href={`/teleprompter?setlistId=${setlistId}`} passHref>
                <Button size="lg" disabled={songsInSetlist.length === 0}>
                    <Rocket className="mr-2 h-5 w-5" />
                    Iniciar Presentación
                </Button>
            </Link>
        </div>
    </main>
  );
}
