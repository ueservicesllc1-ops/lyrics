
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
    return { message: 'Error: ID de usuario no proporcionado.', errors: {} };
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

// THIS IS NOW A CLIENT-CALLABLE FUNCTION
export async function updateSongClient(id: string, data: z.infer<typeof formSchema>): Promise<{ message: string | null; errors?: any; }> {
    if (!id) {
        return { message: 'ID de canción no válido.', errors: {} };
    }
    
    const validatedFields = formSchema.safeParse(data);

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
            updatedAt: serverTimestamp()
        });
        
        // Since this runs on the client, we can't use revalidatePath.
        // The page will be refreshed via router.push in the form component.
        
        return { message: 'success' };

    } catch (e: unknown) {
        const error = e as Error;
        console.error('Error updating document: ', error);
        return { message: `Error de base de datos: ${error.message}`, errors: {} };
    }
}
