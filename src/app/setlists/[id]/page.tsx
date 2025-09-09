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
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, PlusCircle, MinusCircle, Clapperboard, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Setlist } from '../page';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
      const docRef = doc(db, 'setlist', setlistId);
      const docSnap = await getDoc(docRef);

      let currentSetlist: Setlist | null = null;
      if (docSnap.exists() && docSnap.data().userId === user.uid) {
          currentSetlist = { id: docSnap.id, ...docSnap.data() } as Setlist;
          // El campo 'songs' puede no existir en la creación inicial
          if (!currentSetlist.songs) {
            currentSetlist.songs = [];
          }
          setSetlist(currentSetlist);
      } else {
          setError('Setlist no encontrado o no tienes permiso para verlo.');
          setIsLoading(false);
          return;
      }

      const songsQuery = query(
        collection(db, 'songs'),
        where('userId', '==', user.uid)
      );
      const songsSnapshot = await getDocs(songsQuery);
      const allUserSongs = songsSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Song)
      );
      setAllSongs(allUserSongs);

      if (currentSetlist) {
         const songsInSetlist = allUserSongs.filter(song => currentSetlist!.songs.includes(song.id));
         const songsNotInSetlist = allUserSongs.filter(song => !currentSetlist!.songs.includes(song.id));
         setSetlistSongs(songsInSetlist);
         setAvailableSongs(songsNotInSetlist);
      }

    } catch (e: any) {
      console.error('Error fetching data: ', e);
       if (e.code === 'permission-denied') {
           setError('Error de permisos al cargar los datos. Revisa las reglas de seguridad de Firestore.');
       } else {
           setError(`No se pudieron cargar los datos del setlist: ${e.message}`);
       }
    } finally {
      setIsLoading(false);
    }
  }, [user, setlistId]);
  
  useEffect(() => {
    fetchSetlistAndSongs();
  }, [fetchSetlistAndSongs]);

  const updateSongLists = (songId: string, action: 'add' | 'remove') => {
    let songToMove: Song | undefined;
    let updatedAvailableSongs = [...availableSongs];
    let updatedSetlistSongs = [...setlistSongs];

    if (action === 'add') {
        songToMove = availableSongs.find(s => s.id === songId);
        if (songToMove) {
            updatedAvailableSongs = availableSongs.filter(s => s.id !== songId);
            updatedSetlistSongs = [...setlistSongs, songToMove];
        }
    } else {
        songToMove = setlistSongs.find(s => s.id === songId);
        if (songToMove) {
            updatedSetlistSongs = setlistSongs.filter(s => s.id !== songId);
            updatedAvailableSongs = [...availableSongs, songToMove];
        }
    }
    
    setAvailableSongs(updatedAvailableSongs);
    setSetlistSongs(updatedSetlistSongs);
  };
  
  const handleAddSong = async (songId: string) => {
    if (isLocal) return;
    setError(null);
    try {
        const setlistRef = doc(db, "setlist", setlistId);
        await updateDoc(setlistRef, {
            songs: arrayUnion(songId)
        });
        updateSongLists(songId, 'add');
    } catch(e: any) {
        console.error("Error adding song: ", e);
        setError(`No se pudo añadir la canción: ${e.message}`);
    }
  };
  
  const handleRemoveSong = async (songId: string) => {
    if (isLocal) return;
    setError(null);
    try {
        const setlistRef = doc(db, "setlist", setlistId);
        await updateDoc(setlistRef, {
            songs: arrayRemove(songId)
        });
        updateSongLists(songId, 'remove');
    } catch(e: any) {
        console.error("Error removing song: ", e);
        setError(`No se pudo quitar la canción: ${e.message}`);
    }
  };

  const getSetlistDate = () => {
      if (!setlist) return null;
      // Firestore puede devolver Timestamp o un string si lo guardamos así.
      return typeof setlist.date === 'string' 
        ? parseISO(setlist.date as any) 
        : (setlist.date as Timestamp).toDate();
  }


  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p>Cargando detalles del setlist...</p></div>;
  }
  
  if (error && !setlist) {
    return (
      <div className="container mx-auto p-4 text-center">
         <Alert variant="destructive" className="mb-8 max-w-md mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/setlists')} className="mt-4">Volver</Button>
      </div>
    );
  }

  if (!setlist) {
    return <div className="container mx-auto p-4 text-center"><p>No se encontró el setlist.</p><Button onClick={() => router.push('/setlists')} className="mt-4">Volver</Button></div>;
  }

  return (
    <main className="container mx-auto p-4">
      <header className="mb-8">
        <div className="flex justify-between items-start">
            {setlist && (
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
                    <p className="text-muted-foreground">{format(getSetlistDate()!, 'PPP')}</p>
                </div>
            )}
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

      {error && (
         <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
                <Button variant="ghost" size="icon" onClick={() => handleAddSong(song.id)} disabled={isLocal}>
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
          </Header>
          <CardContent className="space-y-2 max-h-[60vh] overflow-y-auto">
             {setlistSongs.length > 0 ? setlistSongs.map(song => (
              <div key={song.id} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary">
                <span>{song.title} <span className="text-xs text-muted-foreground">{song.artist}</span></span>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveSong(song.id)} disabled={isLocal}>
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
