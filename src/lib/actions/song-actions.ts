
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
});

type State = {
  message?: string | null;
  errors?: {
    title?: string[];
    artist?: string[];
    lyrics?: string[];
  };
};

export async function saveSong(prevState: State, formData: FormData): Promise<State> {
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
      createdAt: serverTimestamp(),
    });

    revalidatePath('/admin/upload');
    revalidatePath('/');

    return { message: 'success' };
  } catch (e) {
    console.error('Error adding document: ', e);
    return { message: 'No se pudo guardar la canción en la base de datos. Por favor, inténtalo de nuevo.' };
  }
}
