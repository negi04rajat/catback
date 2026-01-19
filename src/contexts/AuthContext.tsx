import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/product';

interface AuthUser {
  uid: string;
  email: string | null;
  role: UserRole;
  name?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Firebase isn't configured, run the app in "customer (guest)" mode.
    // This prevents a blank screen caused by Firebase initialization errors.
    if (!isFirebaseConfigured || !auth) {
      setUser(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user role from Google Sheets via edge function
        try {
          const { data, error } = await supabase?.functions.invoke('google-sheets', {
            body: { action: 'getAll', sheet: 'Users' }
          }) ?? { data: null, error: new Error('Supabase not configured') };

          if (!error && data?.data) {
            const userData = data.data.find((u: { email: string }) => 
              u.email === firebaseUser.email
            );
            
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: userData?.role || 'customer',
              name: userData?.name,
            });
          } else {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: 'customer',
            });
          }
        } catch {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: 'customer',
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase is not configured. Set VITE_FIREBASE_* env vars to enable login.');
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, name: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase is not configured. Set VITE_FIREBASE_* env vars to enable signup.');
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Store user data in Google Sheets via edge function
    if (!supabase) {
      throw new Error('Supabase is not configured. Set VITE_SUPABASE_* env vars to enable signup sync.');
    }
    await supabase.functions.invoke('sync-user', {
      body: {
        uid: userCredential.user.uid,
        email,
        name,
        role: 'customer',
      }
    });
  };

  const signOut = async () => {
    if (!isFirebaseConfigured || !auth) {
      setUser(null);
      return;
    }
    await firebaseSignOut(auth);
    setUser(null);
  };

  const refreshUserRole = async () => {
    if (!isFirebaseConfigured || !auth || !auth.currentUser) {
      return;
    }

    const firebaseUser = auth.currentUser;
    try {
      const { data, error } = await supabase?.functions.invoke('google-sheets', {
        body: { action: 'getAll', sheet: 'Users' }
      }) ?? { data: null, error: new Error('Supabase not configured') };

      if (!error && data?.data) {
        const userData = data.data.find((u: { email: string }) => 
          u.email === firebaseUser.email
        );
        
        setUser((prevUser) => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            role: userData?.role || 'customer',
            name: userData?.name || prevUser.name,
          };
        });
      }
    } catch (error) {
      console.error('Failed to refresh user role:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refreshUserRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
