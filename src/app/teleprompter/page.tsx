'use client';

import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Play, Pause, RefreshCw, AlertTriangle, LogOut } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';

interface Song {
  id: string;
  title: string;
  artist: string;
  lyrics: string;
}

function TeleprompterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setlistId = searchParams.get('setlistId');

  const [songs, setSongs] = useState<Song[]>([]);
  const [lyrics, setLyrics] = useState('');
  const [setlistName, setlistSetName] = useState('');
  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [scrollSpeed, setScrollSpeed] = useState(5);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isMirrored, setIsMirrored] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  useEffect(() => {
    const fetchSetlistData = async () => {
      if (!setlistId) {
        setError('No se ha proporcionado un ID de setlist.');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const setlistDocRef = doc(db, 'setlists', setlistId);
        const setlistDoc = await getDoc(setlistDocRef);

        if (!setlistDoc.exists()) {
          throw new Error('Setlist no encontrado.');
        }

        const setlistData = setlistDoc.data();
        setlistSetName(setlistData.name);
        const songIds = setlistData.songs as string[];

        if (songIds.length === 0) {
          setSongs([]);
          setLyrics('Este setlist no tiene canciones.');
          setIsLoading(false);
          return;
        }

        // Fetch all songs in one go
        const songsRef = collection(db, 'songs');
        const q = query(songsRef, where('__name__', 'in', songIds));
        const songsSnapshot = await getDocs(q);
        
        const fetchedSongs: Record<string, Song> = {};
        songsSnapshot.forEach(doc => {
            fetchedSongs[doc.id] = { id: doc.id, ...doc.data() } as Song;
        });

        // Maintain the order from the setlist
        const orderedSongs = songIds.map(id => fetchedSongs[id]).filter(Boolean);

        setSongs(orderedSongs);
        const combinedLyrics = orderedSongs
          .map(
            (song) =>
              `--- ${song.title.toUpperCase()} ---\n\n${song.lyrics}`
          )
          .join('\n\n\n');
        setLyrics(combinedLyrics);

      } catch (e: any) {
        setError(e.message || 'No se pudo cargar el setlist.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSetlistData();
  }, [setlistId]);

  const stopScrolling = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
    setIsScrolling(false);
  }, []);

  const startScrolling = useCallback(() => {
    if (scrollIntervalRef.current) return;
    setIsScrolling(true);
    scrollIntervalRef.current = setInterval(() => {
      if (contentRef.current) {
        contentRef.current.scrollTop += 1;
        if (
          contentRef.current.scrollTop + contentRef.current.clientHeight >=
          contentRef.current.scrollHeight
        ) {
          stopScrolling();
        }
      }
    }, 100 - scrollSpeed * 9); // Adjusted for better speed range
  }, [scrollSpeed, stopScrolling]);

  const resetScroll = () => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    if (isScrolling) {
      stopScrolling();
      startScrolling();
    }
  };

  useEffect(() => {
    if (isScrolling) {
      stopScrolling();
      startScrolling();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollSpeed]);
  
  useEffect(() => {
    return () => stopScrolling(); // Cleanup on unmount
  }, [stopScrolling]);

  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = (api: CarouselApi) => {
      setCurrentSongIndex(api.selectedScrollSnap());
      scrollToSong(api.selectedScrollSnap());
    };

    carouselApi.on('select', onSelect);

    return () => {
      carouselApi.off('select', onSelect);
    };
  }, [carouselApi, songs]); // Added songs dependency

  const scrollToSong = (index: number) => {
    if (!contentRef.current || !songs[index]) return;
    const songTitleId = `--- ${songs[index].title.toUpperCase()} ---`;
    const fullText = contentRef.current.innerText;
    const position = fullText.indexOf(songTitleId);
    
    // This is an approximation
    const totalLines = fullText.split('\n').length;
    const lineOfSong = fullText.substring(0, position).split('\n').length;
    const scrollRatio = lineOfSong / totalLines;
    
    contentRef.current.scrollTop = contentRef.current.scrollHeight * scrollRatio;
    resetScroll(); // Reset scroll to start from the top of the song
  };

  const handleCarouselSelect = (index: number) => {
      carouselApi?.scrollTo(index);
  }

  if (isLoading) {
    return <div className="text-center p-8">Cargando teleprompter...</div>;
  }

  if (error) {
    return (
      <main className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </main>
    );
  }

  return (
    <div className="container mx-auto p-4 flex flex-col items-center gap-8">
      <Card className="w-full max-w-5xl glassmorphism">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="glow-primary-text">{setlistName}</CardTitle>
              <CardDescription>
                En reproducción: {songs[currentSongIndex]?.title || 'Setlist cargado'}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => router.back()}>
              <LogOut className="mr-2 h-4 w-4" />
              Salir
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div
            ref={contentRef}
            className={`h-[60vh] overflow-y-scroll bg-neutral-900/80 text-white p-8 text-5xl leading-relaxed font-sans border rounded-md whitespace-pre-wrap transition-transform duration-300 text-center ${
              isMirrored ? 'scale-x-[-1]' : ''
            }`}
            style={{ textShadow: '0 0 10px rgba(255, 255, 255, 0.7)'}}
          >
            {lyrics}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-6">
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                 <div className="flex items-center gap-4">
                    <Button
                    onClick={isScrolling ? stopScrolling : startScrolling}
                    variant="outline"
                    size="icon"
                    aria-label={isScrolling ? 'Pause' : 'Play'}
                    className="w-12 h-12 rounded-full"
                    >
                    {isScrolling ? (
                        <Pause className="h-6 w-6" />
                    ) : (
                        <Play className="h-6 w-6" />
                    )}
                    </Button>
                    <Button
                    onClick={resetScroll}
                    variant="outline"
                    size="icon"
                    aria-label="Reset"
                    className="w-12 h-12 rounded-full"
                    >
                    <RefreshCw className="h-6 w-6" />
                    </Button>
                </div>

                <div className="flex items-center gap-2 w-full max-w-xs">
                    <Label htmlFor="speed">Velocidad</Label>
                    <Slider
                    id="speed"
                    min={1}
                    max={10}
                    step={1}
                    value={[scrollSpeed]}
                    onValueChange={(value) => setScrollSpeed(value[0])}
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <Switch
                    id="mirror-mode"
                    checked={isMirrored}
                    onCheckedChange={setIsMirrored}
                    />
                    <Label htmlFor="mirror-mode">Modo Espejo</Label>
                </div>
            </div>
            {songs.length > 0 && (
            <div className='w-full max-w-2xl'>
                 <Carousel setApi={setCarouselApi} className="w-full">
                    <CarouselContent>
                        {songs.map((song, index) => (
                        <CarouselItem key={song.id} className="basis-1/2 md:basis-1/3">
                            <Button
                            variant={index === currentSongIndex ? 'secondary' : 'outline'}
                            className="w-full truncate"
                            onClick={() => handleCarouselSelect(index)}
                            >
                            {song.title}
                            </Button>
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}


export default function TeleprompterPage() {
    return (
        <Suspense fallback={<div className="text-center p-8">Cargando...</div>}>
            <TeleprompterContent />
        </Suspense>
    )
}
