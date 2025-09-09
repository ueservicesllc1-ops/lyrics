
"use client";

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useRef } from 'react';
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

const initialState = {
  message: null,
  errors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Guardando...
        </>
      ) : (
        'Guardar Canción'
      )}
    </Button>
  );
}

export default function UploadLyricsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  const [state, formAction] = useFormState(saveSong, initialState);

  useEffect(() => {
    if (!loading && (user?.email !== 'ueservicesllc1@gmail.com')) {
      router.push('/');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    if (state.message === 'success') {
      toast({
        title: '¡Éxito!',
        description: 'La canción ha sido guardada correctamente.',
      });
      formRef.current?.reset();
    } else if (state.message && state.message !== 'success') {
      toast({
        variant: 'destructive',
        title: 'Error al guardar',
        description: state.message,
      });
    }
  }, [state, toast]);

  if (loading || user?.email !== 'ueservicesllc1@gmail.com') {
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
            <CardTitle>Subir Letras de Canción</CardTitle>
            <CardDescription>Completa el formulario para añadir una nueva canción al repertorio.</CardDescription>
          </CardHeader>
          <CardContent>
            <form ref={formRef} action={formAction} className="space-y-6">
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
              
              <SubmitButton />
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
