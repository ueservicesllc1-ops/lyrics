
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
  signInWithPopup,
  signInAnonymously
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const saveUserToFirestore = async (user: User) => {
    if (user.isAnonymous) return;
    
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      try {
        await setDoc(userRef, {
          email: user.email,
          uid: user.uid,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error saving new user to Firestore: ", error);
      }
    }
  };
    
  useEffect(() => {
    // This listener handles UI changes for the logged-in (non-anonymous) user.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // This can be a regular user or an anonymous user
      setLoading(false);
    });

    // We ensure there's always a user, signing in anonymously if needed.
    // This helps with Firestore rules (`request.auth != null`).
    if (!auth.currentUser) {
        signInAnonymously(auth).catch(error => {
            console.error("Persistent anonymous sign-in failed on initial load:", error);
        });
    }

    return () => unsubscribe();
  }, []);


  const signIn = async (email: string, pass: string) => {
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
    try {
      const result = await signInWithPopup(auth, provider);
      await saveUserToFirestore(result.user);
      return result;
    } catch (error) {
       console.error("Error during Google sign-in:", error);
       throw error;
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

  // Only render children when loading is false to ensure user state is resolved
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
