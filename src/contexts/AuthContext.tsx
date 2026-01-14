import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
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
  signUp: (email: string, password: string, name: string, role: 'retailer' | 'admin') => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user role from Google Sheets via edge function
        try {
          const { data, error } = await supabase.functions.invoke('google-sheets', {
            body: { action: 'getAll', sheet: 'Users' }
          });

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
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, name: string, role: 'retailer' | 'admin') => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Store user data in Google Sheets via edge function
    await supabase.functions.invoke('sync-user', {
      body: {
        uid: userCredential.user.uid,
        email,
        name,
        role,
      }
    });
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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
