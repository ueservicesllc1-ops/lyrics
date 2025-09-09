
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
    await setDoc(userRef, {
      email: user.email,
      uid: user.uid,
      createdAt: serverTimestamp(),
    }, { merge: true });
    console.log("User saved to firestore");
  } catch (error) {
    console.error("Error saving user to Firestore: ", error);
  }
};


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      }
      // Delay setting loading to false until redirect result is processed
    });

    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          const user = result.user;
          setUser(user);
          saveUserToFirestore(user).catch(err => console.error("Failed to save user from redirect", err));
        }
      }).catch((error) => {
        console.error("Error getting redirect result:", error);
      }).finally(() => {
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
  
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    
    // Check if running in a top-level window (not an iframe)
    if (window.top === window) {
      return signInWithRedirect(auth, provider);
    }

    // Workaround for sandboxed environments like Firebase Studio
    // that block popups and also have issues with redirects inside iframes.
    // We manually construct the URL and redirect the top-level window.
    try {
        const authUrl = `https://${auth.config.authDomain}/__/auth/handler?apiKey=${auth.config.apiKey}&appName=${auth.app.name}&authType=signInViaRedirect&providerId=${provider.providerId}`;
        if (window.top) {
            window.top.location.href = authUrl;
        } else {
            // Fallback for extreme cases, though it might be blocked
            window.location.href = authUrl;
        }
    } catch (e) {
        console.error("Could not redirect for Google Sign-In:", e);
        // Fallback to standard redirect if top-level navigation fails
        return signInWithRedirect(auth, provider);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOutUser,
    signInWithGoogle
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
