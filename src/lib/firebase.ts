import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  projectId: "lyricstream-jezhi",
  appId: "1:165007207530:web:cc7a6ff41b3a814eff2e13",
  storageBucket: "lyricstream-jezhi.firebasestorage.app",
  apiKey: "AIzaSyAspEwxGynVU5hFekBMDP377zFHotXI450",
  authDomain: "lyricstream-jezhi.firebaseapp.com",
  messagingSenderId: "165007207530"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

// Sign in anonymously
signInAnonymously(auth).catch((error) => {
  console.error("Anonymous sign-in failed:", error);
});


export { app, db, auth, onAuthStateChanged };
