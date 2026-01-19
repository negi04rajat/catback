import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
);

// In local dev, env vars are sometimes missing. Avoid crashing the entire app at import-time.
if (!isFirebaseConfigured) {
  // Helpful runtime log for local debugging, without printing secrets
  // eslint-disable-next-line no-console
  console.warn('[firebase] Firebase env incomplete. Check VITE_FIREBASE_* variables in .env');
}

export const auth = isFirebaseConfigured ? getAuth(initializeApp(firebaseConfig)) : null;
