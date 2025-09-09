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
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Label } from './ui/label';

export function LyricPlayer({ song }: { song: Song }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(2); // 1-10 scale
  const [fontSize, setFontSize] = useState(24); // in pixels
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

  useEffect(() => {
    handleStop(); // Reset scroll and player when song changes
  }, [song.id]);


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
        const newSize = direction === 'increase' ? prev + 2 : prev - 2;
        return Math.max(12, Math.min(64, newSize)); // Clamp font size
    });
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center overflow-hidden relative">
      <div
        ref={scrollRef}
        className="w-full h-full overflow-y-scroll scroll-smooth"
        style={{
          scrollbarWidth: 'none', // for Firefox
        }}
      >
        <div className="flex justify-center">
            <div
                className="text-center whitespace-pre-line py-[50vh] transition-all duration-300 ease-in-out font-medium"
                style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: 1.6,
                    maxWidth: '90vw',
                }}
            >
                {processedLyrics}
            </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/50 backdrop-blur-sm border-t">
        <div className="flex items-center justify-center gap-6">
            <Button variant="ghost" size="icon" onClick={handleStop}><Rewind /></Button>
            <Button size="icon" className="h-14 w-14 rounded-full" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" />}
            </Button>
            <Popover>
                <PopoverTrigger asChild>
                    <div className="w-14" />
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Settings</h4>
                            <p className="text-sm text-muted-foreground">
                                Adjust the lyric display.
                            </p>
                        </div>
                         <div className="space-y-4">
                            <Label>Scroll Speed</Label>
                            <div className="flex items-center gap-4">
                            <Rewind className="text-muted-foreground" />
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
                            <Label>Font Size</Label>
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
