
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getFirestore, collection, getDocs, Timestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type AppUser = {
  uid: string;
  email: string;
  createdAt: Date | null;
};

const db = getFirestore(app);

async function getUsers(): Promise<AppUser[]> {
  const usersCollection = collection(db, 'users');
  const userSnapshot = await getDocs(usersCollection);
  const userList = userSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      uid: data.uid,
      email: data.email,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null
    };
  });
  return userList;
}

export default function UsersAdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && (user?.email !== 'ueservicesllc1@gmail.com')) {
      router.push('/');
    } else if (!loading && user) {
      getUsers().then(fetchedUsers => {
        setUsers(fetchedUsers);
        setDataLoading(false);
      }).catch(err => {
        console.error("Error fetching users:", err);
        setDataLoading(false);
      });
    }
  }, [user, loading, router]);

  if (loading || user?.email !== 'ueservicesllc1@gmail.com' || dataLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-transparent text-foreground font-sans gap-4">
      <Header />
      <main className="flex-1 p-4 md:p-6">
        <div className="mb-4">
            <Button asChild variant="outline">
                <Link href="/admin">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Panel
                </Link>
            </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Administrador de Usuarios</CardTitle>
            <CardDescription>Lista de usuarios registrados en la aplicación.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Fecha de Registro</TableHead>
                  <TableHead>User ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((appUser) => (
                  <TableRow key={appUser.uid}>
                    <TableCell className="font-medium">{appUser.email}</TableCell>
                    <TableCell>{appUser.createdAt ? appUser.createdAt.toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell className="text-muted-foreground">{appUser.uid}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
