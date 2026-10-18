'use client';

import React from 'react';
import Image from 'next/image';
import { SiteSettings } from '@/types';
import { SHOP_INFO } from '@/data/products';
import { useLiveSettings } from '@/components/RealtimeSiteSync';

interface LiveHeroBannerProps {
  initialInterface?: SiteSettings['customerInterface'];
}

export default function LiveHeroBanner({ initialInterface }: LiveHeroBannerProps) {
  const live = useLiveSettings();
  const ci = live?.customerInterface || initialInterface;

  const bannerImage =
    ci?.hero?.bannerImage ||
    'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=1600&q=80';
  const headline = ci?.hero?.headline || ci?.storeName || 'Dolphin Aquarium';
  const subtitle =
    ci?.hero?.subtitle ||
    ci?.tagline ||
    'Freshwater Livestock, Custom Rimless Tanks & Aquatic Equipment';
  const quarantineBadge = ci?.hero?.quarantineBadgeText || 'Quarantine Certified';
  const ratingBadge = ci?.hero?.ratingBadgeText || '4.9 (Live Stock)';
  const address = ci?.contact?.address || SHOP_INFO.address;
  const phoneDial = ci?.contact?.phoneDial || SHOP_INFO.phoneDial;
  const whatsappNumber = ci?.contact?.whatsappNumber || SHOP_INFO.whatsappNumber;
  const storeName = ci?.storeName || SHOP_INFO.name;
  const highlightNotice =
    ci?.hero?.highlightNotice ||
    '100% Healthy Quarantine Assured. Direct Tank Delivery across Sothupakkam & Chengalpattu region.';

  return (
    <section className="relative overflow-hidden rounded-2xl bg-surface-container-low shadow-sm border border-surface-container/70">
      <div className="relative w-full h-56 sm:h-72 md:h-80 overflow-hidden">
        <Image
          src={bannerImage}
          alt={headline}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-surface-container-low/40 to-transparent"></div>

        {/* Badges on Hero */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-lowest/90 text-primary font-label-sm text-xs shadow-sm backdrop-blur-md font-semibold">
            <span className="material-symbols-outlined text-[15px] text-primary">verified</span>
            {quarantineBadge}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-highest/90 text-on-surface font-label-sm text-xs backdrop-blur-md font-semibold">
            <span className="material-symbols-outlined text-[14px] text-amber-500">star</span>
            {ratingBadge}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-6 flex flex-col gap-3">
        <div className="flex flex-col">
          <h1 className="font-headline-lg font-bold text-on-surface">{headline}</h1>
          <p className="font-body-sm sm:font-body-md text-secondary">{subtitle}</p>
        </div>

        <div className="flex items-start gap-1.5 text-on-surface-variant font-body-sm text-xs sm:text-sm">
          <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">pin_drop</span>
          <span>{address}</span>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1 max-w-md">
          <a
            className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-surface-container-highest text-primary font-label-md font-bold hover:bg-surface-container transition-all active:scale-95 shadow-xs"
            href={phoneDial}
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
            <span>Call Store</span>
          </a>
          <a
            className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-primary text-on-primary font-label-md font-bold hover:bg-primary-container transition-all active:scale-95 shadow-sm"
            href={`https://wa.me/${whatsappNumber}?text=Hello%20${encodeURIComponent(storeName)},%20I%20am%20inquiring%20about%20live%20fish%20stock%20and%20prices`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Highlights Banner */}
        <div className="mt-1 p-3 rounded-xl bg-surface-container flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[22px] text-primary shrink-0">shield</span>
          <p className="font-label-sm text-xs text-on-secondary-container leading-relaxed">
            {highlightNotice}
          </p>
        </div>
      </div>
    </section>
  );
}
