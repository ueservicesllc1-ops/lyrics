"use client";

import type { Song } from "@/lib/songs";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type SetlistProps = {
  songs: Song[];
  onSelectSong: (song: Song) => void;
  onRemoveSong: (songId: string) => void;
};

export function Setlist({ songs, onSelectSong, onRemoveSong }: SetlistProps) {
  if (songs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Your setlist is empty. Add songs from the library.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {songs.map((song, index) => (
        <div
          key={`${song.id}-${index}`}
          className="group flex items-center justify-between p-3 rounded-lg hover:bg-primary/10 transition-colors"
        >
          <button onClick={() => onSelectSong(song)} className="text-left flex-1 flex items-center gap-4">
            <span className="text-muted-foreground font-mono text-sm">{index + 1}</span>
            <div>
                <h3 className="font-semibold">{song.title}</h3>
                <p className="text-sm text-muted-foreground">{song.artist}</p>
            </div>
          </button>
           <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onRemoveSong(song.id)}
                className="opacity-0 group-hover:opacity-100"
                aria-label="Remove from setlist"
            >
                <X className="h-5 w-5" />
            </Button>
        </div>
      ))}
    </div>
  );
}
