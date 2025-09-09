
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';

const auth = getAuth(app);
const db = getFirestore(app);

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<any>;
  signUp: (email: string, pass: string) => Promise<any>;
  signOutUser: () => Promise<any>;
  signInWithGoogle: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const saveUserToFirestore = async (user: User) => {
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  try {
    // Use set with merge:true to create or update user data without overwriting.
    await setDoc(userRef, {
      email: user.email,
      uid: user.uid,
      createdAt: serverTimestamp(),
    }, { merge: true });
    console.log("User data saved/updated in Firestore.");
  } catch (error) {
    console.error("Error saving user to Firestore: ", error);
  }
};


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      // We set loading to false here, but the redirect handler might update the user again.
      setLoading(false);
    });

    // Handle the redirect result from Google Sign-In.
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // This means the user has just signed in via redirect.
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const user = result.user;
          setUser(user);
          // Save the new user's data to Firestore.
          saveUserToFirestore(user);
        }
      }).catch((error) => {
        console.error("Error processing redirect result:", error);
      }).finally(() => {
        // Ensure loading is false after processing is complete.
        setLoading(false);
      });

    return () => unsubscribe();
  }, []);

  const signIn = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };
  
  const signUp = async (email: string, pass: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await saveUserToFirestore(userCredential.user);
    return userCredential;
  };
  
  const signOutUser = () => {
    return signOut(auth);
  };
  
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    // This will redirect the user to the Google sign-in page.
    // After signing in, Firebase will redirect back to your app,
    // and the getRedirectResult effect will handle the rest.
    return signInWithRedirect(auth, provider);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOutUser,
    signInWithGoogle
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
