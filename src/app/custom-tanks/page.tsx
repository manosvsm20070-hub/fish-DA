'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SHOP_INFO } from '@/data/products';
import Footer from '@/components/Footer';

export default function CustomTanksPage() {
  const [lengthFt, setLengthFt] = useState('3');
  const [widthFt, setWidthFt] = useState('1.5');
  const [heightFt, setHeightFt] = useState('1.5');
  const [glassType, setGlassType] = useState('Low-Iron Ultra-Clear (10mm)');
  const [includeCabinet, setIncludeCabinet] = useState(true);
  const [includeSump, setIncludeSump] = useState(false);

  // Approximate water volume calculation in Liters: L x W x H in cm / 1000
  const lCm = (parseFloat(lengthFt) || 0) * 30.48;
  const wCm = (parseFloat(widthFt) || 0) * 30.48;
  const hCm = (parseFloat(heightFt) || 0) * 30.48;
  const volumeLiters = Math.round((lCm * wCm * hCm) / 1000);

  const inquiryText = `Hello Dolphin Aquarium, I would like a quote for a Custom Aquarium:
- Dimensions: ${lengthFt}ft (L) × ${widthFt}ft (W) × ${heightFt}ft (H)
- Est. Volume: ~${volumeLiters} Liters
- Glass Type: ${glassType}
- Cabinet Included: ${includeCabinet ? 'Yes' : 'No'}
- Sump Filter: ${includeSump ? 'Yes' : 'No'}`;

  return (
    <main className="flex-1 flex flex-col w-full px-4 md:px-8 max-w-7xl mx-auto">
      <div className="w-full py-2 mb-2 flex items-center justify-between">
        <h1 className="font-headline-lg-mobile text-on-surface font-bold">Custom Aquarium Tanks</h1>
        <span className="font-label-sm text-xs px-3 py-1 rounded-full bg-surface-container text-primary font-semibold">
          Fabrication Workshop
        </span>
      </div>

      <div className="flex flex-col gap-6">
        {/* Hero Showcase */}
        <section className="relative overflow-hidden rounded-2xl bg-surface-container-low border border-surface-container shadow-sm p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="relative w-full md:w-1/2 aspect-[16/10] rounded-xl overflow-hidden shadow-sm">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBq7Ze_43gk2q0UeKCJO8P_bHvlZD4wuqXvwJjBICmJ3mzcFm-b2GViIlNHL08E__oLGZS136TrjON2Ntzj7vZaqiEvvWvO1QILqcluAjh5jvPsBPMfJwFszcxhoPW7-_W0EQGVIS2TzDUmT_rkPfYOB7BR4_0jvs--kl7SS5qifL1eAhapC6AGo2clX10Y32gR7mAoXeqTismOhDi8dHMGNXWiNkGJr80G3lpUL0W4lySdAASTdCkjCQ"
              alt="Custom rimless glass aquarium"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-3 md:w-1/2">
            <span className="font-label-sm uppercase tracking-wider text-primary font-bold">
              Engineered Made-to-Size Glass
            </span>
            <h2 className="font-headline-lg font-bold text-on-surface">
              Precision Crafted Aquariums for Home & Offices
            </h2>
            <p className="font-body-md text-on-surface-variant text-sm">
              We specialize in custom German-standard rimless aquariums built to your specific room measurements. Available with 45-degree mitered edges, high-tensile clear silicone, and reinforced bottom sumps.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="px-3 py-1 rounded-lg bg-surface-container font-label-sm text-xs text-primary font-bold">
                Low-Iron Ultra Clear
              </span>
              <span className="px-3 py-1 rounded-lg bg-surface-container font-label-sm text-xs text-secondary font-bold">
                8mm to 19mm Toughened
              </span>
            </div>
          </div>
        </section>

        {/* Custom Tank Builder Calculator */}
        <section className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container shadow-sm flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h3 className="font-headline-sm font-bold text-on-surface">
              Custom Size & Volume Estimator
            </h3>
            <p className="font-body-sm text-xs text-on-surface-variant">
              Configure your desired dimensions and send a direct inquiry to our workshop in Sothupakkam.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-xs font-bold text-on-surface">Length (Feet)</label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="12"
                value={lengthFt}
                onChange={(e) => setLengthFt(e.target.value)}
                className="h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-xs font-bold text-on-surface">Width / Depth (Feet)</label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="6"
                value={widthFt}
                onChange={(e) => setWidthFt(e.target.value)}
                className="h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-xs font-bold text-on-surface">Height (Feet)</label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="6"
                value={heightFt}
                onChange={(e) => setHeightFt(e.target.value)}
                className="h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-xs font-bold text-on-surface">Glass Specification</label>
              <select
                value={glassType}
                onChange={(e) => setGlassType(e.target.value)}
                className="h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
              >
                <option value="Low-Iron Ultra-Clear (8mm)">Low-Iron Ultra-Clear (8mm)</option>
                <option value="Low-Iron Ultra-Clear (10mm)">Low-Iron Ultra-Clear (10mm)</option>
                <option value="Low-Iron Ultra-Clear (12mm)">Low-Iron Ultra-Clear (12mm)</option>
                <option value="Toughened Float Glass (12mm)">Toughened Float Glass (12mm)</option>
                <option value="Heavy Duty Commercial Glass (19mm)">Heavy Duty Commercial Glass (19mm)</option>
              </select>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <label className="flex items-center gap-2 cursor-pointer font-label-md text-xs text-on-surface">
                <input
                  type="checkbox"
                  checked={includeCabinet}
                  onChange={(e) => setIncludeCabinet(e.target.checked)}
                  className="w-4 h-4 accent-primary rounded"
                />
                Include Wooden Stand / Cabinet
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-label-md text-xs text-on-surface">
                <input
                  type="checkbox"
                  checked={includeSump}
                  onChange={(e) => setIncludeSump(e.target.checked)}
                  className="w-4 h-4 accent-primary rounded"
                />
                Include Sump Tank Setup
              </label>
            </div>
          </div>

          {/* Volume Readout */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-xs text-secondary">Estimated Water Capacity</span>
              <span className="font-headline-lg font-bold text-primary">
                ~{volumeLiters} Liters ({Math.round(volumeLiters * 0.264)} Gallons)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`${SHOP_INFO.whatsappDirect}?text=${encodeURIComponent(inquiryText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 px-5 rounded-xl bg-[#25D366] text-white font-label-md font-bold flex items-center gap-2 shadow-sm hover:bg-[#1ebd59] transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
                <span>Send WhatsApp Quote Request</span>
              </a>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
