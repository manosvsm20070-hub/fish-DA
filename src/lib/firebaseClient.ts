import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  Auth,
} from 'firebase/auth';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    !firebaseConfig.apiKey.includes('YOUR_') &&
    firebaseConfig.apiKey.length > 10
  );
}

export function getFirebaseClientApp(): FirebaseApp | null {
  if (typeof window === 'undefined') return null;
  if (!isFirebaseConfigured()) return null;

  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseClientApp();
  if (!app) return null;
  return getAuth(app);
}

export function setupRecaptcha(
  containerId: string,
  onSolved?: () => void
): RecaptchaVerifier | null {
  const auth = getFirebaseAuth();
  if (!auth) return null;

  // Clear existing verifier attached to container if any
  const container = document.getElementById(containerId);
  if (!container) return null;
  container.innerHTML = '';

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      if (onSolved) onSolved();
    },
    'expired-callback': () => {
      console.warn('reCAPTCHA expired. Please try again.');
    },
  });

  return verifier;
}

export async function sendFirebasePhoneOtp(
  phone: string,
  appVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error('Firebase Authentication is not configured.');
  }
  return await signInWithPhoneNumber(auth, phone, appVerifier);
}

export function formatFirebaseError(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = String((error as { code: unknown }).code);
    switch (code) {
      case 'auth/invalid-verification-code':
        return 'Invalid OTP code. Please enter the correct 6-digit code received on your phone.';
      case 'auth/code-expired':
        return 'The OTP has expired. Please request a new verification code.';
      case 'auth/too-many-requests':
        return 'Too many requests from this device or number. Please wait a few minutes before trying again.';
      case 'auth/invalid-phone-number':
        return 'Invalid phone number format. Please check the number and country code.';
      case 'auth/quota-exceeded':
        return 'SMS quota exceeded. Please contact store support.';
      case 'auth/captcha-check-failed':
        return 'Security check failed. Please refresh the page and try again.';
      case 'auth/missing-phone-number':
        return 'Phone number is required.';
      case 'auth/network-request-failed':
        return 'Network connection error. Please check your internet connection.';
      default:
        if ('message' in error && typeof error.message === 'string') {
          return error.message;
        }
        return `Authentication error: ${code}`;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred during OTP verification.';
}
