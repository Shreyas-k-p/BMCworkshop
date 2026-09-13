import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

console.log('[BMC BUILD] FIREBASE-BMC-LIVE-V1');

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBN9BN0U1bW9xG7DePO10Q-Cfh4a1hEsLM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "studio-3692413383-3932e.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://studio-3692413383-3932e-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "studio-3692413383-3932e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "studio-3692413383-3932e.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "324012792381",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:324012792381:web:dc7571ed0d41d46a722854"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getDatabase(app);
export const auth = getAuth(app);

console.log('[BMC AUTH] Firebase initialized');
