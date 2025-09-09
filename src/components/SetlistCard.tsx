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

interface SetlistCardProps {
  setlist: Setlist;
}

export default function SetlistCard({ setlist }: SetlistCardProps) {
  // Firestore puede devolver Timestamp o un string si lo guardamos así.
  const date = typeof setlist.date === 'string' 
    ? parseISO(setlist.date) 
    : (setlist.date as any).toDate();
    
  return (
    <Card>
      <CardHeader>
        <CardTitle className="min-w-0 break-words">{setlist.name}</CardTitle>
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
