'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { CustomerDetails } from '@/types';
import Footer from '@/components/Footer';

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

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, role: 'CUSTOMER' }),
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
    } catch {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
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
    } catch {
      setErrorMsg('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
    if (!/^\d{6}$/.test(customerDetails.pinCode.trim())) {
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

      {/* ================= STEP 1: PHONE NUMBER INPUT ================= */}
      {step === 'phone' && (
        <section className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-headline-sm font-bold text-on-surface">Verify Your Phone Number</h2>
            <p className="font-body-sm text-xs text-on-surface-variant">
              We verify customer phone numbers to secure your order and provide direct WhatsApp & SMS order delivery tracking.
            </p>
          </div>

          <form onSubmit={handleSendOtp} className="flex flex-col gap-4 max-w-md">
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-xs font-bold text-on-surface">
                Mobile Number:
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
                Enter your 10-digit Indian mobile number.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-12 rounded-xl bg-primary hover:bg-primary-container active:scale-95 text-on-primary font-label-md font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span>{loading ? 'Sending OTP...' : 'Send OTP'}</span>
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
              We sent a 6-digit OTP code to <strong>{verifiedPhone}</strong>.
            </p>
          </div>

          {devOtpHint && (
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
                6-Digit OTP:
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
              className="h-12 rounded-xl bg-primary hover:bg-primary-container active:scale-95 text-on-primary font-label-md font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>{loading ? 'Verifying...' : 'Verify OTP & Continue'}</span>
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
              <input
                type="text"
                readOnly
                value={customerDetails.phoneNumber}
                className="h-11 px-3.5 rounded-xl bg-surface-container text-on-surface font-label-md text-sm cursor-not-allowed border border-surface-container-high"
              />
              <span className="text-[11px] text-on-surface-variant">
                To change your phone number, you must re-verify with OTP.
              </span>
            </div>

            <div className="sm:col-span-2 pt-2 flex items-center justify-between">
              <Link href="/cart" className="font-label-md text-xs text-secondary hover:text-primary">
                Back to Cart
              </Link>
              <button
                type="submit"
                className="h-12 px-6 rounded-xl bg-primary hover:bg-primary-container active:scale-95 text-on-primary font-label-md font-bold flex items-center gap-2 shadow-sm transition-all"
              >
                <span>Continue to Review Order</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </form>
        </section>
      )}

      {/* ================= STEP 4: ORDER REVIEW ================= */}
      {step === 'review' && (
        <section className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="font-headline-sm font-bold text-on-surface">Review Your Order</h2>
            <p className="font-body-sm text-xs text-on-surface-variant">
              Please double-check your delivery details and selected livestock before placing your order.
            </p>
          </div>

          {/* Customer Address Summary */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="font-label-md text-xs font-bold text-secondary uppercase tracking-wider">
                Customer & Delivery Address
              </h3>
              <button
                type="button"
                onClick={() => setStep('details')}
                className="font-label-sm text-xs text-primary font-bold hover:underline"
              >
                Edit Details
              </button>
            </div>
            <div className="text-sm font-body-md text-on-surface">
              <p className="font-bold text-base">{customerDetails.name}</p>
              <p>{customerDetails.house}</p>
              <p>
                {customerDetails.city}, {customerDetails.district}, {customerDetails.state} -{' '}
                <strong>{customerDetails.pinCode}</strong>
              </p>
              <p className="mt-1 text-primary font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">call</span>
                {customerDetails.phoneNumber}
              </p>
            </div>
          </div>

          {/* Items Summary */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="font-label-md text-xs font-bold text-secondary uppercase tracking-wider">
                Order Items ({items.length})
              </h3>
              <Link href="/cart" className="font-label-sm text-xs text-primary font-bold hover:underline">
                Back to Cart
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              {items.map((it) => (
                <div
                  key={`${it.productId}-${it.selectedSize}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-surface-container text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-surface-container">
                      <Image src={it.primaryImage} alt={it.productName} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-on-surface leading-tight">{it.productName}</p>
                      <p className="text-xs text-on-surface-variant">
                        {it.variety} • {it.selectedSize} • Qty: {it.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-primary">
                    ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="p-4 rounded-xl bg-surface-container flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-on-surface-variant font-body-md">
              <span>Items Subtotal:</span>
              <span className="font-bold text-on-surface">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant font-body-md">
              <span>Local Delivery:</span>
              <span className="font-bold text-on-surface">
                {deliveryCharge === 0 ? <span className="text-emerald-700">FREE</span> : `₹${deliveryCharge}`}
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
