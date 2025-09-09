
"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { Song } from '@/lib/songs';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  Rewind,
  ZoomIn,
  ZoomOut,
  FastForward,
  Settings,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Label } from './ui/label';

export function LyricPlayer({ song }: { song: Song }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(2); // 1-10 scale
  const [fontSize, setFontSize] = useState(28); // in pixels
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number>();

  const processedLyrics = useMemo(() => {
    // Add extra padding to ensure the last lines can scroll to the center
    return song.lyrics + '\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n';
  }, [song.lyrics]);

  const scroll = useCallback(() => {
    if (scrollRef.current) {
      if (scrollRef.current.scrollTop < scrollRef.current.scrollHeight - scrollRef.current.clientHeight) {
        scrollRef.current.scrollTop += scrollSpeed * 0.1;
        animationFrameId.current = requestAnimationFrame(scroll);
      } else {
        setIsPlaying(false);
      }
    }
  }, [scrollSpeed]);

  const handleStop = useCallback(() => {
    setIsPlaying(false);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, []);
  
  useEffect(() => {
    handleStop(); // Reset scroll and player when song changes
  }, [song.id, handleStop]);


  useEffect(() => {
    if (isPlaying) {
      animationFrameId.current = requestAnimationFrame(scroll);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying, scroll]);
  
  const handleFontSizeChange = (direction: 'increase' | 'decrease') => {
    setFontSize(prev => {
        const newSize = direction === 'increase' ? prev + 2 : prev - 2;
        return Math.max(12, Math.min(64, newSize)); // Clamp font size
    });
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center overflow-hidden relative font-headline">
      <div
        ref={scrollRef}
        className="w-full h-full overflow-y-scroll scroll-smooth"
        style={{
          scrollbarWidth: 'none', // for Firefox
        }}
      >
        <div className="flex justify-center">
            <div
                className="text-center whitespace-pre-line py-[50vh] transition-all duration-300 ease-in-out font-bold"
                style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: 1.8,
                    maxWidth: '90vw',
                    textShadow: '2px 2px 8px rgba(0, 0, 0, 0.7)'
                }}
            >
                {processedLyrics}
            </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
        <div className="flex items-center justify-center gap-4 md:gap-6">
            <Button variant="ghost" size="icon" onClick={handleStop} className="h-12 w-12 text-white"><Rewind className="h-6 w-6"/></Button>
            <Button size="icon" className="h-16 w-16 rounded-full bg-white text-black hover:bg-gray-200" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
            </Button>
            <Popover>
                <PopoverTrigger asChild>
                   <Button variant="ghost" size="icon" className="h-12 w-12 text-white"><Settings className="h-6 w-6"/></Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Ajustes del Teleprompter</h4>
                            <p className="text-sm text-muted-foreground">
                                Modifica la visualización de la letra.
                            </p>
                        </div>
                         <div className="space-y-4">
                            <Label>Velocidad de Scroll</Label>
                            <div className="flex items-center gap-4">
                            <Rewind className="text-muted-foreground" />
                            <Slider
                                value={[scrollSpeed]}
                                onValueChange={(value) => setScrollSpeed(value[0])}
                                min={0.5}
                                max={10}
                                step={0.1}
                            />
                            <FastForward className="text-muted-foreground" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label>Tamaño de Fuente</Label>
                            <div className="flex items-center gap-4">
                            <Button variant="outline" size="icon" onClick={() => handleFontSizeChange('decrease')}><ZoomOut/></Button>
                            <span className="font-mono text-lg w-12 text-center">{fontSize}px</span>
                            <Button variant="outline" size="icon" onClick={() => handleFontSizeChange('increase')}><ZoomIn/></Button>
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
      </div>
    </div>
  );
}
