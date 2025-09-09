import { initializeApp, getApp, getApps } from 'firebase/app';

const firebaseConfig = {
  projectId: "lyricstream-jezhi",
  appId: "1:165007207530:web:cc7a6ff41b3a814eff2e13",
  storageBucket: "lyricstream-jezhi.firebasestorage.app",
  apiKey: "AIzaSyAspEwxGynVU5hFekBMDP377zFHotXI450",
  authDomain: "lyricstream-jezhi.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "165007207530"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
