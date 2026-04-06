import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  User,
  getAuth,
  getRedirectResult,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

function hasFirebaseConfig() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.storageBucket &&
      firebaseConfig.appId
  );
}

const firebaseEnabled = hasFirebaseConfig();
const app = firebaseEnabled ? initializeApp(firebaseConfig) : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;
export const isFirebaseEnabled = firebaseEnabled;

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

/**
 * Redirect flow is more reliable than popups on hosted sites (Vercel): popups often
 * close immediately when blocked, third-party cookies are restricted, or the domain
 * is not authorized — users only see a flash.
 */
export async function signInWithGoogle() {
  if (!auth) throw new Error('Firebase is not configured.');
  await signInWithRedirect(auth, provider);
}

/** Call once on app load to complete sign-in after returning from Google. */
export async function completeGoogleRedirectSignIn() {
  if (!auth) return { user: null as User | null, error: null as string | null };
  try {
    const result = await getRedirectResult(auth);
    return { user: result?.user ?? null, error: null };
  } catch (e: unknown) {
    const code = e && typeof e === 'object' && 'code' in e ? String((e as { code: string }).code) : '';
    const message =
      e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : String(e);
    return {
      user: null,
      error: formatAuthError(code, message),
    };
  }
}

function formatAuthError(code: string, message: string): string {
  if (code === 'auth/unauthorized-domain') {
    return 'This site’s domain is not allowed in Firebase. In Firebase Console → Authentication → Settings → Authorized domains, add your Vercel URL (e.g. your-app.vercel.app).';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Google sign-in is not enabled. In Firebase Console → Authentication → Sign-in method, enable Google.';
  }
  if (code === 'auth/account-exists-with-different-credential') {
    return message;
  }
  return message || 'Sign-in failed. Try again or check the browser console.';
}

export async function signOutGoogle() {
  if (!auth) return;
  await signOut(auth);
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  if (!auth) {
    callback(null);
    return () => undefined;
  }

  return firebaseOnAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
  return auth?.currentUser ?? null;
}
