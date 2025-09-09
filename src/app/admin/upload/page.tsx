
"use client";

import { useState, useRef, useTransition, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveSong } from '@/lib/actions/song-actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type State = {
  message: string | null;
  errors?: any;
};

const initialState: State = {
  message: null,
  errors: {},
};

function UploadLyricsForm() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<State>(initialState);
  const [isPending, startTransition] = useTransition();

  // Controlled components state
  const [title, setTitle] = useState(searchParams.get('title') || '');
  const [artist, setArtist] = useState(searchParams.get('artist') || '');
  const [lyrics, setLyrics] = useState(searchParams.get('lyrics') || '');

  useEffect(() => {
    // Update state if query params change
    setTitle(searchParams.get('title') || '');
    setArtist(searchParams.get('artist') || '');
    setLyrics(searchParams.get('lyrics') || '');
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState(initialState); // Clear previous errors
    
    const formData = new FormData(event.currentTarget);
    
    if (user?.uid) {
        formData.append('userId', user.uid);
    } else {
        formData.append('userId', 'anonymous');
    }

    startTransition(async () => {
      const result = await saveSong(initialState, formData);
      setState(result);

      if (result.message === 'success') {
        toast({
          title: '¡Éxito!',
          description: 'La canción ha sido guardada correctamente.',
        });
        formRef.current?.reset();
        // Clear controlled inputs and remove query params from URL
        setTitle('');
        setArtist('');
        setLyrics('');
        router.replace('/admin/upload', { scroll: false });
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Nombre de la Canción</Label>
        <Input 
          id="title" 
          name="title" 
          placeholder="Ej: Amazing Grace" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required 
        />
        {state.errors?.title && <p className="text-destructive text-sm">{state.errors.title[0]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="artist">Artista</Label>
        <Input 
          id="artist" 
          name="artist" 
          placeholder="Ej: John Newton" 
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          required 
        />
        {state.errors?.artist && <p className="text-destructive text-sm">{state.errors.artist[0]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="lyrics">Letra de la Canción</Label>
        <Textarea
          id="lyrics"
          name="lyrics"
          placeholder="Amazing grace! How sweet the sound..."
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          required
          className="min-h-[250px]"
        />
        {state.errors?.lyrics && <p className="text-destructive text-sm">{state.errors.lyrics[0]}</p>}
      </div>
      
      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : (
          'Guardar Canción'
        )}
      </Button>

      {state.message && state.message !== 'success' && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error al Guardar</AlertTitle>
          <AlertDescription>
            {state.message}
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
}


export default function UploadLyricsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (user?.email !== 'ueservicesllc1@gmail.com')) {
      router.push('/');
    }
  }, [user, authLoading, router]);


  if (authLoading) {
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
            <CardTitle>Subir Letras de Canción</CardTitle>
            <CardDescription>Completa el formulario para añadir una nueva canción al repertorio.</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading form...</div>}>
              <UploadLyricsForm />
            </Suspense>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
