'use client';

import { useState, useEffect, useCallback, DragEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Trash2, Rocket, Search, ChevronRight, GripVertical } from 'lucide-react';
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

      if (setlistData.songs && setlistData.songs.length > 0) {
        const songDetailsPromises = setlistData.songs.map(songId => getDoc(doc(db, 'songs', songId)));
        const songDetailsDocs = await Promise.all(songDetailsPromises);
        
        const songsInSetlistMap = new Map<string, Song>();
        songDetailsDocs.forEach(doc => {
            if (doc.exists()) {
                const song = { id: doc.id, ...doc.data() } as Song;
                songsInSetlistMap.set(song.id, song);
            }
        });
        
        const orderedSongs = setlistData.songs
            .map(songId => songsInSetlistMap.get(songId))
            .filter((song): song is Song => !!song);
            
        setSongsInSetlist(orderedSongs);

      } else {
        setSongsInSetlist([]);
      }

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

  const handleDragStart = (e: DragEvent<HTMLLIElement>, songId: string) => {
    e.dataTransfer.setData('songId', songId);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
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
    return <div className="container mx-auto p-4 text-center">Loading setlist details...</div>;
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
    <main className="flex h-screen w-screen bg-background">
       {/* Left Panel: Song Library */}
       <div className="w-1/2 md:w-2/5 lg:w-1/3 flex flex-col border-r">
            <header className="bg-primary text-primary-foreground p-4">
                <h1 className="text-2xl font-bold">Song Library</h1>
                <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-foreground/70" />
                    <Input 
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white/20 text-primary-foreground placeholder:text-primary-foreground/70 pl-9 border-0 focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-white"
                    />
                </div>
            </header>
            <div className="flex-grow overflow-y-auto">
                <ul className="divide-y">
                    {filteredAvailableSongs.length > 0 ? (
                        filteredAvailableSongs.map(song => (
                            <li 
                                key={song.id}
                                draggable="true"
                                onDragStart={(e) => handleDragStart(e, song.id)}
                                className="flex items-center justify-between p-4 cursor-grab active:cursor-grabbing hover:bg-secondary"
                            >
                                <div>
                                    <p className="font-semibold">{song.title}</p>
                                    <p className="text-sm text-muted-foreground">{song.artist || 'N/A'}</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </li>
                        ))
                    ) : (
                        <li className="p-4 text-center text-muted-foreground">
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
                        <Button disabled={songsInSetlist.length === 0}>
                            <Rocket className="mr-2 h-4 w-4" />
                            Start
                        </Button>
                    </Link>
                    <Button variant="outline" onClick={() => router.push('/setlists')}>
                       Back
                    </Button>
                     <Button variant="ghost" size="icon">
                        <GripVertical className="h-5 w-5" />
                    </Button>
                </div>
            </header>
             <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragLeave={handleDragLeave}
                className={`flex-grow p-4 bg-white transition-colors duration-200 ${isDraggingOver ? 'bg-secondary' : ''}`}
            >
                <div className={`h-full w-full border-2 border-dashed rounded-lg ${isDraggingOver ? 'border-primary' : 'border-border'}`}>
                    {songsInSetlist.length > 0 ? (
                         <ul className="divide-y p-2">
                            {songsInSetlist.map((song, index) => (
                            <li key={song.id} className="flex items-center justify-between p-3 rounded-md hover:bg-secondary">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-accent text-accent-foreground text-sm font-bold">
                                        {index + 1}
                                    </span>
                                    <div>
                                        <p className="font-semibold">{song.title}</p>
                                        <p className="text-sm text-muted-foreground">{song.artist || 'N/A'}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveSongFromSetlist(song.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground">
                                Drag songs here
                            </p>
                        </div>
                    )}
                </div>
            </div>
       </div>
    </main>
  );
}
