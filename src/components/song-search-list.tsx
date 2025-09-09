"use client";

import { useState, useMemo } from "react";
import type { Song } from "@/lib/songs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, PlayCircle } from "lucide-react";

type SongSearchListProps = {
  songs: Song[];
  onAddToSetlist: (song: Song) => void;
  onSelectSong: (song: Song) => void;
  activeSongId?: string | null;
};

export function SongSearchList({ songs, onAddToSetlist, onSelectSong, activeSongId }: SongSearchListProps) {
  const [search, setSearch] = useState("");

  const filteredSongs = useMemo(() => {
    if (!search) return songs;
    return songs.filter(
      (song) =>
        song.title.toLowerCase().includes(search.toLowerCase()) ||
        song.artist.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, songs]);

  return (
    <CardContent className="p-4 md:p-6 h-full flex flex-col">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search by title or artist..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      <ScrollArea className="flex-1 pr-4 -mr-4">
        <div className="space-y-2">
          {filteredSongs.length > 0 ? (
            filteredSongs.map((song) => (
              <div
                key={song.id}
                data-active={song.id === activeSongId}
                className="group flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
              >
                <button onClick={() => onSelectSong(song)} className="text-left flex-1">
                  <h3 className="font-semibold">{song.title}</h3>
                  <p className="text-sm text-muted-foreground group-data-[active=true]:text-accent-foreground/80">{song.artist}</p>
                </button>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onSelectSong(song)}
                        className="opacity-0 group-hover:opacity-100"
                        aria-label="Play Song"
                    >
                        <PlayCircle className="h-5 w-5" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onAddToSetlist(song)}
                        className="opacity-0 group-hover:opacity-100"
                        aria-label="Add to setlist"
                    >
                        <PlusCircle className="h-5 w-5" />
                    </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-10">
              <p>No songs found.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </CardContent>
  );
}
