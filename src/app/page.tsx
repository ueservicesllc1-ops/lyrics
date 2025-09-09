'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input'; // Importar Input
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

// Definimos la interfaz aquí también
interface Song {
  id: string;
  title: string;
  artist: string;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el buscador

  // Función para obtener las canciones
  const fetchSongs = useCallback(async () => {
    setIsLoadingSongs(true);
    try {
      const q = query(collection(db, 'songs'), orderBy('title', 'asc'));
      const querySnapshot = await getDocs(q);
      const songsData = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Song)
      );
      setSongs(songsData);
    } catch (e) {
      console.error('Error fetching songs: ', e);
      // Opcional: podrías mostrar un error al usuario
    } finally {
      setIsLoadingSongs(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user) {
      fetchSongs();
    }
  }, [user, loading, router, fetchSongs]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Cargando...</p>
      </div>
    );
  }
  
  // Filtrar canciones basado en el término de búsqueda
  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (song.artist && song.artist.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <main className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">Dashboard de Usuario</h1>
        <p className="text-muted-foreground">
          Gestiona tu música y tus eventos.
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tarjeta de Biblioteca con la lista de canciones */}
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Biblioteca de Canciones</CardTitle>
            <CardDescription>
              Repertorio central de canciones disponibles.
            </CardDescription>
             <Input
                placeholder="Buscar por título o artista..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-2"
              />
          </CardHeader>
          <CardContent className="flex-grow">
            {isLoadingSongs ? (
              <p>Cargando canciones...</p>
            ) : filteredSongs.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Artista</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSongs.map((song) => (
                      <TableRow key={song.id}>
                        <TableCell className="font-medium">
                          {song.title}
                        </TableCell>
                        <TableCell>{song.artist || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
               <p className="text-muted-foreground text-center py-4">
                {songs.length > 0 ? 'No se encontraron canciones.' : 'No hay canciones en la biblioteca.'}
              </p>
            )}
          </CardContent>
        </Card>
        
        {/* Tarjeta de Setlists (sin cambios) */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Mis Setlists</CardTitle>
            <CardDescription>
              Crea y organiza tus setlists personalizados para los eventos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Contenido adicional puede ir aquí si es necesario */}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
