# SummerStory

Summer activity tracker with a web app (Vite) and desktop app (Electron).

## Quick Start (Web)

```bash
npm install
npm run dev:web
```

## Deploy (Vercel)

This repo already includes `vercel.json`.

1. Import repo in Vercel.
2. Build command: `npm run build:web`
3. Output directory: `dist/renderer`
4. Deploy.

## Google Sign-In + Cross-Device Sync

The web app supports:
- Google sign-in (Firebase Auth)
- Activities/settings sync (Firestore)
- Photo upload and cloud URLs (Firebase Storage)

### 1) Create Firebase project

In Firebase Console:
- Enable **Authentication > Google**
- Create **Cloud Firestore** database
- Enable **Storage**
- Add a Web app and copy config values
- **Authorized domains:** Firebase Console → Authentication → Settings → Authorized domains. Add your live site hostname (e.g. `yoursite.vercel.app` and any custom domain). Without this, sign-in fails or appears to “flash” and cancel.

### 2) Add env vars

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Fill in:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 3) Add Vercel env vars

In Vercel Project Settings, add the same `VITE_FIREBASE_*` variables for Production (and Preview if needed), then redeploy.

### 4) Use in app

Open **Settings > Cloud Sync** and click **Continue with Google**.

When signed in:
- Existing local activities/settings are copied to cloud once (if cloud is empty).
- New edits sync across devices using the same Google account.

## Notes

- Desktop mode (Electron) still uses `electron-store`.
- Web mode without Firebase config falls back to local browser storage.
