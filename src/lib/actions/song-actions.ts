
'use server';

import { z } from 'zod';
import { getFirestore, collection, addDoc, serverTimestamp, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const db = getFirestore(app);

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w-]+/g, '')    // Remove all non-word chars
    .replace(/--+/g, '-')       // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
};

const formSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio.'),
  artist: z.string().min(1, 'El artista es obligatorio.'),
  lyrics: z.string().min(1, 'La letra es obligatoria.'),
});

type State = {
  message: string | null;
  errors?: {
    title?: string[];
    artist?:string[];
    lyrics?: string[];
    userId?: string[];
  };
};

export async function saveSong(prevState: State, formData: FormData): Promise<State> {
  const userId = formData.get('userId');
  if (!userId) {
    return { message: 'Error: Usuario no autenticado. No se puede guardar la canción.', errors: {} };
  }

  const validatedFields = formSchema.safeParse({
    title: formData.get('title'),
    artist: formData.get('artist'),
    lyrics: formData.get('lyrics'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Por favor, corrige los errores del formulario.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { title, artist, lyrics } = validatedFields.data;

  try {
    const slug = slugify(title);
    const songsCollection = collection(db, 'songs');

    await addDoc(songsCollection, {
      title,
      artist,
      lyrics,
      slug,
      createdBy: userId,
      createdAt: serverTimestamp(),
    });

    revalidatePath('/admin/upload');
    revalidatePath('/admin/library');
    revalidatePath('/');

    return { message: 'success', errors: {} };
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Error adding document: ', error);
    return { message: `Error de base de datos: ${error.message}`, errors: {} };
  }
}


export async function deleteSong(songId: string): Promise<{ message: string | null }> {
  if (!songId) {
      return { message: 'ID de canción no válido.' };
  }
  try {
      const songDocRef = doc(db, 'songs', songId);
      await deleteDoc(songDocRef);
      revalidatePath('/admin/library');
      return { message: 'success' };
  } catch (error: any) {
      console.error("Error deleting song:", error);
      return { message: `Error de base de datos: ${error.message}` };
  }
}

export async function updateSong(id: string, prevState: State, formData: FormData): Promise<State> {
    if (!id) {
        return { message: 'ID de canción no válido.', errors: {} };
    }
    
    const validatedFields = formSchema.safeParse({
        title: formData.get('title'),
        artist: formData.get('artist'),
        lyrics: formData.get('lyrics'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Por favor, corrige los errores del formulario.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { title, artist, lyrics } = validatedFields.data;
    const slug = slugify(title);

    try {
        const songDocRef = doc(db, 'songs', id);
        await updateDoc(songDocRef, {
            title,
            artist,
            lyrics,
            slug,
        });

    } catch (e: unknown) {
        const error = e as Error;
        console.error('Error updating document: ', error);
        return { message: `Error de base de datos: ${error.message}`, errors: {} };
    }
    
    revalidatePath(`/admin/library`);
    revalidatePath(`/admin/library/${id}/edit`);
    revalidatePath('/');
    redirect(`/admin/library`);
}
