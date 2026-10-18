import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getOrderByNumber } from '@/lib/storage';
import { SHOP_INFO } from '@/data/products';
import Footer from '@/components/Footer';

export const revalidate = 0;

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);

  return (
    <main className="flex-1 flex flex-col w-full px-4 md:px-8 max-w-3xl mx-auto py-8">
      <div className="bg-surface-container-lowest p-6 sm:p-8 rounded-2xl border border-surface-container shadow-sm flex flex-col gap-6 text-center sm:text-left">
        {/* Success Header */}
        <div className="flex flex-col items-center sm:items-start gap-2">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1">
            <span className="material-symbols-outlined text-[32px]">check_circle</span>
          </div>
          <span className="font-label-sm text-xs font-bold text-emerald-800 uppercase tracking-widest">
            Order Confirmed
          </span>
          <h1 className="font-headline-lg font-bold text-emerald-700 dark:text-emerald-400">
            Your Order is Confirmed!
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant max-w-lg">
            Thank you! Your order has been placed successfully. Our shop team at Sothupakkam will contact your mobile number to coordinate delivery and timing.
          </p>
        </div>

        {/* Order Details Badge */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-label-sm text-xs text-secondary block">Assigned Order Number</span>
            <span className="font-headline-sm font-bold text-primary text-xl tracking-wide">
              {orderNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`${SHOP_INFO.whatsappDirect}?text=Hello%20Dolphin%20Aquarium,%20I%20placed%20order%20${orderNumber}.%20Please%20provide%20status`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 px-4 rounded-xl bg-[#25D366] hover:bg-[#1ebd59] text-white font-label-md font-bold flex items-center gap-1.5 shadow-sm text-xs transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              <span>Need Help? Chat on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Customer & Address Details if found */}
        {order && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-body-md text-on-surface">
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-1">
              <span className="font-label-md text-xs font-bold text-secondary uppercase">
                Customer Information
              </span>
              <p className="font-bold text-sm text-on-surface mt-1">{order.customerName}</p>
              <p className="text-primary font-semibold">{order.phoneNumber}</p>
              <p className="text-on-surface-variant">Status: <span className="font-bold text-emerald-700">{order.status}</span></p>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-1">
              <span className="font-label-md text-xs font-bold text-secondary uppercase">
                Delivery Address
              </span>
              <p className="mt-1">{order.house}</p>
              <p>
                {order.city}, {order.district}, {order.state} - {order.pinCode}
              </p>
            </div>
          </div>
        )}

        {/* Order Items List */}
        {order && order.items && (
          <div className="flex flex-col gap-3">
            <h3 className="font-label-md text-xs font-bold text-secondary uppercase tracking-wider">
              Ordered Items
            </h3>
            <div className="flex flex-col gap-2">
              {order.items.map((it, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-surface-container text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-surface-container">
                      <Image
                        src={it.image}
                        alt={it.productName}
                        fill
                        unoptimized={Boolean(it.image?.startsWith('data:') || it.image?.startsWith('/api/uploads/') || it.image?.startsWith('/uploads/'))}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-on-surface text-sm">{it.productName}</p>
                      <p className="text-on-surface-variant">
                        {it.variety} • {it.size} • Qty: {it.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-primary text-sm">
                    ₹{it.subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-surface-container flex flex-col gap-1 text-xs">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-bold">₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span className="font-bold">
                  {order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}
                </span>
              </div>
              <div className="pt-2 border-t border-surface-container-high flex justify-between font-headline-sm font-bold text-base text-primary">
                <span>Grand Total:</span>
                <span>₹{order.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/fish"
            className="w-full sm:w-auto h-12 px-6 rounded-xl bg-primary text-on-primary font-label-md font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-primary-container transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">set_meal</span>
            <span>Continue Shopping</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto h-12 px-6 rounded-xl bg-surface-container-highest text-primary font-label-md font-bold flex items-center justify-center hover:bg-surface-container transition-all"
          >
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
