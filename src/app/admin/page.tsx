'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Footer from '@/components/Footer';
import {
  isFirebaseConfigured,
  setupRecaptcha,
  sendFirebasePhoneOtp,
  formatFirebaseError,
} from '@/lib/firebaseClient';
import type { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';

export default function AdminLoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<'phone' | 'otp' | 'password'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [firebaseActive, setFirebaseActive] = useState<boolean>(() => isFirebaseConfigured());
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [checkingExistingSession, setCheckingExistingSession] = useState(true);

  // Check existing session
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/check');
        const data = await res.json();
        if (res.ok && data.authenticated) {
          router.replace('/admin/dashboard');
          return;
        }
      } catch {
        // Not authenticated
      } finally {
        setCheckingExistingSession(false);
      }
    })();
  }, [router]);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Clean up reCAPTCHA verifier on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  // Step 1: Validate Admin Phone and Send Real SMS OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      // 1. Server-side pre-authorization check
      const checkRes = await fetch('/api/admin/check-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber }),
      });

      const checkData = await checkRes.json();
      if (!checkRes.ok || !checkData.success) {
        setErrorMsg(checkData.error || 'Access denied. This number is not authorized.');
        setLoading(false);
        return;
      }

      const authorizedPhone = checkData.phone;

      // 2. Dispatch OTP via Firebase Phone Auth or Fallback
      if (isFirebaseConfigured()) {
        const verifier = setupRecaptcha('admin-recaptcha-container', () => {
          // reCAPTCHA solved
        });

        if (!verifier) {
          throw new Error('Could not initialize reCAPTCHA verifier. Please refresh the page.');
        }

        recaptchaVerifierRef.current = verifier;
        const confirmResult = await sendFirebasePhoneOtp(authorizedPhone, verifier);
        setConfirmationResult(confirmResult);
        setFirebaseActive(true);
        setTimer(60);
        setSuccessMsg(`Real SMS OTP dispatched to ${authorizedPhone} via Firebase.`);
        setStep('otp');
      } else {
        // Development / Fallback mode
        const res = await fetch('/api/otp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: authorizedPhone, role: 'ADMIN' }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setErrorMsg(data.error || 'Failed to send OTP.');
          setLoading(false);
          return;
        }

        setTimer(data.countdownSec || 30);
        if (data.devOtp) {
          setDevOtpHint(data.devOtp);
        }
        setStep('otp');
      }
    } catch (err: unknown) {
      console.error('Admin OTP dispatch failed:', err);
      setErrorMsg(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (confirmationResult) {
        // 1. Verify 6-digit OTP directly with Firebase
        const userCredential = await confirmationResult.confirm(otpCode.trim());
        const idToken = await userCredential.user.getIdToken();

        // 2. Transmit verified Firebase ID token to server for admin session creation
        const serverRes = await fetch('/api/admin/login-firebase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });

        const serverData = await serverRes.json();
        if (!serverRes.ok || !serverData.success) {
          setErrorMsg(serverData.error || 'Admin verification rejected by server.');
          setLoading(false);
          return;
        }

        // Successfully verified with Firebase and established Admin Session!
        router.push('/admin/dashboard');
      } else {
        // Development fallback verification
        const res = await fetch('/api/otp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: phoneNumber,
            code: otpCode,
            role: 'ADMIN',
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setErrorMsg(data.error || 'Invalid OTP code.');
          setLoading(false);
          return;
        }

        setStep('password');
      }
    } catch (err: unknown) {
      console.error('OTP verification error:', err);
      setErrorMsg(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  // Step 3 (Fallback mode only): Enter Admin Password
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Incorrect admin password.');
        setLoading(false);
        return;
      }

      router.push('/admin/dashboard');
    } catch {
      setErrorMsg('Login failed. Please check connection and try again.');
      setLoading(false);
    }
  };

  if (checkingExistingSession) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="font-label-md text-sm text-on-surface-variant font-medium">
            Verifying admin session...
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-md mx-auto w-full">
      {/* Hidden reCAPTCHA container for Firebase Phone Auth */}
      <div id="admin-recaptcha-container" />

      <div className="w-full bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-surface-container shadow-md flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="relative h-12 w-44">
            <Image
              src="/dolphin-logo.svg"
              alt="Dolphin Aquarium Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="font-label-sm text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wider mt-1">
            Restricted Admin Area
          </span>
          <h1 className="font-headline-md font-bold text-on-surface">Store Administrator</h1>
          <p className="font-body-sm text-xs text-on-surface-variant max-w-xs">
            Real-time SMS OTP authentication via Firebase Phone Auth.
          </p>
        </div>

        {/* Firebase Status Badge */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface-container text-xs">
          <span className="text-on-surface-variant font-medium">Authentication Provider:</span>
          {firebaseActive ? (
            <span className="flex items-center gap-1.5 font-bold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Firebase SMS Active
            </span>
          ) : (
            <span className="flex items-center gap-1.5 font-bold text-amber-700" title="Add Firebase keys to .env.local for production SMS delivery">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Dev / Setup Mode
            </span>
          )}
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-2 gap-2 text-center text-xs font-label-sm">
          <div
            className={`py-1.5 px-1 rounded-lg border flex flex-col items-center gap-0.5 ${
              step === 'phone'
                ? 'bg-primary/10 border-primary text-primary font-bold'
                : 'bg-surface-container-low border-surface-container text-on-surface-variant'
            }`}
          >
            <span className="text-[10px] uppercase tracking-wider">Step 1</span>
            <span className="font-medium truncate">Admin Phone</span>
          </div>

          <div
            className={`py-1.5 px-1 rounded-lg border flex flex-col items-center gap-0.5 ${
              step === 'otp' || step === 'password'
                ? 'bg-primary/10 border-primary text-primary font-bold'
                : 'bg-surface-container-low border-surface-container text-on-surface-variant'
            }`}
          >
            <span className="text-[10px] uppercase tracking-wider">Step 2</span>
            <span className="font-medium truncate">SMS OTP</span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-label-md text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-label-md text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── STEP 1: Phone Number ── */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-xs font-bold text-on-surface">
                Admin Mobile Number
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 font-label-md text-sm text-on-surface-variant font-bold">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  autoFocus
                  placeholder="Enter 10-digit mobile number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full h-12 pl-14 pr-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
                />
              </div>
              <span className="text-[11px] text-on-surface-variant">
                Only the designated store manager phone number is authorized to request admin access.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || !phoneNumber}
              className="h-12 rounded-xl bg-primary hover:bg-primary-container active:scale-95 text-on-primary font-label-md font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Authorization...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">sms</span>
                  <span>Send Real SMS OTP</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ── STEP 2: Enter OTP Code ── */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            {devOtpHint && !confirmationResult && (
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs flex items-center justify-between">
                <span>
                  <strong>Dev Mock OTP:</strong>{' '}
                  <code className="font-bold text-sm tracking-widest">{devOtpHint}</code>
                </span>
                <button
                  type="button"
                  onClick={() => setOtpCode(devOtpHint)}
                  className="underline font-bold text-[11px]"
                >
                  Auto-fill
                </button>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-xs font-bold text-on-surface">
                Enter 6-Digit SMS Verification Code
              </label>
              <input
                type="text"
                required
                autoFocus
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full h-12 text-center tracking-[0.5em] font-headline-sm font-bold rounded-xl bg-surface-container-low border border-outline-variant/60 focus:ring-2 focus:ring-primary/40 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between text-xs font-label-md">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-secondary hover:text-primary underline"
              >
                Change Phone
              </button>

              {timer > 0 ? (
                <span className="text-on-surface-variant">Resend in {timer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  className="text-primary font-bold hover:underline"
                >
                  Resend SMS OTP
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="h-12 rounded-xl bg-primary hover:bg-primary-container active:scale-95 text-on-primary font-label-md font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Code with Firebase...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  <span>Verify and Login</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ── STEP 3: Fallback Password login if in dev mode ── */}
        {step === 'password' && (
          <form onSubmit={handlePasswordLogin} className="flex flex-col gap-4 animate-in fade-in duration-200">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
              <span>OTP verified. Please enter the master password to continue.</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-xs font-bold text-on-surface">
                Admin Master Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-on-surface-variant flex items-center">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-11 pr-11 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-on-surface-variant hover:text-on-surface p-1 rounded transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="h-12 rounded-xl bg-primary hover:bg-primary-container active:scale-98 text-on-primary font-label-md font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer mt-1"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  <span>Enter Admin Dashboard</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      <Footer />
    </main>
  );
}
