
"use client";

import { useFormState } from 'react-dom';
import { useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { type Song } from '@/lib/songs';
import { updateSong } from '@/lib/actions/song-actions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type State = {
    message: string | null;
    errors?: any;
};

const initialState: State = {
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
          Actualizando...
        </>
      ) : (
        'Actualizar Canción'
      )}
    </Button>
  );
}

export function EditSongForm({ song }: { song: Song }) {
  const { toast } = useToast();
  const router = useRouter();
  const updateSongWithId = updateSong.bind(null, song.id);
  const [state, dispatch] = useFormState(updateSongWithId, initialState);
  
  useEffect(() => {
    if(state.message && state.message !== 'success') {
      toast({
        variant: 'destructive',
        title: 'Error al Actualizar',
        description: state.message,
      });
    } else if (state.message === 'success') {
        toast({
            title: "¡Éxito!",
            description: "La canción ha sido actualizada correctamente."
        });
        // The redirect is now handled in the server action
    }
  }, [state, toast, router]);

  return (
    <form action={dispatch} className="space-y-6">
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

      <SubmitButton />

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
