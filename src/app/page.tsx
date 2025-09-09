'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
    <div className="pt-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/admin/songs" className="flex-1">
            <Button
              size="lg"
              className="w-full h-16 text-lg shadow-md transition-transform transform hover:scale-105"
              variant="outline"
            >
              BIBLIOTECA
            </Button>
          </Link>
          <Link href="/setlists" className="flex-1">
            <Button
              size="lg"
              className="w-full h-16 text-lg shadow-md transition-transform transform hover:scale-105"
              variant="outline"
            >
              SETLIST
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
