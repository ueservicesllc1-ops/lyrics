import { Header } from "@/components/header";
import { AiSongSuggester } from "@/components/ai-song-suggester";
import { SongSearchList } from "@/components/song-search-list";
import { getSongs } from "@/lib/songs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Search } from "lucide-react";

export default async function Home() {
  const songs = await getSongs();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 w-full">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary/10">
          <div className="container px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline tracking-tighter">
              Build Your Perfect Setlist
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
              Access a vast library of Christian song lyrics and create beautiful setlists. Powered by AI to help you find the perfect song for any moment.
            </p>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-4">
                <AiSongSuggester />
              </div>
              <div className="space-y-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen/>
                      Song Library
                    </CardTitle>
                    <CardDescription>
                      Search for a song by title or artist, or browse the full list.
                    </CardDescription>
                  </CardHeader>
                  <SongSearchList songs={songs} />
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-6 px-4 md:px-6 border-t border-primary/10 text-center text-sm text-muted-foreground">
        <p>MySetListApp &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
