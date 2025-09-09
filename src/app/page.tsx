"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { SongSearchList } from "@/components/song-search-list";
import { getSongs, type Song } from "@/lib/songs";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookOpen, ListMusic, Music } from "lucide-react";
import { LyricPlayer } from "@/components/lyric-player";
import { Setlist } from "@/components/setlist";

// This is a temporary solution to get all songs on the client.
// In a real app, you'd fetch or search for songs dynamically.
const allSongs = await getSongs();

export default function Home() {
  const [songs] = useState<Song[]>(allSongs);
  const [setlist, setSetlist] = useState<Song[]>([]);
  const [activeSong, setActiveSong] = useState<Song | null>(null);

  const handleAddToSetlist = (song: Song) => {
    setSetlist((prev) => [...prev, song]);
  };

  const handleRemoveFromSetlist = (songId: string) => {
    setSetlist((prev) => prev.filter((s) => s.id !== songId));
  }

  const handleSelectSong = (song: Song) => {
    setActiveSong(song);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans">
      <Header />
      <main className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 overflow-hidden">
        {/* Song Library */}
        <div className="flex flex-col gap-4 overflow-hidden">
           <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen/>
                  Song Library
                </CardTitle>
                <CardDescription>
                  Search for a song or add it to the setlist.
                </CardDescription>
              </CardHeader>
              <SongSearchList 
                songs={songs} 
                onAddToSetlist={handleAddToSetlist}
                onSelectSong={handleSelectSong}
              />
            </Card>
        </div>

        {/* Current Setlist */}
        <div className="flex flex-col gap-4 overflow-hidden">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListMusic />
                Current Setlist
              </CardTitle>
              <CardDescription>Your list of songs for the event.</CardDescription>
            </CardHeader>
             <CardContent className="flex-1 overflow-y-auto">
                <Setlist 
                    songs={setlist} 
                    onSelectSong={handleSelectSong}
                    onRemoveSong={handleRemoveFromSetlist}
                />
             </CardContent>
          </Card>
        </div>

        {/* Now Playing */}
        <div className="flex flex-col gap-4 overflow-hidden">
           <Card className="h-full flex flex-col">
             <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music />
                  Now Playing
                </CardTitle>
                {activeSong && <CardDescription>{activeSong.title} - {activeSong.artist}</CardDescription>}
              </CardHeader>
             <div className="flex-1_overflow-hidden_relative">
                {activeSong ? (
                  <LyricPlayer song={activeSong} key={activeSong.id}/>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Select a song to see the lyrics.</p>
                  </div>
                )}
             </div>
           </Card>
        </div>
      </main>
    </div>
  );
}
