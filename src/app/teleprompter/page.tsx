'use client';

import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Play, Pause, RefreshCw, AlertTriangle, X, Minus, Plus, Text } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

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
  const [fontSize, setFontSize] = useState('text-6xl');
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

        const songsRef = collection(db, 'songs');
        const q = query(songsRef, where('__name__', 'in', songIds));
        const songsSnapshot = await getDocs(q);
        
        const fetchedSongs: Record<string, Song> = {};
        songsSnapshot.forEach(doc => {
            fetchedSongs[doc.id] = { id: doc.id, ...doc.data() } as Song;
        });

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
    }, 100 - scrollSpeed * 9);
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
  
    const scrollToSong = useCallback((index: number) => {
    if (!contentRef.current || !songs[index]) return;
    const songTitleId = `--- ${songs[index].title.toUpperCase()} ---`;
    const fullText = contentRef.current.innerText;
    const position = fullText.indexOf(songTitleId);
    
    if (position === -1) return;

    const totalLines = fullText.split('\n').length;
    const lineOfSong = fullText.substring(0, position).split('\n').length;
    
    // A bit of a hacky way to estimate scroll position, might need refinement
    const scrollRatio = (lineOfSong - 1) / totalLines;
    
    contentRef.current.scrollTop = contentRef.current.scrollHeight * scrollRatio;
    // Don't reset scroll, just move to the position.
    // resetScroll(); 
  }, [songs]);


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
  }, [carouselApi, songs, scrollToSong]);

  const handleCarouselSelect = (index: number) => {
      carouselApi?.scrollTo(index);
  }

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
      const sizes = {
          small: 'text-5xl',
          medium: 'text-6xl',
          large: 'text-7xl'
      };
      setFontSize(sizes[size]);
  };


  if (isLoading) {
    return <div className="flex justify-center items-center h-screen w-screen bg-neutral-900 text-white text-xl">Cargando teleprompter...</div>;
  }

  if (error) {
    return (
      <main className="flex justify-center items-center h-screen w-screen bg-background">
        <div className="container max-w-lg">
            <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button variant="outline" onClick={() => router.back()} className="mt-4">
                Volver
            </Button>
        </div>
      </main>
    );
  }

  return (
    <div className="h-screen w-screen bg-neutral-900 text-white flex flex-col font-sans">
      
       <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.back()}
            className="fixed top-4 right-4 z-50 h-12 w-12 rounded-full bg-black/30 hover:bg-black/50 text-white hover:text-white"
        >
            <X className="h-6 w-6" />
        </Button>

      <div
        ref={contentRef}
        className={cn(`flex-grow overflow-y-scroll p-16 leading-relaxed whitespace-pre-wrap transition-all duration-300 text-center`,
          fontSize,
          isMirrored ? 'scale-x-[-1]' : ''
        )}
      >
        {lyrics}
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-50 p-2 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
        <div className="max-w-5xl mx-auto bg-black/30 backdrop-blur-sm p-2 rounded-xl border border-white/10 shadow-lg">
            <div className="flex flex-col gap-2">
                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                    
                    {/* Left Controls */}
                    <div className="flex-1 flex justify-start">
                        <Button
                        onClick={resetScroll}
                        variant="outline"
                        size="icon"
                        aria-label="Reset"
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white border-white/20"
                        >
                        <RefreshCw className="h-5 w-5" />
                        </Button>
                    </div>
                    
                    {/* Center Control */}
                    <div className="flex-shrink-0">
                        <Button
                        onClick={isScrolling ? stopScrolling : startScrolling}
                        aria-label={isScrolling ? 'Pause' : 'Play'}
                        className="w-14 h-14 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground"
                        >
                        {isScrolling ? (
                            <Pause className="h-8 w-8" />
                        ) : (
                            <Play className="h-8 w-8 ml-1" />
                        )}
                        </Button>
                    </div>

                    {/* Right Controls */}
                    <div className="flex-1 flex justify-end items-center gap-4">
                        <div className="flex items-center gap-2">
                           <Button onClick={() => handleFontSizeChange('small')} variant={fontSize === 'text-5xl' ? 'secondary' : 'outline'} size="icon" className="h-9 w-9 bg-white/10 hover:bg-white/20 text-white border-white/20">
                             <span className='font-bold text-xs'>A</span>
                           </Button>
                           <Button onClick={() => handleFontSizeChange('medium')} variant={fontSize === 'text-6xl' ? 'secondary' : 'outline'} size="icon" className="h-9 w-9 bg-white/10 hover:bg-white/20 text-white border-white/20">
                             <span className='font-bold text-sm'>A</span>
                           </Button>
                           <Button onClick={() => handleFontSizeChange('large')} variant={fontSize === 'text-7xl' ? 'secondary' : 'outline'} size="icon" className="h-9 w-9 bg-white/10 hover:bg-white/20 text-white border-white/20">
                             <span className='font-bold text-base'>A</span>
                           </Button>
                        </div>
                        <div className="flex items-center gap-2 w-full max-w-[180px]">
                            <Label htmlFor="speed" className='shrink-0 text-xs'>Velocidad</Label>
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
                            <Label htmlFor="mirror-mode" className='text-xs'>Espejo</Label>
                        </div>
                    </div>
                </div>
                 {songs.length > 0 && (
                <div className='w-full pt-2'>
                    <Carousel setApi={setCarouselApi} opts={{align: "start"}} className="w-full">
                        <CarouselContent>
                            {songs.map((song, index) => (
                            <CarouselItem key={song.id} className="basis-1/3 md:basis-1/4 lg:basis-1/5">
                                <Button
                                variant={index === currentSongIndex ? 'secondary' : 'outline'}
                                className={`w-full truncate h-10 text-xs ${index === currentSongIndex ? 'bg-accent text-accent-foreground border-accent' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                                onClick={() => handleCarouselSelect(index)}
                                >
                                {song.title}
                                </Button>
                            </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className='-left-4 text-white bg-white/10 hover:bg-white/20 border-none' />
                        <CarouselNext className='-right-4 text-white bg-white/10 hover:bg-white/20 border-none'/>
                    </Carousel>
                </div>
                )}
            </div>
        </div>
      </footer>
    </div>
  );
}


export default function TeleprompterPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen w-screen bg-neutral-900 text-white text-xl">Cargando...</div>}>
            <TeleprompterContent />
        </Suspense>
    )
}
