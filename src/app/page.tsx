'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Music, ListMusic } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="flex-grow flex items-center justify-center p-4">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/songs" className="flex-1">
            <Button
              size="lg"
              className="w-full h-48 text-3xl shadow-lg transition-transform transform hover:scale-105 flex flex-col gap-4"
              variant="outline"
            >
              <Music className="h-12 w-12" />
              <span>BIBLIOTECA</span>
            </Button>
          </Link>
          <Link href="/setlists" className="flex-1">
            <Button
              size="lg"
              className="w-full h-48 text-3xl shadow-lg transition-transform transform hover:scale-105 flex flex-col gap-4"
              variant="outline"
            >
              <ListMusic className="h-12 w-12" />
              <span>SETLISTS</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
