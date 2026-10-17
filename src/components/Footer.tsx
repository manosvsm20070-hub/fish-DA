'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SHOP_INFO } from '@/data/products';

interface FooterProps {
  storeName?: string;
  tagline?: string;
  address?: string;
  phoneDisplay?: string;
  phoneDial?: string;
  whatsappNumber?: string;
  openHours?: string;
}

export default function Footer(props: FooterProps = {}) {
  const [info, setInfo] = useState({
    name: props.storeName || SHOP_INFO.name,
    address: props.address || SHOP_INFO.address,
    phoneDisplay: props.phoneDisplay || SHOP_INFO.phoneDisplay,
    phoneDial: props.phoneDial || SHOP_INFO.phoneDial,
    whatsappNumber: props.whatsappNumber || SHOP_INFO.whatsappNumber,
    openHours: props.openHours || SHOP_INFO.openHours,
  });

  useEffect(() => {
    if (!props.storeName) {
      fetch('/api/settings')
        .then((r) => r.json())
        .then((d) => {
          if (d?.customerInterface) {
            const ci = d.customerInterface;
            setInfo({
              name: ci.storeName || SHOP_INFO.name,
              address: ci.contact?.address || SHOP_INFO.address,
              phoneDisplay: ci.contact?.phoneDisplay || SHOP_INFO.phoneDisplay,
              phoneDial: ci.contact?.phoneDial || SHOP_INFO.phoneDial,
              whatsappNumber: ci.contact?.whatsappNumber || SHOP_INFO.whatsappNumber,
              openHours: ci.contact?.openHours || SHOP_INFO.openHours,
            });
          }
        })
        .catch(() => {});
    }
  }, [props.storeName]);

  return (
    <footer className="mt-16 pt-12 pb-24 lg:pb-12 bg-surface-container-low border-t border-surface-container">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="flex flex-col gap-3 md:col-span-2">
            <div className="relative h-10 w-44">
              <Image
                src="/dolphin-logo.svg"
                alt="Dolphin Aquarium Logo"
                fill
                className="object-contain"
              />
            </div>
            <p className="font-headline-sm font-bold text-primary mt-1">
              {info.name}
            </p>
            <p className="font-body-sm text-on-surface-variant max-w-md">
              Freshwater livestock, fancy goldfish, show bettas, predator monster fish, custom rimless aquariums, and professional aquatic equipment. Serving Sothupakkam, Cheyur, Vandavasi, and the Chengalpattu region.
            </p>
            <div className="flex items-start gap-1.5 text-on-surface-variant font-body-sm mt-1">
              <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">location_on</span>
              <span>{info.address}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <a
                href={info.phoneDial}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-md shadow-xs hover:bg-primary-container transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">call</span>
                <span>{info.phoneDisplay}</span>
              </a>
              <a
                href={`https://wa.me/${info.whatsappNumber}?text=Hello%20${encodeURIComponent(info.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white font-label-md font-bold shadow-xs hover:bg-[#1ebd59] transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">chat</span>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-label-lg font-bold text-on-surface tracking-wide uppercase">
              Livestock Catalog
            </h4>
            <ul className="flex flex-col gap-1.5 text-on-surface-variant font-body-sm">
              <li>
                <Link href="/fish/goldfish" className="hover:text-primary transition-colors">
                  Fancy Goldfish (26 Varieties)
                </Link>
              </li>
              <li>
                <Link href="/fish/betta" className="hover:text-primary transition-colors">
                  Show Betta Fish (15 Varieties)
                </Link>
              </li>
              <li>
                <Link href="/fish/flowerhorn" className="hover:text-primary transition-colors">
                  King Kamfa & Flowerhorns
                </Link>
              </li>
              <li>
                <Link href="/fish/guppy" className="hover:text-primary transition-colors">
                  Breeder Guppies & Endlers
                </Link>
              </li>
              <li>
                <Link href="/fish/sharks" className="hover:text-primary transition-colors">
                  Aquarium Sharks
                </Link>
              </li>
              <li>
                <Link href="/fish/monster-fish" className="hover:text-primary transition-colors">
                  Gars, Catfish & Monster Fish
                </Link>
              </li>
            </ul>
          </div>

          {/* Tanks & Store Services */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-label-lg font-bold text-on-surface tracking-wide uppercase">
              Tanks & Supplies
            </h4>
            <ul className="flex flex-col gap-1.5 text-on-surface-variant font-body-sm">
              <li>
                <Link href="/tanks" className="hover:text-primary transition-colors">
                  Rimless Glass Tanks
                </Link>
              </li>
              <li>
                <Link href="/custom-tanks" className="hover:text-primary transition-colors">
                  Custom Aquariums & Sumps
                </Link>
              </li>
              <li>
                <Link href="/equipment/motors" className="hover:text-primary transition-colors">
                  Air Pumps & Water Motors
                </Link>
              </li>
              <li>
                <Link href="/medicines" className="hover:text-primary transition-colors">
                  Fish Medicines & Water Care
                </Link>
              </li>
              <li>
                <Link href="/food" className="hover:text-primary transition-colors">
                  Premium Fish Pellets & Flakes
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-secondary hover:text-primary transition-colors font-semibold">
                  Admin Panel Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="font-body-sm text-on-surface-variant text-xs">
            © {new Date().getFullYear()} Dolphin Aquarium. All rights reserved. 100% Healthy Livestock Assurance.
          </p>
          <div className="flex items-center gap-4 text-xs font-label-md text-on-surface-variant">
            <span>Hours: 9:00 AM – 9:00 PM</span>
            <Link href="/contact" className="hover:text-primary">
              Directions & Map
            </Link>
            <Link href="/admin" className="text-primary hover:underline font-bold">
              Admin Access
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
