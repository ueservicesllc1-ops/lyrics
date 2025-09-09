import { getSongBySlug } from '@/lib/songs';
import { LyricPlayer } from '@/components/lyric-player';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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
      <LyricPlayer song={song} />
    </div>
  );
}

export async function generateStaticParams() {
  const { getSongs } = await import('@/lib/songs');
  const songs = await getSongs();
 
  return songs.map((song) => ({
    slug: song.slug,
  }));
}
