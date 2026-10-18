'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { CustomerDetails } from '@/types';
import Footer from '@/components/Footer';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const formRef = useRef<HTMLFormElement>(null);

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
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  // Sync saved address from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('da_delivery_address');
      if (saved) {
        const parsed = JSON.parse(saved);
        setCustomerDetails((prev) => ({
          ...prev,
          name: parsed.name || prev.name,
          phoneNumber: parsed.phone || prev.phoneNumber,
          house: parsed.address || prev.house,
          city: parsed.city || prev.city,
          pinCode: parsed.pincode || prev.pinCode,
        }));
      }
    } catch {}
  }, []);

  // Delivery charge calculation: free over ₹1500, else ₹100
  const deliveryCharge = subtotal >= 1500 ? 0 : 100;
  const grandTotal = subtotal + deliveryCharge;

  // Single-Step Final Place Order
  const handlePlaceOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmittingOrder || isOrderPlaced) return;

    setErrorMsg(null);

    // 1. Validation
    if (!customerDetails.name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!customerDetails.phoneNumber.trim()) {
      setErrorMsg('Please enter your mobile number.');
      return;
    }

    // Clean phone number: remove non-digits
    const digitsOnly = customerDetails.phoneNumber.replace(/\D/g, '');
    const phone10 = digitsOnly.startsWith('91') && digitsOnly.length === 12
      ? digitsOnly.slice(2)
      : digitsOnly;

    if (!/^[6-9]\d{9}$/.test(phone10)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).');
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

    if (!customerDetails.pinCode || !/^\d{6}$/.test(customerDetails.pinCode.trim())) {
      setErrorMsg('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    if (!items || items.length === 0) {
      setErrorMsg('Your cart is empty. Please add items before placing an order.');
      return;
    }

    setIsSubmittingOrder(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerDetails: {
            ...customerDetails,
            phoneNumber: phone10,
            district: customerDetails.district.trim() || customerDetails.city.trim() || 'Chengalpattu',
            state: customerDetails.state.trim() || 'Tamil Nadu',
          },
          items,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to place order. Please try again.');
        setIsSubmittingOrder(false);
        return;
      }

      // Save delivery details to localStorage for user convenience
      try {
        localStorage.setItem(
          'da_delivery_address',
          JSON.stringify({
            name: customerDetails.name.trim(),
            phone: phone10,
            address: customerDetails.house.trim(),
            city: customerDetails.city.trim(),
            pincode: customerDetails.pinCode.trim(),
          })
        );
      } catch {}

      // Order created successfully — generate WhatsApp message
      const itemsList = items
        .map(
          (i, idx) =>
            `${idx + 1}. *${i.productName}* (${i.selectedSize})\n   Qty: ${i.quantity} × ₹${i.price.toLocaleString('en-IN')} = ₹${(i.price * i.quantity).toLocaleString('en-IN')}`
        )
        .join('\n');
      const whatsappMsg = `🐠 *NEW ORDER — ${data.orderNumber}*\n━━━━━━━━━━━━━━━━━━━━\n📍 *DELIVERY ADDRESS:*\n• Name: ${customerDetails.name}\n• Mobile: +91 ${phone10}\n• Address: ${customerDetails.house}\n• City: ${customerDetails.city}\n• PIN Code: ${customerDetails.pinCode}\n━━━━━━━━━━━━━━━━━━━━\n📦 *Items Ordered:*\n${itemsList}\n━━━━━━━━━━━━━━━━━━━━\n💰 Subtotal: ₹${subtotal.toLocaleString('en-IN')}\n🚚 Delivery: ${deliveryCharge === 0 ? 'FREE' : '₹' + deliveryCharge}\n⭐ *Total Amount: ₹${grandTotal.toLocaleString('en-IN')}*\n━━━━━━━━━━━━━━━━━━━━\n🏪 *Store:* Sothupakkam, Chengalpattu\nPlease confirm order acceptance and delivery timing. Thank you!`;

      const whatsappUrl = `https://wa.me/917845637566?text=${encodeURIComponent(whatsappMsg)}`;
      window.open(whatsappUrl, '_blank');

      setIsOrderPlaced(true);
      clearCart();
      router.push(`/order-success/${data.orderNumber}`);
    } catch {
      setErrorMsg('Network error while placing order. Please try again.');
      setIsSubmittingOrder(false);
    }
  };

  // State: Order placed redirecting
  if (isOrderPlaced) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-14 h-14 border-4 border-[#cc4729] border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="font-headline-sm font-bold text-on-surface">Order Placed Successfully!</h2>
        <p className="font-body-sm text-xs text-on-surface-variant mt-1">
          Redirecting to order confirmation...
        </p>
      </main>
    );
  }

  // State: Empty cart
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
    <main className="flex-1 flex flex-col w-full px-4 md:px-8 max-w-6xl mx-auto py-6">
      {/* Checkout Header */}
      <div className="w-full mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-container-high pb-4">
        <div>
          <h1 className="font-headline-lg text-2xl md:text-3xl font-extrabold text-on-surface">
            Secure Checkout
          </h1>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            Direct dispatch from Dolphin Aquarium, Sothupakkam &bull; Cash on Delivery
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            Direct Store Dispatch
          </span>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Delivery Details Form */}
        <section className="lg:col-span-7 bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                1
              </span>
              <h2 className="font-headline-sm font-bold text-on-surface text-base md:text-lg">
                Delivery Details
              </h2>
            </div>
            <span className="text-[11px] text-on-surface-variant font-medium">* Required fields</span>
          </div>

          <form ref={formRef} onSubmit={handlePlaceOrder} noValidate className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="font-label-md text-xs font-bold text-on-surface">Full Name *</label>
              <input
                type="text"
                value={customerDetails.name}
                onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                className="h-11 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
              />
            </div>

            {/* Mobile Number */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="font-label-md text-xs font-bold text-on-surface">Mobile Number *</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 font-label-md text-sm text-on-surface-variant font-bold select-none">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={customerDetails.phoneNumber}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, phoneNumber: e.target.value.replace(/\D/g, '') })}
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
                value={customerDetails.house}
                onChange={(e) => setCustomerDetails({ ...customerDetails, house: e.target.value })}
                className="h-11 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
              />
            </div>

            {/* City */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-xs font-bold text-on-surface">City / Town *</label>
              <input
                type="text"
                value={customerDetails.city}
                onChange={(e) => setCustomerDetails({ ...customerDetails, city: e.target.value })}
                className="h-11 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
              />
            </div>

            {/* District */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-xs font-bold text-on-surface">District</label>
              <input
                type="text"
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
                maxLength={6}
                value={customerDetails.pinCode}
                onChange={(e) => setCustomerDetails({ ...customerDetails, pinCode: e.target.value.replace(/\D/g, '') })}
                className="h-11 px-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
              />
            </div>
          </form>
        </section>

        {/* RIGHT COLUMN: Order Summary & Place Order Button */}
        <section className="lg:col-span-5 bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm flex flex-col gap-5 lg:sticky lg:top-24">
          <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                2
              </span>
              <h2 className="font-headline-sm font-bold text-on-surface text-base md:text-lg">
                Order Summary
              </h2>
            </div>
            <span className="font-label-sm text-xs font-bold text-primary">
              {items.reduce((acc, i) => acc + i.quantity, 0)} items
            </span>
          </div>

          {/* Items Preview List */}
          <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1 divide-y divide-surface-container">
            {items.map((item) => (
              <div key={`${item.productId}-${item.selectedSize}`} className="pt-2 first:pt-0 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden shrink-0 relative border border-surface-container">
                  {item.primaryImage ? (
                    <Image
                      src={item.primaryImage}
                      alt={item.productName}
                      fill
                      unoptimized={Boolean(item.primaryImage?.startsWith('data:') || item.primaryImage?.startsWith('/api/uploads/') || item.primaryImage?.startsWith('/uploads/'))}
                      className="object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-on-surface-variant flex items-center justify-center h-full text-base">
                      pets
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-label-md text-xs font-bold text-on-surface truncate">
                    {item.productName}
                  </p>
                  <p className="font-body-sm text-[11px] text-on-surface-variant truncate">
                    Size: {item.selectedSize} &bull; Qty: {item.quantity}
                  </p>
                </div>
                <span className="font-label-md text-xs font-bold text-on-surface shrink-0">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2 border border-surface-container">
            <div className="flex justify-between text-xs text-on-surface-variant">
              <span>Items Subtotal:</span>
              <span className="font-semibold text-on-surface">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs text-on-surface-variant">
              <span>Delivery Charges:</span>
              <span className="font-semibold text-on-surface">
                {deliveryCharge === 0 ? (
                  <span className="text-emerald-700 font-bold">FREE</span>
                ) : (
                  `₹${deliveryCharge}`
                )}
              </span>
            </div>
            <div className="pt-2 border-t border-surface-container-high flex justify-between items-baseline">
              <span className="font-headline-sm font-bold text-on-surface text-sm">Grand Total:</span>
              <span className="font-headline-xl font-extrabold text-[#cc4729] text-xl">
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Error Message Alert (rendered directly above the action button) */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 font-label-md text-xs flex items-center gap-2.5 animate-fadeIn">
              <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0">error</span>
              <span className="font-medium leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Notice & Place Order Action */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              By clicking &quot;Place Order Now&quot;, your order is placed directly with our Sothupakkam store. We will contact your mobile number to confirm dispatch timing.
            </p>

            <button
              type="button"
              disabled={isSubmittingOrder}
              onClick={() => handlePlaceOrder()}
              className="w-full h-14 rounded-xl bg-[#25D366] hover:bg-[#1ebd59] active:scale-[0.98] text-white font-label-lg font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 text-base cursor-pointer"
            >
              {isSubmittingOrder ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting to WhatsApp...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[24px]">chat</span>
                  <span>Send Order via WhatsApp &bull; ₹{grandTotal.toLocaleString('en-IN')}</span>
                </>
              )}
            </button>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
