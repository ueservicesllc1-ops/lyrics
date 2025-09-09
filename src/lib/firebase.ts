import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

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

export { app, db, auth, onAuthStateChanged };
