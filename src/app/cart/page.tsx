'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { SHOP_INFO } from '@/data/products';
import { useLiveSettings } from '@/components/RealtimeSiteSync';
import Footer from '@/components/Footer';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, subtotal, cartCount, clearCart } = useCart();
  const live = useLiveSettings();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSent, setOrderSent] = useState(false);

  const whatsappNumber = live?.contact?.whatsappNumber || SHOP_INFO.whatsappNumber || '917845637566';
  const storeName = live?.storeName || 'Dolphin Aquarium';

  // Free delivery for orders over ₹1,500, else flat ₹100
  const deliveryCharge = subtotal >= 1500 || subtotal === 0 ? 0 : 100;
  const grandTotal = subtotal + deliveryCharge;

  const handleWhatsAppOrder = async () => {
    if (items.length === 0 || isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 1. Format clean WhatsApp order text
      let msg = `🐠 *NEW ORDER — ${storeName}*\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `👤 *Customer Details:*\n`;
      msg += `• Name: ${customerName.trim() || 'WhatsApp Customer'}\n`;
      if (customerPhone.trim()) {
        msg += `• Phone: ${customerPhone.trim()}\n`;
      }
      if (customerAddress.trim()) {
        msg += `• Delivery Address: ${customerAddress.trim()}\n`;
      } else {
        msg += `• Delivery Address: (Will provide in chat)\n`;
      }
      msg += `━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `📦 *Items Ordered (${items.reduce((acc, i) => acc + i.quantity, 0)}):*\n`;
      items.forEach((item, idx) => {
        msg += `${idx + 1}. *${item.productName}*\n   ${item.variety ? item.variety + ' • ' : ''}Size: ${item.selectedSize}\n   Qty: ${item.quantity} × ₹${item.price.toLocaleString('en-IN')} = ₹${(item.price * item.quantity).toLocaleString('en-IN')}\n`;
      });
      msg += `━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `💰 *Subtotal:* ₹${subtotal.toLocaleString('en-IN')}\n`;
      msg += `🚚 *Delivery:* ${deliveryCharge === 0 ? 'FREE' : '₹' + deliveryCharge}\n`;
      msg += `⭐ *Grand Total: ₹${grandTotal.toLocaleString('en-IN')}*\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `📍 *Store:* Sothupakkam, Chengalpattu\nPlease confirm availability and dispatch time. Thank you!`;

      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;

      // 2. Asynchronously save order record to database for store logging
      try {
        fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerDetails: {
              name: customerName.trim() || 'WhatsApp Customer',
              phoneNumber: customerPhone.replace(/\D/g, '') || '7845637566',
              house: customerAddress.trim() || 'WhatsApp Order',
              city: 'Sothupakkam',
              district: 'Chengalpattu',
              state: 'Tamil Nadu',
              pinCode: '603319',
            },
            items,
          }),
        }).catch(() => {});
      } catch {}

      // 3. Launch WhatsApp directly
      setOrderSent(true);
      window.open(whatsappUrl, '_blank');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col w-full px-4 md:px-8 max-w-7xl mx-auto">
      <div className="w-full py-2 mb-2 flex items-center justify-between">
        <h1 className="font-headline-lg-mobile text-on-surface font-bold">Shopping Cart</h1>
        <span className="font-label-sm text-xs px-3 py-1 rounded-full bg-surface-container text-primary font-semibold">
          {cartCount} {cartCount === 1 ? 'Item' : 'Items'} Selected
        </span>
      </div>

      {items.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center gap-4 bg-surface-container-low rounded-2xl p-8 border border-surface-container my-6">
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[36px]">remove_shopping_cart</span>
          </div>
          <h2 className="font-headline-md font-bold text-on-surface">Your Cart is Empty</h2>
          <p className="font-body-md text-on-surface-variant max-w-md text-sm">
            Looks like you haven&apos;t added any livestock, tanks, or accessories yet. Explore our fresh arrivals and curated aquarium collections.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/fish"
              className="h-11 px-6 rounded-xl bg-primary text-on-primary font-label-md font-bold flex items-center gap-2 shadow-sm hover:bg-primary-container transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">set_meal</span>
              <span>Browse Fish</span>
            </Link>
            <Link
              href="/tanks"
              className="h-11 px-6 rounded-xl bg-surface-container-highest text-primary font-label-md font-bold flex items-center gap-2 hover:bg-surface-container transition-all"
            >
              <span>Explore Tanks</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 my-4 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.selectedSize}`}
                className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm"
              >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-surface-container">
                  <Image
                    src={item.primaryImage}
                    alt={item.productName}
                    fill
                    unoptimized={Boolean(item.primaryImage?.startsWith('data:') || item.primaryImage?.startsWith('/api/uploads/') || item.primaryImage?.startsWith('/uploads/'))}
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-label-lg font-bold text-on-surface truncate">
                        {item.productName}
                      </h3>
                      <div className="flex items-center gap-2 text-xs font-label-sm text-secondary mt-0.5">
                        <span>{item.variety}</span>
                        <span>•</span>
                        <span className="bg-surface-container px-1.5 py-0.2 rounded font-semibold text-primary">
                          {item.selectedSize}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.productId, item.selectedSize)}
                      className="text-on-surface-variant hover:text-red-600 p-1"
                      aria-label="Remove item"
                      title="Remove from cart"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-surface-container/60">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-outline-variant/60 rounded-lg bg-surface-container-low overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.selectedSize, -1)}
                        className="w-8 h-8 flex items-center justify-center text-on-surface hover:bg-surface-container font-bold"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-label-md text-xs font-bold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.selectedSize, 1)}
                        className="w-8 h-8 flex items-center justify-center text-on-surface hover:bg-surface-container font-bold"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="font-body-sm text-[11px] text-on-surface-variant block">
                        ₹{item.price} each
                      </span>
                      <span className="font-headline-sm font-bold text-primary text-base">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center pt-2">
              <Link
                href="/fish"
                className="font-label-md text-xs text-primary font-bold hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Continue Shopping</span>
              </Link>

              <button
                type="button"
                onClick={() => clearCart()}
                className="text-xs text-red-600 hover:underline font-medium"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Cart Summary & Direct WhatsApp Order */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm flex flex-col gap-4 sticky top-24">
            <h3 className="font-headline-sm font-bold text-on-surface pb-2 border-b border-surface-container">
              Order Summary
            </h3>

            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-on-surface-variant font-body-md">
                <span>Items Subtotal:</span>
                <span className="font-bold text-on-surface">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between text-on-surface-variant font-body-md">
                <span>Delivery Charge:</span>
                <span className="font-bold text-on-surface">
                  {deliveryCharge === 0 ? (
                    <span className="text-emerald-700">FREE</span>
                  ) : (
                    `₹${deliveryCharge}`
                  )}
                </span>
              </div>

              {subtotal < 1500 && (
                <div className="p-2.5 rounded-xl bg-surface-container text-xs text-on-surface-variant">
                  Add <strong>₹{1500 - subtotal}</strong> more for <strong>FREE Local Delivery</strong>!
                </div>
              )}

              <div className="pt-3 mt-1 border-t border-surface-container flex justify-between items-baseline">
                <span className="font-headline-sm font-bold text-on-surface">Grand Total:</span>
                <span className="font-headline-xl font-extrabold text-primary">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Quick Delivery Details for WhatsApp message */}
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container/80 flex flex-col gap-2.5">
              <span className="font-label-sm text-xs font-bold text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-primary">person_pin</span>
                <span>Your Delivery Details (Optional)</span>
              </span>

              <input
                type="text"
                placeholder="Your Name (e.g. Kumar)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-surface-container border border-outline-variant/60 font-body-md text-xs focus:ring-1 focus:ring-primary focus:outline-none"
              />

              <input
                type="tel"
                placeholder="Phone Number (e.g. 9876543210)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-surface-container border border-outline-variant/60 font-body-md text-xs focus:ring-1 focus:ring-primary focus:outline-none"
              />

              <textarea
                placeholder="Address / Area (e.g. Near Bus Stand, Sothupakkam)"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                rows={2}
                className="w-full px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant/60 font-body-md text-xs focus:ring-1 focus:ring-primary focus:outline-none resize-none"
              />
            </div>

            {/* WhatsApp Direct Notice */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] text-emerald-700 shrink-0 mt-0.5">verified</span>
              <p>
                <strong>Direct WhatsApp Ordering:</strong> Your order will open directly on WhatsApp with our store (+91 78456 37566) for instant confirmation and dispatch timing.
              </p>
            </div>

            {/* Primary Order Action Button */}
            <button
              type="button"
              onClick={handleWhatsAppOrder}
              disabled={isSubmitting || items.length === 0}
              className="w-full h-14 rounded-xl bg-[#25D366] hover:bg-[#1ebd59] active:scale-[0.98] text-white font-label-lg font-bold flex items-center justify-center gap-2.5 shadow-md transition-all disabled:opacity-50 text-base cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Preparing WhatsApp Order...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[24px]">chat</span>
                  <span>Order via WhatsApp &bull; ₹{grandTotal.toLocaleString('en-IN')}</span>
                </>
              )}
            </button>

            {orderSent && (
              <div className="p-3 rounded-xl bg-surface-container-high border border-primary/30 text-center flex flex-col gap-2">
                <span className="font-label-md text-xs font-bold text-primary flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>WhatsApp Opened!</span>
                </span>
                <p className="text-[11px] text-on-surface-variant">
                  If WhatsApp didn&apos;t open automatically, click below:
                </p>
                <button
                  type="button"
                  onClick={handleWhatsAppOrder}
                  className="text-xs text-primary font-bold underline cursor-pointer"
                >
                  Click here to re-open WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
