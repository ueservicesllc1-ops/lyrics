'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Play, Pause, RefreshCw } from 'lucide-react';

const lyrics = `
[Verse 1]
Here comes the sun, doo-doo-doo-doo
Here comes the sun, and I say
It's all right

[Verse 2]
Little darlin', it's been a long, cold, lonely winter
Little darlin', it feels like years since it's been here

[Chorus]
Here comes the sun, doo-doo-doo-doo
Here comes the sun, and I say
It's all right

[Verse 3]
Little darlin', the smiles returnin' to their faces
Little darlin', it seems like years since it's been here

[Chorus]
Here comes the sun, doo-doo-doo-doo
Here comes the sun, and I say
It's all right

[Bridge]
Sun, sun, sun, here it comes
Sun, sun, sun, here it comes
Sun, sun, sun, here it comes
Sun, sun, sun, here it comes
Sun, sun, sun, here it comes

[Verse 4]
Little darlin', I feel that ice is slowly meltin'
Little darlin', it seems like years since it's been clear

[Chorus]
Here comes the sun, doo-doo-doo-doo
Here comes the sun, and I say
It's all right

[Outro]
It's all right
`;

export default function TeleprompterPage() {
  const [scrollSpeed, setScrollSpeed] = useState(5);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isMirrored, setIsMirrored] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startScrolling = () => {
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
    }, 100 - scrollSpeed * 10);
  };

  const stopScrolling = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
    setIsScrolling(false);
  };

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
  }, []);

  return (
    <div className="container mx-auto p-4 flex flex-col items-center gap-8">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Teleprompter</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={contentRef}
            className={`h-[60vh] overflow-y-scroll bg-neutral-900 text-white p-8 text-4xl leading-relaxed font-sans border rounded-md whitespace-pre-wrap transition-transform duration-300 ${
              isMirrored ? 'scale-x-[-1]' : ''
            }`}
          >
            {lyrics}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={isScrolling ? stopScrolling : startScrolling}
              variant="outline"
              size="icon"
              aria-label={isScrolling ? 'Pause' : 'Play'}
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
        </CardFooter>
      </Card>
    </div>
  );
}
