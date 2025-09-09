
import { getSongById } from '@/lib/songs';
import { notFound } from 'next/navigation';
import { EditSongForm } from './edit-song-form';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function EditSongPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const song = await getSongById(id);

  if (!song) {
    notFound();
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
            <EditSongForm song={song} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
