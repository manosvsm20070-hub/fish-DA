'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Footer from '@/components/Footer';

export default function AdminLoginPage() {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  // Handle Admin Password Login
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

      // Successfully authenticated with password!
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
            Enter the master administrator password to access catalog and order management.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-label-md text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handlePasswordLogin} className="flex flex-col gap-4">
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
      </div>

      <Footer />
    </main>
  );
}
