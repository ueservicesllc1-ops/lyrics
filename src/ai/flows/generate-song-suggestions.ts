'use server';

/**
 * @fileOverview AI agent that provides song suggestions based on context.
 *
 * - generateSongSuggestions - A function that generates song suggestions.
 * - GenerateSongSuggestionsInput - The input type for the generateSongSuggestions function.
 * - GenerateSongSuggestionsOutput - The return type for the generateSongSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSongSuggestionsInputSchema = z.object({
  currentTime: z.string().describe('The current time of day (e.g., morning, afternoon, evening, night).'),
  dayOfWeek: z.string().describe('The current day of the week.'),
  recentEvents: z.string().describe('Any recent events or special occasions.'),
});
export type GenerateSongSuggestionsInput = z.infer<typeof GenerateSongSuggestionsInputSchema>;

const GenerateSongSuggestionsOutputSchema = z.object({
  songs: z.array(z.string()).describe('A list of suggested song titles.'),
});
export type GenerateSongSuggestionsOutput = z.infer<typeof GenerateSongSuggestionsOutputSchema>;

export async function generateSongSuggestions(input: GenerateSongSuggestionsInput): Promise<GenerateSongSuggestionsOutput> {
  return generateSongSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSongSuggestionsPrompt',
  input: {schema: GenerateSongSuggestionsInputSchema},
  output: {schema: GenerateSongSuggestionsOutputSchema},
  prompt: `You are a worship leader with an extensive knowledge of Christian songs. Based on the current context, suggest a few songs that would be appropriate.

Current Time: {{{currentTime}}}
Day of Week: {{{dayOfWeek}}}
Recent Events: {{{recentEvents}}}

Suggest songs that are relevant to the current time, day, and any recent events. Consider the mood and theme that would be most fitting.`,
});

const generateSongSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateSongSuggestionsFlow',
    inputSchema: GenerateSongSuggestionsInputSchema,
    outputSchema: GenerateSongSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
