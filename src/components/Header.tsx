'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { SHOP_INFO } from '@/data/products';
import AnnouncementBar from '@/components/AnnouncementBar';
import { useLiveSettings } from '@/components/RealtimeSiteSync';

interface HeaderProps {
  announcement?: {
    enabled: boolean;
    text: string;
    linkText?: string;
    linkUrl?: string;
  };
  storeName?: string;
  phoneDial?: string;
  phoneDisplay?: string;
  whatsappNumber?: string;
}

export default function Header({
  announcement,
  storeName,
  phoneDial,
  phoneDisplay,
  whatsappNumber,
}: HeaderProps = {}) {
  const live = useLiveSettings();
  const currentStoreName = live?.storeName || storeName || SHOP_INFO.name;
  const currentPhoneDial = live?.contact?.phoneDial || phoneDial || SHOP_INFO.phoneDial;
  const currentPhoneDisplay = live?.contact?.phoneDisplay || phoneDisplay || SHOP_INFO.phoneDisplay;
  const currentWhatsapp = live?.contact?.whatsappNumber || whatsappNumber || SHOP_INFO.whatsappNumber;

  const pathname = usePathname();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Fish Catalog', href: '/fish' },
    { name: 'Tanks & Custom', href: '/tanks' },
    { name: 'Care & Medicines', href: '/medicines' },
    { name: 'Store Info', href: '/contact' },
    { name: 'Admin', href: '/admin' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container">
      <AnnouncementBar announcement={announcement} />
      <div className="h-20 px-4 md:px-8 max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Location */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-10 w-36">
            <Image
              src="/dolphin-logo.svg"
              alt="Dolphin Aquarium Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-headline-sm font-bold text-primary tracking-tight leading-tight">
              {currentStoreName}
            </span>
            <span className="font-label-sm text-on-surface-variant flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[13px] text-primary">location_on</span>
              Sothupakkam, Tamil Nadu
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-surface-container-low px-3 py-1.5 rounded-full border border-surface-container">
          {navLinks.map((link) => {
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3 py-1 rounded-full font-label-md transition-all ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Actions (Call, WhatsApp, Cart, Mobile Menu) */}
        <div className="flex items-center gap-2">
          {/* Call Store */}
          <a
            aria-label="Call Store"
            href={currentPhoneDial}
            className="w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center bg-surface-container-high text-primary hover:bg-secondary-container transition-colors shadow-sm"
            title={`Call ${currentPhoneDisplay}`}
          >
            <span className="material-symbols-outlined text-[20px]">call</span>
          </a>

          {/* WhatsApp Direct */}
          <a
            aria-label="WhatsApp Store"
            href={`https://wa.me/${currentWhatsapp}?text=Hello%20${encodeURIComponent(currentStoreName)},%20I%20am%20inquiring%20about%20live%20fish%20stock%20and%20prices`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center bg-primary text-on-primary hover:bg-primary-container transition-colors shadow-sm"
            title={`WhatsApp ${currentStoreName}`}
          >
            <span className="material-symbols-outlined text-[20px]">chat</span>
          </a>

          {/* Cart Icon with Live Badge */}
          <Link
            href="/cart"
            aria-label="Shopping Cart"
            className="relative w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center bg-surface-container-high text-primary hover:bg-secondary-container transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-[#ff6b4a] text-white font-label-sm font-bold flex items-center justify-center shadow-md animate-pulse">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
            aria-label="Toggle Navigation Menu"
          >
            <span className="material-symbols-outlined text-[22px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-surface-container bg-surface px-4 py-3 flex flex-col gap-1 shadow-lg">
          {navLinks.map((link) => {
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-xl font-label-md flex items-center justify-between ${
                  isActive
                    ? 'bg-primary text-on-primary font-bold'
                    : 'text-on-surface hover:bg-surface-container'
                }`}
              >
                <span>{link.name}</span>
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </Link>
            );
          })}
          <div className="pt-2 mt-2 border-t border-surface-container flex items-center justify-between text-xs text-on-surface-variant px-1">
            <span>Call: 07845637566</span>
            <span className="text-primary font-semibold">9 AM - 9 PM</span>
          </div>
        </div>
      )}
    </header>
  );
}
