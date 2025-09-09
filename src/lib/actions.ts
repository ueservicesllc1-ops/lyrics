
'use server';

import { generateSongSuggestions, type GenerateSongSuggestionsInput } from '@/ai/flows/generate-song-suggestions';
import { z } from 'zod';

const formSchema = z.object({
  recentEvents: z.string().min(1, 'Please describe recent events, your mood, or the theme you are looking for.'),
});

type State = {
  message?: string | null;
  errors?: {
    recentEvents?: string[];
  };
  suggestions?: string[];
};

export async function getAiSuggestions(prevState: State, formData: FormData): Promise<State> {
  try {
    const validatedFields = formSchema.safeParse({
      recentEvents: formData.get('recentEvents'),
    });

    if (!validatedFields.success) {
      return {
        message: 'Invalid input.',
        errors: validatedFields.error.flatten().fieldErrors,
        suggestions: [],
      };
    }

    const today = new Date();
    const dayOfWeek = today.toLocaleString('en-US', { weekday: 'long' });
    const hour = today.getHours();
    let currentTime = 'night';
    if (hour >= 5 && hour < 12) currentTime = 'morning';
    else if (hour >= 12 && hour < 17) currentTime = 'afternoon';
    else if (hour >= 17 && hour < 21) currentTime = 'evening';
    
    const input: GenerateSongSuggestionsInput = {
      currentTime,
      dayOfWeek,
      recentEvents: validatedFields.data.recentEvents,
    };

    const result = await generateSongSuggestions(input);
    
    return {
      message: 'success',
      suggestions: result.songs,
    };

  } catch (error) {
    console.error(error);
    return {
      message: 'An error occurred while generating suggestions. Please try again.',
      suggestions: [],
    };
  }
}
