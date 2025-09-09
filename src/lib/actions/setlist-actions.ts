
'use server';

import { z } from 'zod';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

const db = getFirestore(app);

const setlistSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio.'),
  serviceDate: z.date(),
  songIds: z.array(z.string()),
  userId: z.string().min(1, "Se requiere un ID de usuario."),
});

type SaveSetlistInput = z.infer<typeof setlistSchema>;

export async function saveSetlist(input: SaveSetlistInput): Promise<{ success: boolean, error?: string | null }> {
  
  const validatedFields = setlistSchema.safeParse(input);

  if (!validatedFields.success) {
    const errorMessage = validatedFields.error.flatten().fieldErrors;
    console.error("Validation errors:", errorMessage);
    // Combine all error messages into a single string
    const combinedError = Object.values(errorMessage).flat().join(' ');
    return {
      success: false,
      error: `Error de validación: ${combinedError}`,
    };
  }

  const { name, serviceDate, songIds, userId } = validatedFields.data;

  try {
    const setlistsCollection = collection(db, 'setlists');

    await addDoc(setlistsCollection, {
      name,
      serviceDate,
      songIds,
      userId, // Associated with the logged-in user
      createdAt: serverTimestamp(),
    });

    revalidatePath('/'); // Revalidate the main page to reflect changes if any

    return { success: true };
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Error adding document: ', error);
    return { success: false, error: `Error de base de datos: ${error.message}` };
  }
}
