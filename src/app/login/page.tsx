'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { EmailAuthProvider, GoogleAuthProvider } from 'firebase/auth';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const uiConfig = {
  signInFlow: 'popup',
  signInSuccessUrl: '/admin',
  signInOptions: [
    GoogleAuthProvider.PROVIDER_ID,
    EmailAuthProvider.PROVIDER_ID,
  ],
};

const FirebaseUI = () => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get or Create a firebaseUI instance.
    const firebaseUiWidget = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);
    if (uiConfig.signInFlow === 'popup') {
       firebaseUiWidget.reset();
    }
    
    // Render the firebaseUI Widget.
    if (elementRef.current) {
      firebaseUiWidget.start(elementRef.current, uiConfig);
    }
  }, []);

  return <div ref={elementRef} />;
}


export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/admin');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center mt-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Iniciar Sesión</CardTitle>
        </CardHeader>
        <CardContent>
           <FirebaseUI />
        </CardContent>
      </Card>
    </div>
  );
}
