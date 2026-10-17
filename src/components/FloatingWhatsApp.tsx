'use client';

import React from 'react';
import { SHOP_INFO } from '@/data/products';

export default function FloatingWhatsApp({ whatsappNumber }: { whatsappNumber?: string } = {}) {
  const number = whatsappNumber || SHOP_INFO.whatsappNumber;
  return (
    <div className="fixed bottom-20 lg:bottom-8 right-4 md:right-8 z-40">
      <a
        aria-label="Instant WhatsApp Inquiry"
        href={`https://wa.me/${number}?text=Hello%20Dolphin%20Aquarium,%20I%20have%20an%20inquiry%20about%20fish/tanks`}
        target="_blank"
        rel="noopener noreferrer"
        className="h-13 md:h-14 px-4 md:px-5 rounded-full bg-[#25D366] text-white flex items-center gap-2 shadow-[0_8px_20px_-4px_rgba(37,211,102,0.45)] hover:scale-105 active:scale-95 transition-all cursor-pointer group"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <span className="material-symbols-outlined text-[22px] md:text-[24px]">forum</span>
        <span className="font-label-lg font-bold text-sm md:text-base">WhatsApp</span>
      </a>
    </div>
  );
}
