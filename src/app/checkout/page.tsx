'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { CustomerDetails } from '@/types';
import Footer from '@/components/Footer';
import {
  isFirebaseConfigured,
  setupRecaptcha,
  sendFirebasePhoneOtp,
  formatFirebaseError,
} from '@/lib/firebaseClient';
import type { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';

type CheckoutStep = 'phone' | 'otp' | 'details' | 'review';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [step, setStep] = useState<CheckoutStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [timer, setTimer] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    house: '',
    city: 'Sothupakkam',
    district: 'Chengalpattu',
    state: 'Tamil Nadu',
    pinCode: '603319',
    phoneNumber: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Delivery charge calculation: free over ₹1500, else ₹100
  const deliveryCharge = subtotal >= 1500 ? 0 : 100;
  const grandTotal = subtotal + deliveryCharge;

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
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

  // Format phone number to E.164 (+91XXXXXXXXXX or international)
  const formatPhoneNumber = (raw: string): string => {
    const cleaned = raw.trim().replace(/[\s\-\(\)]/g, '');
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    if (cleaned.startsWith('0') && cleaned.length === 11) {
      return `+91${cleaned.substring(1)}`;
    }
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return `+${cleaned}`;
    }
    return `+91${cleaned}`;
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    const formatted = formatPhoneNumber(phoneNumber);

    try {
      if (isFirebaseConfigured()) {
        const verifier = setupRecaptcha('checkout-recaptcha-container', () => {
          // reCAPTCHA solved
        });

        if (!verifier) {
          throw new Error('Could not initialize reCAPTCHA verifier. Please refresh the page.');
        }

        recaptchaVerifierRef.current = verifier;
        const confirmResult = await sendFirebasePhoneOtp(formatted, verifier);
        setConfirmationResult(confirmResult);
        setVerifiedPhone(formatted);
        setTimer(60);
        setSuccessMsg(`Real SMS OTP sent to ${formatted}.`);
        setStep('otp');
      } else {
        // Development / Fallback mode
        const res = await fetch('/api/otp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: formatted, role: 'CUSTOMER' }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setErrorMsg(data.error || 'Failed to send OTP.');
          setLoading(false);
          return;
        }

        setVerifiedPhone(data.phone);
        setTimer(data.countdownSec || 30);
        if (data.devOtp) {
          setDevOtpHint(data.devOtp);
        }
        setStep('otp');
      }
    } catch (err: unknown) {
      console.error('Customer OTP dispatch failed:', err);
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
        // 1. Verify 6-digit OTP code directly with Firebase
        const userCredential = await confirmationResult.confirm(otpCode.trim());
        const idToken = await userCredential.user.getIdToken();

        // 2. Exchange Firebase ID Token on server for verified customer session token
        const serverRes = await fetch('/api/otp/verify-firebase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });

        const serverData = await serverRes.json();
        if (!serverRes.ok || !serverData.success) {
          setErrorMsg(serverData.error || 'Customer verification rejected by server.');
          setLoading(false);
          return;
        }

        setSessionToken(serverData.token);
        setCustomerDetails((prev) => ({
          ...prev,
          phoneNumber: serverData.phone,
        }));
        setSuccessMsg(`Phone ${serverData.phone} verified successfully!`);
        setStep('details');
      } else {
        // Fallback development mode
        const res = await fetch('/api/otp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: verifiedPhone,
            code: otpCode,
            role: 'CUSTOMER',
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setErrorMsg(data.error || 'Invalid OTP code.');
          setLoading(false);
          return;
        }

        setSessionToken(data.token);
        setCustomerDetails((prev) => ({
          ...prev,
          phoneNumber: data.phone,
        }));
        setStep('details');
      }
    } catch (err: unknown) {
      console.error('Customer verification failed:', err);
      setErrorMsg(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  // Changing phone number resets verification
  const handleChangePhoneNumber = () => {
    setVerifiedPhone('');
    setSessionToken('');
    setConfirmationResult(null);
    setOtpCode('');
    setCustomerDetails((prev) => ({ ...prev, phoneNumber: '' }));
    setStep('phone');
  };

  // Step 3: Validate Delivery Details & Move to Review
  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerDetails.name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!customerDetails.house.trim()) {
      setErrorMsg('Please enter your house or street address.');
      return;
    }
    if (!customerDetails.city.trim()) {
      setErrorMsg('Please enter your city / town.');
      return;
    }
    if (!customerDetails.district.trim()) {
      setErrorMsg('Please enter your district.');
      return;
    }
    if (!customerDetails.state.trim()) {
      setErrorMsg('Please enter your state.');
      return;
    }
    if (!customerDetails.pinCode || !/^\d{6}$/.test(customerDetails.pinCode.trim())) {
      setErrorMsg('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    setStep('review');
  };

  // Step 4: Final Place Order
  const handlePlaceOrder = async () => {
    if (isSubmittingOrder) return;
    setIsSubmittingOrder(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: sessionToken,
          customerDetails,
          items,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to place order.');
        setIsSubmittingOrder(false);
        return;
      }

      // Success! Clear cart and route to order success page
      clearCart();
      router.push(`/order-success/${data.orderNumber}`);
    } catch {
      setErrorMsg('Failed to process order. Please try again.');
      setIsSubmittingOrder(false);
    }
  };

  // If cart is empty, prompt to browse
  if (items.length === 0) {
    return (
      <main className="flex-1 flex flex-col w-full px-4 md:px-8 max-w-7xl mx-auto py-12">
        <div className="py-16 text-center flex flex-col items-center justify-center gap-3 bg-surface-container-low rounded-2xl p-8 border border-surface-container">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant">shopping_cart</span>
          <h2 className="font-headline-sm font-bold text-on-surface">Your cart is empty.</h2>
          <p className="font-body-sm text-xs text-on-surface-variant max-w-xs">
            Please add items to your cart before proceeding to checkout.
          </p>
          <Link
            href="/fish"
            className="mt-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md font-bold text-xs"
          >
            Continue Shopping
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col w-full px-4 md:px-8 max-w-4xl mx-auto">
      {/* Invisible reCAPTCHA container for customer Firebase phone auth */}
      <div id="checkout-recaptcha-container" />

      {/* Checkout Progress Stepper */}
      <div className="w-full py-2 mb-4 flex items-center justify-between">
        <h1 className="font-headline-lg-mobile text-on-surface font-bold">Secure Checkout</h1>
        <span className="font-label-sm text-xs px-3 py-1 rounded-full bg-surface-container text-primary font-bold">
          Step{' '}
          {step === 'phone' || step === 'otp'
            ? '1 of 3: Phone OTP'
            : step === 'details'
            ? '2 of 3: Details'
            : '3 of 3: Review'}
        </span>
      </div>

      {errorMsg && (
        <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-label-md text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-label-md text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Visual Step Indicator */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div
          className={`py-2 px-3 rounded-xl border flex flex-col items-center gap-1 text-center ${
            step === 'phone' || step === 'otp'
              ? 'bg-primary/10 border-primary text-primary font-bold'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}
        >
          <span className="text-[10px] uppercase tracking-wider">Step 1</span>
          <span className="font-label-md text-xs">
            {verifiedPhone ? 'Phone Verified ✓' : 'Verify Mobile'}
          </span>
        </div>

        <div
          className={`py-2 px-3 rounded-xl border flex flex-col items-center gap-1 text-center ${
            step === 'details'
              ? 'bg-primary/10 border-primary text-primary font-bold'
              : step === 'review'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-surface-container-low border-surface-container text-on-surface-variant opacity-60'
          }`}
        >
          <span className="text-[10px] uppercase tracking-wider">Step 2</span>
          <span className="font-label-md text-xs">Delivery Details</span>
        </div>

        <div
          className={`py-2 px-3 rounded-xl border flex flex-col items-center gap-1 text-center ${
            step === 'review'
              ? 'bg-primary/10 border-primary text-primary font-bold'
              : 'bg-surface-container-low border-surface-container text-on-surface-variant opacity-60'
          }`}
        >
          <span className="text-[10px] uppercase tracking-wider">Step 3</span>
          <span className="font-label-md text-xs">Review & Place</span>
        </div>
      </div>

      {/* ================= STEP 1: PHONE NUMBER INPUT ================= */}
      {step === 'phone' && (
        <section className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-headline-sm font-bold text-on-surface">Step 1: Mobile Verification</h2>
            <p className="font-body-sm text-xs text-on-surface-variant">
              Enter your mobile number to receive a real-time SMS OTP verification code before placing your aquarium order.
            </p>
          </div>

          <form onSubmit={handleSendOtp} className="flex flex-col gap-4 max-w-md">
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-xs font-bold text-on-surface">
                Mobile Number (India +91)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 font-label-md text-sm text-on-surface-variant font-bold">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full h-12 pl-14 pr-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
                />
              </div>
              <span className="text-[11px] text-on-surface-variant">
                We will dispatch an SMS containing a 6-digit verification code.
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
                  <span>Dispatching SMS OTP...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">sms</span>
                  <span>Send Real SMS OTP</span>
                </>
              )}
            </button>
          </form>
        </section>
      )}

      {/* ================= STEP 2: OTP VERIFICATION ================= */}
      {step === 'otp' && (
        <section className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-headline-sm font-bold text-on-surface">Enter Verification Code</h2>
            <p className="font-body-sm text-xs text-on-surface-variant">
              We sent a 6-digit OTP code via SMS to <strong>{verifiedPhone}</strong>.
            </p>
          </div>

          {devOtpHint && !confirmationResult && (
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs flex items-center justify-between">
              <span>
                <strong>Dev Mock OTP:</strong> <code className="font-bold text-sm tracking-widest">{devOtpHint}</code>
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

          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4 max-w-md">
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-xs font-bold text-on-surface">
                6-Digit SMS Verification Code:
              </label>
              <input
                type="text"
                required
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
                <span className="text-on-surface-variant">Resend OTP in {timer}s</span>
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
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Verify OTP & Continue</span>
                </>
              )}
            </button>
          </form>
        </section>
      )}

      {/* ================= STEP 3: CUSTOMER DETAILS FORM ================= */}
      {step === 'details' && (
        <section className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h2 className="font-headline-sm font-bold text-on-surface">Delivery Details</h2>
            <p className="font-body-sm text-xs text-on-surface-variant">
              Please enter your full address for safe transit and dispatch.
            </p>
          </div>

          <form onSubmit={handleDetailsSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="font-label-md text-xs font-bold text-on-surface">Full Name *</label>
              <input
                type="text"
                required
                value={customerDetails.name}
                onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                placeholder="e.g. Ramesh Kumar"
                className="h-11 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
              />
            </div>

            {/* House / Street */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="font-label-md text-xs font-bold text-on-surface">
                House / Flat / Street Address *
              </label>
              <input
                type="text"
                required
                value={customerDetails.house}
                onChange={(e) => setCustomerDetails({ ...customerDetails, house: e.target.value })}
                placeholder="e.g. No. 12, Gandhi Street, Near Temple"
                className="h-11 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
              />
            </div>

            {/* City */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-xs font-bold text-on-surface">City / Town *</label>
              <input
                type="text"
                required
                value={customerDetails.city}
                onChange={(e) => setCustomerDetails({ ...customerDetails, city: e.target.value })}
                className="h-11 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
              />
            </div>

            {/* District */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-xs font-bold text-on-surface">District *</label>
              <input
                type="text"
                required
                value={customerDetails.district}
                onChange={(e) => setCustomerDetails({ ...customerDetails, district: e.target.value })}
                className="h-11 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
              />
            </div>

            {/* State */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-xs font-bold text-on-surface">State *</label>
              <input
                type="text"
                required
                value={customerDetails.state}
                onChange={(e) => setCustomerDetails({ ...customerDetails, state: e.target.value })}
                className="h-11 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
              />
            </div>

            {/* PIN Code */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-xs font-bold text-on-surface">6-Digit PIN Code *</label>
              <input
                type="text"
                required
                maxLength={6}
                value={customerDetails.pinCode}
                onChange={(e) => setCustomerDetails({ ...customerDetails, pinCode: e.target.value.replace(/\D/g, '') })}
                className="h-11 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
              />
            </div>

            {/* Verified Phone (Locked to prevent alteration without re-verification) */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="font-label-md text-xs font-bold text-on-surface flex items-center gap-1">
                <span>Verified Phone Number:</span>
                <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span> Verified
                </span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={customerDetails.phoneNumber}
                  className="h-11 px-3.5 rounded-xl bg-surface-container font-mono text-sm text-on-surface flex-1 cursor-not-allowed border border-outline-variant/40"
                />
                <button
                  type="button"
                  onClick={handleChangePhoneNumber}
                  className="px-3 h-11 text-xs text-secondary hover:text-primary underline font-medium cursor-pointer"
                >
                  Change Phone
                </button>
              </div>
              <span className="text-[11px] text-on-surface-variant">
                Changing your phone number requires real SMS verification again.
              </span>
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 h-12 rounded-xl bg-primary hover:bg-primary-container active:scale-95 text-on-primary font-label-md font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <span>Continue to Order Review</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </form>
        </section>
      )}

      {/* ================= STEP 4: ORDER REVIEW & CONFIRMATION ================= */}
      {step === 'review' && (
        <section className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-surface-container-high pb-4">
            <div>
              <h2 className="font-headline-sm font-bold text-on-surface">Review Your Order</h2>
              <p className="font-body-sm text-xs text-on-surface-variant">
                Confirm your order details before final submission.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep('details')}
              className="font-label-md text-xs text-secondary hover:text-primary underline"
            >
              Edit Address
            </button>
          </div>

          {/* Delivery Address Summary */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-1 text-xs">
            <span className="font-label-md font-bold text-on-surface text-sm">Delivery Address:</span>
            <p className="text-on-surface font-medium">{customerDetails.name}</p>
            <p className="text-on-surface-variant">{customerDetails.house}</p>
            <p className="text-on-surface-variant">
              {customerDetails.city}, {customerDetails.district}, {customerDetails.state} - {customerDetails.pinCode}
            </p>
            <p className="text-on-surface-variant font-mono">
              Phone: {customerDetails.phoneNumber} (Verified)
            </p>
          </div>

          {/* Order Items List */}
          <div className="flex flex-col gap-3">
            <span className="font-label-md font-bold text-on-surface text-sm">
              Items in Order ({items.reduce((acc, i) => acc + i.quantity, 0)}):
            </span>
            <div className="divide-y divide-surface-container-high border-y border-surface-container-high">
              {items.map((item) => (
                <div key={`${item.productId}-${item.selectedSize}`} className="py-3 flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg bg-surface-container overflow-hidden shrink-0">
                    {item.primaryImage ? (
                      <Image
                        src={item.primaryImage}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]">set_meal</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-label-md text-xs font-bold text-on-surface truncate">
                      {item.productName}
                    </p>
                    <p className="font-body-sm text-[11px] text-on-surface-variant truncate">
                      Size: {item.selectedSize} | Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="font-label-md text-xs font-bold text-on-surface shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Calculation Breakdown */}
          <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2">
            <div className="flex justify-between text-xs text-on-surface-variant">
              <span>Items Subtotal:</span>
              <span className="font-semibold text-on-surface">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs text-on-surface-variant">
              <span>Delivery Charges (Sothupakkam & Surrounding):</span>
              <span className="font-semibold text-on-surface">
                {deliveryCharge === 0 ? (
                  <span className="text-emerald-700 font-bold">FREE</span>
                ) : (
                  `₹${deliveryCharge}`
                )}
              </span>
            </div>
            <div className="pt-2 border-t border-surface-container-high flex justify-between items-baseline">
              <span className="font-headline-sm font-bold text-on-surface">Grand Total:</span>
              <span className="font-headline-xl font-extrabold text-primary">
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Notice & Place Order Button */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] text-on-surface-variant">
              By clicking &quot;Place Order&quot;, your request is submitted directly to our Sothupakkam store. The team will contact you on your verified phone number to confirm dispatch timing.
            </p>

            <button
              type="button"
              disabled={isSubmittingOrder}
              onClick={handlePlaceOrder}
              className="h-14 rounded-xl bg-[#cc4729] hover:bg-[#b03b20] active:scale-95 text-white font-label-lg font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 text-base cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">check_circle</span>
              <span>{isSubmittingOrder ? 'Submitting Order...' : 'Place Order Now'}</span>
            </button>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
