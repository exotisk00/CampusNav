import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('your-api-key')
);

// Initialize Firebase App singleton safely
let app = null;
let auth = null;
let db = null;
let storage = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  // Safe mock / fallback initialization to ensure app compiles and runs in dev
  try {
    const fallbackConfig = {
      apiKey: 'demo-api-key-mock',
      authDomain: 'campusnav-demo.firebaseapp.com',
      projectId: 'campusnav-demo',
      storageBucket: 'campusnav-demo.firebasestorage.app',
      appId: '1:1234567890:web:abcdef123456',
    };
    app = getApps().length > 0 ? getApp() : initializeApp(fallbackConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (err) {
    console.warn('Firebase initialized in offline mode:', err?.message);
  }
}

export { app, auth, db, storage, firebaseConfig };
