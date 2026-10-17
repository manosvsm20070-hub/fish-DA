import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

// Initialize Firebase Admin if credentials are provided
function getFirebaseAdminAuth(): Auth | null {
  try {
    if (getApps().length > 0) {
      return getAuth();
    }

    const projectId =
      process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      return getAuth();
    }

    // Check if JSON service account string is provided
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountJson) {
      const parsed = JSON.parse(serviceAccountJson);
      initializeApp({
        credential: cert(parsed),
      });
      return getAuth();
    }
  } catch (err) {
    console.warn('Firebase Admin SDK initialization skipped or failed:', err);
  }

  return null;
}

export interface VerifiedFirebaseUser {
  valid: boolean;
  phone?: string;
  uid?: string;
  error?: string;
}

/**
 * Server-side verification of Firebase ID token.
 * Uses Firebase Admin SDK when service account is available,
 * or verifies via Google's Identity Toolkit REST API with the Web API key.
 */
export async function verifyFirebaseIdToken(idToken: string): Promise<VerifiedFirebaseUser> {
  if (!idToken || typeof idToken !== 'string') {
    return { valid: false, error: 'Missing or invalid token.' };
  }

  // 1. Try Firebase Admin SDK first if configured
  const adminAuth = getFirebaseAdminAuth();
  if (adminAuth) {
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      const phone = decoded.phone_number || '';
      return {
        valid: true,
        phone,
        uid: decoded.uid,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid Firebase ID token';
      console.error('Firebase Admin verifyIdToken error:', msg);
      return { valid: false, error: msg };
    }
  }

  // 2. Authoritative Google Identity Toolkit REST API verification
  const apiKey =
    process.env.FIREBASE_API_KEY ||
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (!apiKey) {
    return {
      valid: false,
      error: 'Firebase API key is not configured on the server.',
    };
  }

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );

    const data = await res.json();

    if (!res.ok || !data.users || data.users.length === 0) {
      const errorMessage = data?.error?.message || 'Token verification failed';
      return { valid: false, error: errorMessage };
    }

    const user = data.users[0];
    const phone = user.phoneNumber || '';

    return {
      valid: true,
      phone,
      uid: user.localId,
    };
  } catch (err: unknown) {
    console.error('Identity Toolkit verification failed:', err);
    return {
      valid: false,
      error: 'Could not connect to Firebase verification service.',
    };
  }
}
