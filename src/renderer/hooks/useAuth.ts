import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  isFirebaseEnabled,
  onAuthStateChange,
  signInWithGoogle,
  signOutGoogle,
} from '../services/firebaseClient';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return {
    user,
    loading,
    isEnabled: isFirebaseEnabled,
    signInWithGoogle,
    signOutGoogle,
  };
}
