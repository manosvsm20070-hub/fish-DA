'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { CustomerDetails } from '@/types';
import Footer from '@/components/Footer';

type CheckoutStep = 'details' | 'review';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [step, setStep] = useState<CheckoutStep>('details');
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    house: '',
    city: 'Sothupakkam',
    district: 'Chengalpattu',
    state: 'Tamil Nadu',
    pinCode: '603319',
    phoneNumber: '',
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Delivery charge calculation: free over ₹1500, else ₹100
  const deliveryCharge = subtotal >= 1500 ? 0 : 100;
  const grandTotal = subtotal + deliveryCharge;

  // Step 1: Validate Delivery Details & Move to Review
  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerDetails.name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!customerDetails.phoneNumber.trim()) {
      setErrorMsg('Please enter your mobile number.');
      return;
    }
    // Basic phone validation: 10 digits
    const cleanedPhone = customerDetails.phoneNumber.replace(/[\s\-\(\)\+]/g, '');
    if (cleanedPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
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

  // Step 2: Final Place Order
  const handlePlaceOrder = async () => {
    if (isSubmittingOrder) return;
    setIsSubmittingOrder(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
          Step {step === 'details' ? '1 of 2: Details' : '2 of 2: Review'}
        </span>
      </div>

      {errorMsg && (
        <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-label-md text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Visual Step Indicator */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        <div
          className={`py-2 px-3 rounded-xl border flex flex-col items-center gap-1 text-center ${
            step === 'details'
              ? 'bg-primary/10 border-primary text-primary font-bold'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}
        >
          <span className="text-[10px] uppercase tracking-wider">Step 1</span>
          <span className="font-label-md text-xs">Delivery Details</span>
        </div>

        <div
          className={`py-2 px-3 rounded-xl border flex flex-col items-center gap-1 text-center ${
            step === 'review'
              ? 'bg-primary/10 border-primary text-primary font-bold'
              : 'bg-surface-container-low border-surface-container text-on-surface-variant opacity-60'
          }`}
        >
          <span className="text-[10px] uppercase tracking-wider">Step 2</span>
          <span className="font-label-md text-xs">Review & Place</span>
        </div>
      </div>

      {/* ================= STEP 1: CUSTOMER DETAILS FORM ================= */}
      {step === 'details' && (
        <section className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h2 className="font-headline-sm font-bold text-on-surface">Delivery Details</h2>
            <p className="font-body-sm text-xs text-on-surface-variant">
              Please enter your name, contact number, and address for safe transit and dispatch.
            </p>
          </div>

          <form onSubmit={handleDetailsSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
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

            {/* Mobile Number */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="font-label-md text-xs font-bold text-on-surface">Mobile Number *</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 font-label-md text-sm text-on-surface-variant font-bold">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  value={customerDetails.phoneNumber}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, phoneNumber: e.target.value })}
                  placeholder="9876543210"
                  className="w-full h-11 pl-14 pr-4 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
                />
              </div>
              <span className="text-[11px] text-on-surface-variant">
                Our shop team will contact you on this number to confirm dispatch timing.
              </span>
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

      {/* ================= STEP 2: ORDER REVIEW & CONFIRMATION ================= */}
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
              className="font-label-md text-xs text-secondary hover:text-primary underline cursor-pointer"
            >
              Edit Details
            </button>
          </div>

          {/* Delivery Address Summary */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-1 text-xs">
            <span className="font-label-md font-bold text-on-surface text-sm">Delivery Contact & Address:</span>
            <p className="text-on-surface font-semibold">{customerDetails.name}</p>
            <p className="text-on-surface-variant font-mono">Mobile: +91 {customerDetails.phoneNumber}</p>
            <p className="text-on-surface-variant">{customerDetails.house}</p>
            <p className="text-on-surface-variant">
              {customerDetails.city}, {customerDetails.district}, {customerDetails.state} - {customerDetails.pinCode}
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
              By clicking &quot;Place Order Now&quot;, your request is submitted directly to our Sothupakkam store. The team will contact you on your mobile number to confirm dispatch timing.
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
