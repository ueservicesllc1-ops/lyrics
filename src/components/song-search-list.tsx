"use client";

import { useState, useMemo } from "react";
import type { Song } from "@/lib/songs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Search } from "lucide-react";

export function SongSearchList({ songs }: { songs: Song[] }) {
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
    <Card className="h-full">
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
          <div className="space-y-3">
            {filteredSongs.length > 0 ? (
              filteredSongs.map((song) => (
                <Link
                  key={song.id}
                  href={`/songs/${song.slug}`}
                  className="block p-3 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <h3 className="font-semibold">{song.title}</h3>
                  <p className="text-sm text-muted-foreground">{song.artist}</p>
                </Link>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-10">
                <p>No songs found.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
