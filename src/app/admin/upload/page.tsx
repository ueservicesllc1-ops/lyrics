
"use client";

import { useState, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveSong } from '@/lib/actions/song-actions';

type State = {
  message?: string | null;
  errors?: any;
};

const initialState: State = {
  message: null,
  errors: {},
};

export default function UploadLyricsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<State>(initialState);
  const [isPending, startTransition] = useTransition();

  if (!authLoading && (user?.email !== 'ueservicesllc1@gmail.com')) {
    router.push('/');
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await saveSong(undefined, formData);
      setState(result);

      if (result.message === 'success') {
        toast({
          title: '¡Éxito!',
          description: 'La canción ha sido guardada correctamente.',
        });
        formRef.current?.reset();
        setState(initialState);
      } else if (result.message) {
        toast({
          variant: 'destructive',
          title: 'Error al guardar',
          description: result.message,
        });
      }
    });
  };

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
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Nombre de la Canción</Label>
                <Input id="title" name="title" placeholder="Ej: Amazing Grace" required />
                 {state.errors?.title && <p className="text-destructive text-sm">{state.errors.title[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="artist">Artista</Label>
                <Input id="artist" name="artist" placeholder="Ej: John Newton" required />
                {state.errors?.artist && <p className="text-destructive text-sm">{state.errors.artist[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lyrics">Letra de la Canción</Label>
                <Textarea
                  id="lyrics"
                  name="lyrics"
                  placeholder="Amazing grace! How sweet the sound..."
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
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
