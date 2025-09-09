'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, PlusCircle, MinusCircle, Clapperboard } from 'lucide-react';
import { format } from 'date-fns';
import type { Setlist } from '../page';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';


// Asumimos que la interfaz Song también está disponible o la definimos aquí
interface Song {
  id: string;
  title: string;
  artist: string;
  userId: string;
}

export default function SetlistDetailPage() {
  const [setlist, setSetlist] = useState<Setlist | null>(null);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [setlistSongs, setSetlistSongs] = useState<Song[]>([]);
  const [availableSongs, setAvailableSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const setlistId = params.id as string;
  const isLocal = setlistId.startsWith('local-');

  const fetchSetlistAndSongs = useCallback(async () => {
    if (!user || !setlistId) return;
    setIsLoading(true);
    setError(null);

    try {
      // --- SIMULACIÓN PARA IDs LOCALES ---
      if (isLocal) {
        // Para la demo, creamos un setlist falso si el ID es local
        // Nota: esto no persistirá datos entre páginas, es solo para la vista
        const localSetlist: Setlist = {
            id: setlistId,
            name: "Setlist de Demostración",
            date: Timestamp.now(),
            userId: user.uid,
            songs: [],
        };
        setSetlist(localSetlist);
      } else {
        // --- LÓGICA DE FIRESTORE (cuando funcione) ---
        const docRef = doc(db, 'setlist', setlistId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().userId === user.uid) {
          setSetlist({ id: docSnap.id, ...docSnap.data() } as Setlist);
        } else {
          setError('Setlist no encontrado o no tienes permiso para verlo.');
          setIsLoading(false);
          return;
        }
      }

      // Obtener todas las canciones del usuario
      const songsQuery = query(
        collection(db, 'songs'),
        where('userId', '==', user.uid)
      );
      const songsSnapshot = await getDocs(songsQuery);
      const allUserSongs = songsSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Song)
      );
      setAllSongs(allUserSongs);

    } catch (e) {
      console.error('Error fetching data: ', e);
      setError('No se pudieron cargar los datos del setlist.');
    } finally {
      setIsLoading(false);
    }
  }, [user, setlistId, isLocal]);
  
  useEffect(() => {
    fetchSetlistAndSongs();
  }, [fetchSetlistAndSongs]);

  useEffect(() => {
    if (setlist && allSongs.length > 0) {
      const songsInSetlist = allSongs.filter(song => setlist.songs.includes(song.id));
      const songsNotInSetlist = allSongs.filter(song => !setlist.songs.includes(song.id));
      setSetlistSongs(songsInSetlist);
      setAvailableSongs(songsNotInSetlist);
    } else if (setlist) {
        // Caso en el que el setlist existe pero no hay canciones en la librería
        setSetlistSongs([]);
        setAvailableSongs([]);
    }
  }, [setlist, allSongs]);

  const handleAddSong = (songId: string) => {
    if (!setlist) return;
    
    // Lógica local para simulación
    const newSongIds = [...setlist.songs, songId];
    const updatedSetlist = { ...setlist, songs: newSongIds };
    setSetlist(updatedSetlist);
  };
  
  const handleRemoveSong = (songId: string) => {
    if (!setlist) return;

    // Lógica local para simulación
    const newSongIds = setlist.songs.filter(id => id !== songId);
    const updatedSetlist = { ...setlist, songs: newSongIds };
    setSetlist(updatedSetlist);
  };


  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p>Cargando detalles del setlist...</p></div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center"><p className="text-red-500">{error}</p><Button onClick={() => router.push('/setlists')} className="mt-4">Volver</Button></div>;
  }

  if (!setlist) {
    return <div className="container mx-auto p-4 text-center"><p>No se encontró el setlist.</p><Button onClick={() => router.push('/setlists')} className="mt-4">Volver</Button></div>;
  }

  return (
    <main className="container mx-auto p-4">
      <header className="mb-8">
        <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold">{setlist.name}</h1>
                <TooltipProvider>
                    <Tooltip>
                    <TooltipTrigger>
                        <div
                        className={`h-4 w-4 rounded-full ${
                            isLocal ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>
                        {isLocal
                            ? 'Cambios no guardados en la nube.'
                            : 'Setlist guardado en Firestore.'}
                        </p>
                    </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
              </div>
                <p className="text-muted-foreground">{format(setlist.date.toDate(), 'PPP')}</p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.push('/setlists')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                </Button>
                <Button>
                    <Clapperboard className="mr-2 h-4 w-4" /> Teleprompter
                </Button>
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Columna de Canciones Disponibles */}
        <Card>
          <CardHeader>
            <CardTitle>Canciones en la Biblioteca</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[60vh] overflow-y-auto">
            {availableSongs.length > 0 ? availableSongs.map(song => (
              <div key={song.id} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary">
                <span>{song.title} <span className="text-xs text-muted-foreground">{song.artist}</span></span>
                <Button variant="ghost" size="icon" onClick={() => handleAddSong(song.id)}>
                  <PlusCircle className="h-5 w-5 text-green-500" />
                </Button>
              </div>
            )) : <p className="text-muted-foreground text-center p-4">Todas tus canciones ya están en el setlist.</p>}
          </CardContent>
        </Card>

        {/* Columna de Canciones en el Setlist */}
        <Card>
          <CardHeader>
            <CardTitle>Canciones en este Setlist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[60vh] overflow-y-auto">
             {setlistSongs.length > 0 ? setlistSongs.map(song => (
              <div key={song.id} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary">
                <span>{song.title} <span className="text-xs text-muted-foreground">{song.artist}</span></span>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveSong(song.id)}>
                  <MinusCircle className="h-5 w-5 text-red-500" />
                </Button>
              </div>
            )) : <p className="text-muted-foreground text-center p-4">Añade canciones desde tu biblioteca.</p>}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
