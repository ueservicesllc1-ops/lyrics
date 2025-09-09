'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Setlist } from '@/app/setlists/page';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SetlistCardProps {
  setlist: Setlist;
}

export default function SetlistCard({ setlist }: SetlistCardProps) {
  // Firestore puede devolver Timestamp o un string si lo guardamos así.
  const date = typeof setlist.date === 'string' 
    ? parseISO(setlist.date) 
    : (setlist.date as any).toDate();
    
  const isLocal = setlist.id.startsWith('local-');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-2">
          <CardTitle className="min-w-0 break-words">{setlist.name}</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex-shrink-0 mt-1.5">
                <div
                  className={`h-3 w-3 rounded-full ${
                    isLocal ? 'bg-red-500' : 'bg-green-500'
                  }`}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {isLocal
                    ? 'Este setlist no está guardado en la nube.'
                    : 'Setlist guardado en Firestore.'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>{format(date, 'PPP')}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Link href={`/setlists/${setlist.id}`}>
          <Button variant="outline" size="sm">
            Ver Detalles
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
