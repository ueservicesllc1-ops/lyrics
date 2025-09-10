'use client';

import type { Setlist } from '@/app/setlists/page';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import { ChevronRight, Calendar, Music } from 'lucide-react';

interface SetlistCardProps {
  setlist: Setlist;
}

export default function SetlistCard({ setlist }: SetlistCardProps) {
  const date = typeof setlist.date === 'string' 
    ? parseISO(setlist.date) 
    : (setlist.date as any).toDate();
    
  return (
    <Link href={`/setlists/${setlist.id}`} className="block group">
      <div className="w-full text-left justify-between bg-neutral-900 hover:bg-neutral-800 p-4 rounded-lg flex items-center transition-all duration-200 border border-neutral-700/60">
        <div className='flex-grow overflow-hidden'>
          <p className="font-semibold text-white truncate">{setlist.name}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
            <div className='flex items-center gap-1.5'>
                <Calendar className="h-3 w-3" />
                <span>{format(date, 'PPP')}</span>
            </div>
             <div className='flex items-center gap-1.5'>
                <Music className="h-3 w-3" />
                <span>{setlist.songs?.length || 0} canciones</span>
            </div>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-white transition-colors shrink-0 ml-4" />
      </div>
    </Link>
  );
}
