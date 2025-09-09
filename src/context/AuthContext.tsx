'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const ADMIN_EMAIL = 'ueservicesllc1@gmail.com';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isAdminView: boolean;
  toggleViewAsAdmin: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isAdminView: false,
  toggleViewAsAdmin: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewAsAdmin, setViewAsAdmin] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      const isUserAdmin = user?.email === ADMIN_EMAIL;
      setIsAdmin(isUserAdmin);
      // Si el usuario no es admin, siempre está en vista de no-admin
      if (!isUserAdmin) {
        setViewAsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const toggleViewAsAdmin = useCallback(() => {
    if (isAdmin) { // Solo el admin real puede cambiar de vista
      setViewAsAdmin(prev => !prev);
    }
  }, [isAdmin]);

  // La vista de admin solo está activa si el usuario es admin y el interruptor está activado
  const isAdminView = isAdmin && viewAsAdmin;

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isAdminView, toggleViewAsAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);