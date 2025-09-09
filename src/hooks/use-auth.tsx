
"use client";

import { 
  useState, 
  useEffect, 
  createContext, 
  useContext, 
  ReactNode 
} from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const saveUserToFirestore = async (user: User | null) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      try {
        await setDoc(userRef, {
          email: user.email,
          uid: user.uid,
          createdAt: serverTimestamp(),
        });
        console.log("New user data saved to Firestore.");
      } catch (error) {
        console.error("Error saving new user to Firestore: ", error);
      }
    }
  };
    
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await saveUserToFirestore(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Handle redirect result
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          await saveUserToFirestore(result.user);
          setUser(result.user);
        }
      })
      .catch((error) => {
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
    setLoading(true);
    await signInWithRedirect(auth, provider);
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
