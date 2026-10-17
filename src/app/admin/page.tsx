'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Footer from '@/components/Footer';

export default function AdminLoginPage() {
  const router = useRouter();

  // 3-step sequence: phone -> otp -> password (after OTP verified)
  const [step, setStep] = useState<'phone' | 'otp' | 'password'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [checkingExistingSession, setCheckingExistingSession] = useState(true);

  // Auto-redirect if already logged in as admin
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

  // Timer countdown for OTP resend
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Step 1: Send Admin OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, role: 'ADMIN' }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Admin access is restricted to authorized store phone numbers.');
        setLoading(false);
        return;
      }

      setTimer(data.countdownSec || 30);
      if (data.devOtp) {
        setDevOtpHint(data.devOtp);
      }
      setStep('otp');
    } catch {
      setErrorMsg('Failed to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Admin OTP -> Transitions to Password step
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
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

      // OTP verified successfully! Proceed to display Password step
      setStep('password');
    } catch {
      setErrorMsg('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Enter Admin Password -> Login to Admin Dashboard
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

      // Successfully authenticated with both OTP and Password!
      router.push('/admin/dashboard');
    } catch {
      setErrorMsg('Login failed. Please check your connection and try again.');
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
            Two-factor authentication required for store management access.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-label-sm">
          <div
            className={`py-1.5 px-1 rounded-lg border flex flex-col items-center gap-0.5 ${
              step === 'phone'
                ? 'bg-primary/10 border-primary text-primary font-bold'
                : 'bg-surface-container-low border-surface-container text-on-surface-variant'
            }`}
          >
            <span className="text-[10px] uppercase tracking-wider">Step 1</span>
            <span className="font-medium truncate">Phone</span>
          </div>

          <div
            className={`py-1.5 px-1 rounded-lg border flex flex-col items-center gap-0.5 ${
              step === 'otp'
                ? 'bg-primary/10 border-primary text-primary font-bold'
                : step === 'password'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-surface-container-low border-surface-container text-on-surface-variant'
            }`}
          >
            <span className="text-[10px] uppercase tracking-wider">Step 2</span>
            <span className="font-medium truncate">{step === 'password' ? 'OTP ✓' : 'OTP'}</span>
          </div>

          <div
            className={`py-1.5 px-1 rounded-lg border flex flex-col items-center gap-0.5 ${
              step === 'password'
                ? 'bg-primary/10 border-primary text-primary font-bold'
                : 'bg-surface-container-low border-surface-container text-on-surface-variant opacity-60'
            }`}
          >
            <span className="text-[10px] uppercase tracking-wider">Step 3</span>
            <span className="font-medium truncate">Password</span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-label-md text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMsg}</span>
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
                  placeholder="Enter mobile number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full h-12 pl-14 pr-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
                />
              </div>
              <span className="text-[11px] text-on-surface-variant">
                Only the designated store manager phone number is authorized.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || !phoneNumber}
              className="h-12 rounded-xl bg-primary hover:bg-primary-container active:scale-95 text-on-primary font-label-md font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">key</span>
              <span>{loading ? 'Verifying Phone...' : 'Send Admin OTP'}</span>
            </button>
          </form>
        )}

        {/* ── STEP 2: Enter OTP Code ── */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            {devOtpHint && (
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
                Enter 6-Digit Admin OTP
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
                  onClick={handleSendOtp}
                  className="text-primary font-bold hover:underline"
                >
                  Resend OTP
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
                  <span>Verifying OTP...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">security</span>
                  <span>Verify OTP</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ── STEP 3: Display Admin Password (ONLY after OTP) ── */}
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

            <div className="flex items-center justify-between text-xs font-label-md">
              <button
                type="button"
                onClick={() => setStep('otp')}
                className="text-secondary hover:text-primary underline"
              >
                ← Back to OTP
              </button>
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
