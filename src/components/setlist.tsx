
"use client";

import type { Song } from "@/lib/songs";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type SetlistProps = {
  songs: Song[];
  onSelectSong: (song: Song) => void;
  onRemoveSong: (songId: string) => void;
  activeSongId?: string | null;
};

export function Setlist({ songs, onSelectSong, onRemoveSong, activeSongId }: SetlistProps) {
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
          data-active={song.id === activeSongId}
          className="group flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
        >
          <div className="text-left flex-1 flex items-center gap-4">
            <span className="text-muted-foreground font-mono text-sm group-data-[active=true]:text-accent-foreground/80">{index + 1}</span>
            <div>
                <h3 className="font-semibold">{song.title}</h3>
                <p className="text-sm text-muted-foreground group-data-[active=true]:text-accent-foreground/80">{song.artist}</p>
            </div>
          </div>
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
