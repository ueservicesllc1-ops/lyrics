
"use client";

import { useState, useEffect, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { useToast } from '@/hooks/use-toast';
import { type Song } from '@/lib/songs';
import { updateSongClient } from '@/lib/actions/song-actions'; // We will create this
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';


const formSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio.'),
  artist: z.string().min(1, 'El artista es obligatorio.'),
  lyrics: z.string().min(1, 'La letra es obligatoria.'),
});

type State = {
    message: string | null;
    errors?: any;
};

const initialState: State = {
  message: null,
  errors: {},
};


export function EditSongForm({ song }: { song: Song }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<State>(initialState);
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    setState(initialState); // Reset state

    const validatedFields = formSchema.safeParse({
        title: formData.get('title'),
        artist: formData.get('artist'),
        lyrics: formData.get('lyrics'),
    });

    if (!validatedFields.success) {
        setState({
            message: 'Por favor, corrige los errores del formulario.',
            errors: validatedFields.error.flatten().fieldErrors,
        });
        return;
    }
    
    startTransition(async () => {
        const result = await updateSongClient(song.id, validatedFields.data);
        setState(result);
        if (result.message === 'success') {
            toast({
                title: "¡Éxito!",
                description: "La canción ha sido actualizada correctamente."
            });
            router.push('/admin/library');
        }
    });
  }
  
  useEffect(() => {
    // This effect is now just for showing non-success toast messages
    if (state.message && state.message !== 'success') {
      toast({
        variant: 'destructive',
        title: 'Error al Actualizar',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Nombre de la Canción</Label>
        <Input id="title" name="title" defaultValue={song.title} required />
        {state.errors?.title && <p className="text-destructive text-sm">{state.errors.title[0]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="artist">Artista</Label>
        <Input id="artist" name="artist" defaultValue={song.artist} required />
        {state.errors?.artist && <p className="text-destructive text-sm">{state.errors.artist[0]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="lyrics">Letra de la Canción</Label>
        <Textarea
          id="lyrics"
          name="lyrics"
          defaultValue={song.lyrics}
          required
          className="min-h-[250px]"
        />
        {state.errors?.lyrics && <p className="text-destructive text-sm">{state.errors.lyrics[0]}</p>}
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? (
            <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Actualizando...
            </>
        ) : (
            'Actualizar Canción'
        )}
        </Button>

      {state.message && state.message !== 'success' && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error al Actualizar</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
    </form>
  );
}
