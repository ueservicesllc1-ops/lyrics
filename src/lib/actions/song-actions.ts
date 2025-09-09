
'use server';

import { z } from 'zod';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

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
  userId: z.string().min(1, 'El ID de usuario es obligatorio.'),
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

export async function saveSong(prevState: any, formData: FormData): Promise<State> {
  const validatedFields = formSchema.safeParse({
    title: formData.get('title'),
    artist: formData.get('artist'),
    lyrics: formData.get('lyrics'),
    userId: formData.get('userId'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Por favor, corrige los errores del formulario.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { title, artist, lyrics, userId } = validatedFields.data;

  try {
    const slug = slugify(title);
    const songsCollection = collection(db, 'songs');

    await addDoc(songsCollection, {
      title,
      artist,
      lyrics,
      slug,
      createdBy: userId, // Store the user's ID
      createdAt: serverTimestamp(),
    });

    revalidatePath('/admin/upload');
    revalidatePath('/');

    return { message: 'success' };
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Error adding document: ', error);
    // Return the specific Firebase error message
    return { message: `Error de base de datos: ${error.message}` };
  }
}
