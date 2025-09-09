
"use client";

import { getSongById } from '@/lib/songs';
import { notFound } from 'next/navigation';
import { EditSongForm } from './edit-song-form';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Song } from '@/lib/songs';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

function EditSongLoader({ id }: { id: string }) {
  const [song, setSong] = useState<Song | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    async function fetchSong() {
      const fetchedSong = await getSongById(id);
      if (!fetchedSong) {
        notFound();
      } else {
        setSong(fetchedSong);
      }
      setDataLoading(false);
    }
    fetchSong();
  }, [id]);

  if (dataLoading || !song) {
    return <div className="flex items-center justify-center h-full">Cargando datos de la canción...</div>;
  }

  return <EditSongForm song={song} />;
}


export default function EditSongPage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && user?.email !== 'ueservicesllc1@gmail.com') {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || user?.email !== 'ueservicesllc1@gmail.com') {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-transparent text-foreground font-sans gap-4">
      <Header />
      <main className="flex-1 p-4 md:p-6">
        <div className="mb-4">
          <Button asChild variant="outline">
            <Link href="/admin/library">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a la Biblioteca
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Editar Canción</CardTitle>
            <CardDescription>Modifica los detalles de la canción y guarda los cambios.</CardDescription>
          </CardHeader>
          <CardContent>
            <EditSongLoader id={params.id} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
