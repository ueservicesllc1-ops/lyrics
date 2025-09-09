
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Music, BarChart2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (user?.email !== 'ueservicesllc1@gmail.com')) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || user?.email !== 'ueservicesllc1@gmail.com') {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-transparent text-foreground font-sans gap-4">
      <Header />
      <main className="flex-1 p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Admin Panel</CardTitle>
            <CardDescription>Manage users, songs, and view analytics.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">User Management</CardTitle>
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+5</div>
                  <p className="text-xs text-muted-foreground">New users this week</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Song Library</CardTitle>
                  <Music className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">125</div>
                  <p className="text-xs text-muted-foreground">Total songs in library</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Site Analytics</CardTitle>
                  <BarChart2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+2.1k</div>
                  <p className="text-xs text-muted-foreground">Setlists created this month</p>
                </CardContent>
              </Card>
            </div>
            <div className="mt-6">
              <p className="text-muted-foreground">
                This is a placeholder for admin-specific functionality. You can add tables, forms, and charts here to manage your application data.
              </p>
              <Link href="/" className="text-accent-foreground underline mt-4 inline-block">
                Return to main app
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
