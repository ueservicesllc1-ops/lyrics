"use client";

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { getAiSuggestions } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Bot, ThumbsUp, Music } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { findSongsByTitle } from '@/lib/songs';
import Link from 'next/link';

const initialState = {
  message: null,
  errors: {},
  suggestions: [],
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Sparkles className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <ThumbsUp className="mr-2 h-4 w-4" />
          Get Suggestions
        </>
      )}
    </Button>
  );
}

export function AiSongSuggester() {
  const [state, formAction] = useFormState(getAiSuggestions, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message === 'success') {
      toast({
        title: 'Suggestions Ready!',
        description: 'Here are some songs we think you\'ll like.',
      });
      formRef.current?.reset();
    } else if (state.message && state.message !== 'success') {
      toast({
        variant: 'destructive',
        title: 'Oops!',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <Card>
      <form action={formAction} ref={formRef}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot />
            AI Song Selector
          </CardTitle>
          <CardDescription>
            Describe the occasion, your mood, or a theme, and let our AI find the perfect songs for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="recentEvents">Context</Label>
              <Textarea
                id="recentEvents"
                name="recentEvents"
                placeholder="e.g., 'A quiet Sunday morning', 'Preparing for a youth group event', 'Feeling thankful'"
                required
              />
              {state.errors?.recentEvents && (
                <p className="text-sm text-destructive">{state.errors.recentEvents[0]}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <SubmitButton />
        </CardFooter>
      </form>
      {state.suggestions && state.suggestions.length > 0 && (
        <CardContent>
            <h3 className="font-semibold mb-3">Suggestions:</h3>
            <div className="space-y-2">
              {state.suggestions.map((songTitle, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-md bg-primary/5">
                  <Music className="h-5 w-5 text-primary" />
                  <span className="font-medium">{songTitle}</span>
                </div>
              ))}
            </div>
        </CardContent>
      )}
    </Card>
  );
}
