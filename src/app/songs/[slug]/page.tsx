import { getSongBySlug, getSongs } from '@/lib/songs';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { LyricPlayer } from '@/components/lyric-player';

// This page is now deprecated in favor of the main page view.
// We keep it for direct navigation, but it could be removed.
export default async function SongPage({ params }: { params: { slug: string } }) {
  const song = await getSongBySlug(params.slug);

  if (!song) {
    notFound();
  }

  return (
    <div className="bg-background min-h-screen text-foreground relative">
      <div className="absolute top-4 left-4 z-20">
        <Button asChild variant="outline" className="bg-background/80 backdrop-blur-sm">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Library
          </Link>
        </Button>
      </div>
      <div className="fixed inset-0">
        <LyricPlayer song={song} />
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const songs = await getSongs();
 
  return songs.map((song) => ({
    slug: song.slug,
  }));
}
