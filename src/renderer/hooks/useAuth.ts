import { useEffect, useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  isFirebaseEnabled,
  onAuthStateChange,
  signInWithGoogle,
  signOutGoogle,
  completeGoogleRedirectSignIn,
} from '../services/firebaseClient';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const { error } = await completeGoogleRedirectSignIn();
      if (!cancelled && error) setAuthError(error);
    })();

    const unsubscribe = onAuthStateChange((nextUser) => {
      setUser(nextUser);
      setLoading(false);
      if (nextUser) setAuthError(null);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const signIn = useCallback(async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (e: unknown) {
      const message =
        e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : String(e);
      setAuthError(message);
    }
  }, []);

  return {
    user,
    loading,
    authError,
    clearAuthError,
    isEnabled: isFirebaseEnabled,
    signInWithGoogle: signIn,
    signOutGoogle,
  };
}
