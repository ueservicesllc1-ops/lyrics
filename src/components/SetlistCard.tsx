'use client';

import { Button } from '@/components/ui/button';
import type { Setlist } from '@/app/setlists/page';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface SetlistCardProps {
  setlist: Setlist;
}

export default function SetlistCard({ setlist }: SetlistCardProps) {
  const date = typeof setlist.date === 'string' 
    ? parseISO(setlist.date) 
    : (setlist.date as any).toDate();
    
  return (
    <Link href={`/setlists/${setlist.id}`} className="block">
      <div className="w-full text-left justify-between hover:bg-neutral-700/50 p-4 rounded-lg flex items-center transition-colors duration-200 border border-neutral-700">
        <div>
          <p className="font-semibold text-white">{setlist.name}</p>
          <p className="text-sm text-muted-foreground">{format(date, 'PPP')}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </Link>
  );
}
