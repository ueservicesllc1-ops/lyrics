
"use client";

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getSongs, type Song } from '@/lib/songs';
import Link from 'next/link';
import { ArrowLeft, Trash2, Loader2, AlertTriangle, Pencil } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteSong } from '@/lib/actions/song-actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


export default function LibraryAdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [songs, setSongs] = useState<Song[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchSongs = () => {
    setDataLoading(true);
    getSongs().then(fetchedSongs => {
      setSongs(fetchedSongs);
      setDataLoading(false);
    }).catch(err => {
      console.error("Error fetching songs:", err);
      setDataLoading(false);
    });
  };

  useEffect(() => {
    if (!loading && (user?.email !== 'ueservicesllc1@gmail.com')) {
      router.push('/');
    } else if (!loading && user) {
      fetchSongs();
    }
  }, [user, loading, router]);


  const handleDeleteSong = async (songId: string) => {
    setError(null);
    startTransition(async () => {
      const result = await deleteSong(songId);
      if (result?.error) {
        setError(result.error);
      } else {
        toast({
            title: "¡Éxito!",
            description: "La canción ha sido eliminada correctamente."
        });
        fetchSongs(); // Re-fetch songs to update the list
      }
    });
  };

  if (loading || dataLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (user?.email !== 'ueservicesllc1@gmail.com') {
      return null;
  }

  return (
    <div className="flex flex-col h-screen bg-transparent text-foreground font-sans gap-4">
      <Header />
      <main className="flex-1 p-4 md:p-6">
        <div className="mb-4">
            <Button asChild variant="outline">
                <Link href="/admin">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Panel
                </Link>
            </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Biblioteca de Canciones</CardTitle>
            <CardDescription>Lista de todas las canciones subidas a la aplicación.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
            )}
            <div className="border rounded-lg">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Artista</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {songs.map((song) => (
                    <TableRow key={song.id}>
                        <TableCell className="font-medium">{song.title}</TableCell>
                        <TableCell>{song.artist}</TableCell>
                        <TableCell className="text-right">
                             <Button asChild variant="ghost" size="icon">
                                <Link href={`/admin/library/${song.id}/edit`}>
                                    <Pencil className="h-4 w-4" />
                                </Link>
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" disabled={isPending}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta acción no se puede deshacer. Esto eliminará permanentemente la canción de la base de datos.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction 
                                        onClick={() => handleDeleteSong(song.id)}
                                        className="bg-destructive hover:bg-destructive/90"
                                        disabled={isPending}
                                    >
                                        {isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Eliminando...
                                            </>
                                        ) : "Eliminar"}
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
            {songs.length === 0 && !dataLoading &&(
                <div className="text-center py-10 text-muted-foreground">
                    <p>No se han encontrado canciones.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
