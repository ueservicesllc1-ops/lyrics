
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
    // We don't save anonymous users to the 'users' collection
    if (user.isAnonymous) return;
    
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    // Only create a new document if one doesn't already exist.
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
    // This listener is for UI purposes, to know who is logged in for admin access.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // We set the user state for anyone who is not anonymous.
      if (currentUser && !currentUser.isAnonymous) {
        setUser(currentUser);
      } else {
        setUser(null); // No admin user is signed in.
      }
      setLoading(false);
    });

    // In parallel, we ensure there is always a session for DB ops.
    // If no one is signed in (not admin, not anon), we sign in anonymously.
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
    // When the admin signs out, we ensure the anonymous session is re-established
    // for subsequent database operations if needed.
    return signOut(auth).then(() => {
      setUser(null);
      return signInAnonymously(auth).catch(error => {
          console.error("Anonymous sign-in failed after sign out:", error);
      });
    });
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
