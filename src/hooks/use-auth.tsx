
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
  // This state is for the UI, to track the logged-in administrator.
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
        console.log("New user data saved to Firestore.");
      } catch (error) {
        console.error("Error saving new user to Firestore: ", error);
      }
    }
  };
    
  useEffect(() => {
    // This ensures we always have an anonymous session for database operations.
    // This runs in parallel to the user login state.
    const ensureAnonymousSession = async () => {
      if (!auth.currentUser) {
        try {
            await signInAnonymously(auth);
            console.log("Anonymous session established for DB operations.");
        } catch (error) {
            console.error("Anonymous sign-in failed:", error);
        }
      }
    };
    ensureAnonymousSession();

    // This listener is only for UI purposes, to know who is logged in.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && !currentUser.isAnonymous) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const signIn = async (email: string, pass: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    if (!userCredential.user.isAnonymous) {
      setUser(userCredential.user);
    }
    return userCredential;
  };
  
  const signUp = async (email: string, pass: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await saveUserToFirestore(userCredential.user);
    if (!userCredential.user.isAnonymous) {
      setUser(userCredential.user);
    }
    return userCredential;
  };
  
  const signOutUser = () => {
    const originalUser = auth.currentUser;
    return signOut(auth).then(() => {
      setUser(null);
      // If the user signing out was not anonymous, we must re-establish
      // the anonymous session for database operations.
      if (originalUser && !originalUser.isAnonymous) {
        return signInAnonymously(auth);
      }
    });
  };
  
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await saveUserToFirestore(result.user);
      if (!result.user.isAnonymous) {
        setUser(result.user);
      }
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
