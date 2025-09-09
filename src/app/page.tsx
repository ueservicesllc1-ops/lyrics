
"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Header } from "@/components/header";
import { SongSearchList } from "@/components/song-search-list";
import { getSongs, type Song } from "@/lib/songs";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookOpen, ListMusic, PlusCircle } from "lucide-react";
import { Setlist } from "@/components/setlist";
import { AiSongSuggester } from "@/components/ai-song-suggester";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [setlist, setSetlist] = useState<Song[]>([]);
  const [activeSongId, setActiveSongId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    async function loadSongs() {
      const allSongs = await getSongs();
      setSongs(allSongs);
    }
    loadSongs();
  }, []);

  const handleAddToSetlist = (song: Song) => {
    if (!setlist.find(s => s.id === song.id)) {
      setSetlist((prev) => [...prev, song]);
    }
  };

  const handleRemoveFromSetlist = (songId: string) => {
    setSetlist((prev) => prev.filter((s) => s.id !== songId));
    if (activeSongId === songId) {
        setActiveSongId(null);
    }
  }

  const handleSelectSong = (song: Song) => {
    // This function is kept for potential future use, like showing a preview,
    // but it no longer controls the LyricPlayer.
    setActiveSongId(song.id);
  };

  const handleClearSetlist = () => {
    setSetlist([]);
  }

  if (loading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-transparent text-foreground font-sans gap-4">
        <Header />
        <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
          <Card className="h-full flex flex-col">
            <Tabs defaultValue="search" className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen/>
                  Song Library
                </CardTitle>
                <CardDescription>
                  Find songs or get AI suggestions.
                </CardDescription>
                <TabsList className="grid w-full grid-cols-2 mt-2">
                  <TabsTrigger value="search">Search</TabsTrigger>
                  <TabsTrigger value="ai">AI Suggester</TabsTrigger>
                </TabsList>
              </CardHeader>
              <TabsContent value="search" className="flex-1 overflow-hidden">
                <SongSearchList 
                  songs={songs} 
                  onAddToSetlist={handleAddToSetlist}
                  onSelectSong={() => {}}
                  activeSongId={null}
                />
              </TabsContent>
              <TabsContent value="ai" className="flex-1 overflow-y-auto">
                 <CardContent>
                  <AiSongSuggester onSelectSong={(songTitle) => {
                    const song = songs.find(s => s.title === songTitle);
                    if (song) {
                      handleAddToSetlist(song);
                    }
                  }}/>
                 </CardContent>
              </TabsContent>
            </Tabs>
          </Card>

          <div className="flex flex-col gap-4 overflow-hidden">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                        <ListMusic />
                        Current Setlist
                        </CardTitle>
                        <CardDescription>Your list of songs for the event.</CardDescription>
                    </div>
                    <Button variant="outline" onClick={handleClearSetlist}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Setlist
                    </Button>
                </div>
              </CardHeader>
               <CardContent className="flex-1 overflow-y-auto">
                  <Setlist 
                      songs={setlist} 
                      onSelectSong={() => {}}
                      onRemoveSong={handleRemoveFromSetlist}
                      activeSongId={null}
                  />
               </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
