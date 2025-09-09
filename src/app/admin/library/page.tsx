
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getSongs, type Song } from '@/lib/songs';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LibraryAdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && (user?.email !== 'ueservicesllc1@gmail.com')) {
      router.push('/');
    } else if (!loading && user) {
      getSongs().then(fetchedSongs => {
        setSongs(fetchedSongs);
        setDataLoading(false);
      }).catch(err => {
        console.error("Error fetching songs:", err);
        setDataLoading(false);
      });
    }
  }, [user, loading, router]);

  if (loading || user?.email !== 'ueservicesllc1@gmail.com' || dataLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Artista</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {songs.map((song) => (
                  <TableRow key={song.id}>
                    <TableCell className="font-medium">{song.title}</TableCell>
                    <TableCell>{song.artist}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
