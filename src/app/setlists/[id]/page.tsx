'use client';

import { useState, useEffect, useCallback, DragEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Trash2, Rocket, Search, ChevronRight, GripVertical, ArrowLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { Setlist } from '../page';

// Interfaces
interface Song {
  id: string;
  title: string;
  artist: string;
  lyrics: string;
}

export default function SetlistDetailPage() {
  const router = useRouter();
  const params = useParams();
  const setlistId = params.id as string;
  
  const { user, loading: authLoading } = useAuth();

  const [setlist, setSetlist] = useState<Setlist | null>(null);
  const [songsInSetlist, setSongsInSetlist] = useState<Song[]>([]);
  const [availableSongs, setAvailableSongs] = useState<Song[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Estados para reordenar
  const [draggedSong, setDraggedSong] = useState<Song | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);


  const fetchSetlistAndSongs = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      const setlistDocRef = doc(db, 'setlists', setlistId);
      const setlistDoc = await getDoc(setlistDocRef);

      if (!setlistDoc.exists() || setlistDoc.data().userId !== user.uid) {
        throw new Error('Setlist not found or you do not have permission to view it.');
      }
      
      const setlistData = { id: setlistDoc.id, ...setlistDoc.data() } as Setlist;
      if (!setlistData.songs) {
        setlistData.songs = [];
      }
      setSetlist(setlistData);

      const songsQuery = query(collection(db, 'songs'), orderBy('title', 'asc'));
      const songsSnapshot = await getDocs(songsQuery);
      const allSongsData = songsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Song));
      
      setAvailableSongs(allSongsData);

      // --- INICIO DE LA CORRECCIÓN ---
      // Asegurar que el orden de las canciones se preserve
      if (setlistData.songs && setlistData.songs.length > 0) {
        const songIds = setlistData.songs;
        // Obtenemos todas las canciones de la BD que están en la lista de IDs.
        const songsRef = collection(db, 'songs');
        const q = query(songsRef, where('__name__', 'in', songIds));
        const songDocsSnapshot = await getDocs(q);

        // Creamos un mapa para acceder fácilmente a los datos de cada canción por su ID.
        const songsMap = new Map<string, Song>();
        songDocsSnapshot.forEach(doc => {
            songsMap.set(doc.id, { id: doc.id, ...doc.data() } as Song);
        });

        // Mapeamos el array ordenado de IDs del setlist a los datos completos de las canciones.
        // Esto garantiza que el orden se mantenga.
        const orderedSongs = songIds
            .map(id => songsMap.get(id))
            .filter((song): song is Song => !!song); // Filtramos por si alguna canción fue eliminada

        setSongsInSetlist(orderedSongs);

      } else {
        setSongsInSetlist([]);
      }
      // --- FIN DE LA CORRECCIÓN ---

    } catch (e: any) {
      console.error("Error fetching data: ", e);
      setError(e.message || 'Could not load setlist data.');
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


  const handleAddSongToSetlist = async (songId: string) => {
    if (!songId || setlist?.songs?.includes(songId)) return;
    setError(null);
    try {
      const setlistDocRef = doc(db, 'setlists', setlistId);
      await updateDoc(setlistDocRef, {
        songs: arrayUnion(songId)
      });
      await fetchSetlistAndSongs();
    } catch (e: any) {
       console.error("Error adding song: ", e);
       setError('Could not add song. ' + e.message);
    }
  };
  
  const handleRemoveSongFromSetlist = async (songId: string) => {
    setError(null);
    try {
      const setlistDocRef = doc(db, 'setlists', setlistId);
      await updateDoc(setlistDocRef, {
        songs: arrayRemove(songId)
      });
      await fetchSetlistAndSongs();
    } catch (e: any) {
      console.error("Error removing song: ", e);
      setError('Could not remove song. ' + e.message);
    }
  };

  const handleLibraryDragStart = (e: DragEvent<HTMLLIElement>, songId: string) => {
    e.dataTransfer.setData('songId', songId);
  };

  const handleSetlistDragStart = (song: Song) => {
    setDraggedSong(song);
  };

  const handleSetlistDragEnter = (index: number) => {
    if (!draggedSong) return;
    setDragOverIndex(index);
  };

  const handleSetlistDragEnd = async () => {
    if (!draggedSong || dragOverIndex === null) return;
    
    const newOrder = [...songsInSetlist];
    const draggedIndex = newOrder.findIndex(s => s.id === draggedSong.id);
    
    // Remove the dragged song from its original position
    const [reorderedSong] = newOrder.splice(draggedIndex, 1);
    
    // Insert it at the new position
    newOrder.splice(dragOverIndex, 0, reorderedSong);

    // Update local state immediately for better UX
    setSongsInSetlist(newOrder);

    // Update Firestore with the new array of song IDs
    try {
        const newSongIds = newOrder.map(s => s.id);
        const setlistDocRef = doc(db, 'setlists', setlistId);
        await updateDoc(setlistDocRef, { songs: newSongIds });
    } catch (e) {
        console.error("Error updating song order: ", e);
        setError("Could not save the new song order.");
        // Optionally revert state if DB update fails
        fetchSetlistAndSongs();
    } finally {
        setDraggedSong(null);
        setDragOverIndex(null);
    }
  };


  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    setIsDraggingOver(false);
  };

  const handleDropOnSetlistArea = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const songId = e.dataTransfer.getData('songId');
    if (songId) {
      handleAddSongToSetlist(songId);
    }
  };

   const filteredAvailableSongs = availableSongs
    .filter(song => !setlist?.songs?.includes(song.id))
    .filter(song => 
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (song.artist && song.artist.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  if (isLoading || authLoading) {
    return <div className="flex justify-center items-center h-screen w-screen text-center">Loading setlist details...</div>;
  }

  if (error) {
     return (
      <main className="container mx-auto p-4">
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
             <Button variant="outline" onClick={() => router.push('/setlists')}>Back to Setlists</Button>
        </div>
      </main>
    )
  }
  
  if (!setlist) {
    return <div className="container mx-auto p-4 text-center">Setlist not found.</div>;
  }

  return (
    <main className="flex h-screen w-screen bg-background text-foreground">
       {/* Left Panel: Song Library */}
       <div className="w-1/2 md:w-2/5 lg:w-1/3 flex flex-col border-r bg-white">
            <header className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Song Library</h1>
                  <p className="text-sm opacity-80">Drag songs to your setlist</p>
                </div>
                 <Button variant="ghost" size="icon" onClick={() => router.push('/setlists')}>
                    <ArrowLeft className="h-5 w-5" />
                 </Button>
            </header>
            <div className="p-4">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search songs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-neutral-100 pl-9 border-neutral-200 focus-visible:ring-primary"
                    />
                </div>
            </div>
            <div className="flex-grow overflow-y-auto">
                <ul className="divide-y divide-gray-100">
                    {filteredAvailableSongs.length > 0 ? (
                        filteredAvailableSongs.map(song => (
                            <li 
                                key={song.id}
                                draggable="true"
                                onDragStart={(e) => handleLibraryDragStart(e, song.id)}
                                className="flex items-center justify-between p-2 cursor-grab active:cursor-grabbing hover:bg-secondary/50"
                            >
                                <div>
                                    <p className="font-semibold text-sm">{song.title}</p>
                                    <p className="text-xs text-muted-foreground">{song.artist || 'N/A'}</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </li>
                        ))
                    ) : (
                        <li className="p-4 text-center text-sm text-muted-foreground">
                            {availableSongs.length > 0 ? "No songs found." : "Library is empty."}
                        </li>
                    )}
                </ul>
            </div>
       </div>

        {/* Right Panel: Setlist */}
       <div className="w-1/2 md:w-3/5 lg:w-2/3 flex flex-col">
            <header className="flex items-center justify-between p-4 border-b">
                 <div>
                    <h1 className="text-2xl font-bold">{setlist.name}</h1>
                    <p className="text-muted-foreground">{format(parseISO(setlist.date as string), 'PPP')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/teleprompter?setlistId=${setlistId}`} passHref>
                        <Button disabled={songsInSetlist.length === 0} className='bg-accent hover:bg-accent/90 text-accent-foreground'>
                            <Rocket className="mr-2 h-4 w-4" />
                            Start
                        </Button>
                    </Link>
                </div>
            </header>
             <div 
                onDragOver={handleDragOver}
                onDrop={handleDropOnSetlistArea}
                onDragLeave={handleDragLeave}
                className={`flex-grow p-4 transition-colors duration-200 ${isDraggingOver ? 'bg-secondary' : 'bg-background'}`}
            >
                <div className={`h-full w-full border-2 border-dashed rounded-lg flex items-center justify-center ${isDraggingOver ? 'border-primary' : 'border-border'}`}>
                    {songsInSetlist.length > 0 ? (
                         <ul className="divide-y p-2 w-full">
                            {songsInSetlist.map((song, index) => (
                            <div key={song.id}>
                                {dragOverIndex === index && (
                                    <div className="h-1 bg-accent my-1 rounded-full"/>
                                )}
                                <li 
                                    className="flex items-center justify-between p-2 rounded-md hover:bg-white cursor-grab active:cursor-grabbing"
                                    draggable="true"
                                    onDragStart={() => handleSetlistDragStart(song)}
                                    onDragEnter={() => handleSetlistDragEnter(index)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDragEnd={handleSetlistDragEnd}
                                >
                                    <div className="flex items-center gap-4">
                                        <GripVertical className="h-5 w-5 text-muted-foreground/50"/>
                                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-sm font-bold">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <p className="font-semibold text-sm">{song.title}</p>
                                            <p className="text-xs text-muted-foreground">{song.artist || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveSongFromSetlist(song.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </li>
                            </div>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center">
                            <p className="text-muted-foreground font-semibold">
                                Drag songs here
                            </p>
                             <p className="text-sm text-muted-foreground mt-1">
                                Add from the library to build your setlist.
                            </p>
                        </div>
                    )}
                </div>
            </div>
       </div>
    </main>
  );
}

    