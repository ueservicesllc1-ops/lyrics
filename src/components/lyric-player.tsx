"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { Song } from '@/lib/songs';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  Play,
  Pause,
  Rewind,
  Plus,
  Minus,
  Settings,
  ZoomIn,
  ZoomOut,
  FastForward,
  SlowForward,
} from 'lucide-react';

export function LyricPlayer({ song }: { song: Song }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(2); // 1-10 scale
  const [fontSize, setFontSize] = useState(48); // in pixels
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number>();

  const processedLyrics = useMemo(() => {
    // Add extra padding at the end to ensure the last lines can scroll to the center
    return song.lyrics + '\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n';
  }, [song.lyrics]);

  const scroll = useCallback(() => {
    if (scrollRef.current) {
      if (scrollRef.current.scrollTop < scrollRef.current.scrollHeight - scrollRef.current.clientHeight) {
        // scrollSpeed is a multiplier. Base speed is 0.2 pixels per frame.
        scrollRef.current.scrollTop += scrollSpeed * 0.1;
        animationFrameId.current = requestAnimationFrame(scroll);
      } else {
        setIsPlaying(false);
      }
    }
  }, [scrollSpeed]);

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

  const handleStop = () => {
    setIsPlaying(false);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  };
  
  const handleFontSizeChange = (direction: 'increase' | 'decrease') => {
    setFontSize(prev => {
        const newSize = direction === 'increase' ? prev + 4 : prev - 4;
        return Math.max(16, Math.min(128, newSize)); // Clamp font size
    });
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center overflow-hidden">
      <div
        ref={scrollRef}
        className="w-full h-full overflow-y-scroll scroll-smooth snap-y snap-mandatory"
        style={{
          scrollbarWidth: 'none', // for Firefox
        }}
      >
        <div className="flex justify-center">
            <div
                className="text-center whitespace-pre-line py-[50vh] transition-all duration-300 ease-in-out font-headline"
                style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: 1.5,
                    maxWidth: '90vw',
                }}
            >
                {processedLyrics}
            </div>
        </div>
      </div>
      
      <div className="absolute bottom-4 right-4 z-20">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full h-14 w-14 shadow-lg">
              <Settings className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Controls & Settings</SheetTitle>
            </SheetHeader>
            <div className="space-y-8 mt-8">
              <div className="space-y-4">
                <h3 className="font-semibold">Playback</h3>
                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" size="icon" onClick={handleStop}><Rewind /></Button>
                  <Button size="icon" className="h-16 w-16 rounded-full" onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                  </Button>
                   <div className="w-8 h-8"/>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Scroll Speed</h3>
                <div className="flex items-center gap-4">
                  <SlowForward className="text-muted-foreground" />
                  <Slider
                    value={[scrollSpeed]}
                    onValueChange={(value) => setScrollSpeed(value[0])}
                    min={1}
                    max={10}
                    step={0.5}
                  />
                  <FastForward className="text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Font Size</h3>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="icon" onClick={() => handleFontSizeChange('decrease')}><ZoomOut/></Button>
                  <span className="font-mono text-lg w-12 text-center">{fontSize}px</span>
                  <Button variant="outline" size="icon" onClick={() => handleFontSizeChange('increase')}><ZoomIn/></Button>
                </div>
              </div>

            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
