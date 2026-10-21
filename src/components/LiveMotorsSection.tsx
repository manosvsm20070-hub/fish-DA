'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';

interface LiveMotorsSectionProps {
  initialProducts: Product[];
}

export default function LiveMotorsSection({ initialProducts }: LiveMotorsSectionProps) {
  const [motorProducts, setMotorProducts] = useState<Product[]>(initialProducts);
  const [activeTab, setActiveTab] = useState<'all' | 'air' | 'submersible' | 'wavemaker'>('all');

  useEffect(() => {
    setMotorProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    const handleProductsUpdated = async () => {
      try {
        const res = await fetch(`/api/products?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', Pragma: 'no-cache' },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.products && Array.isArray(data.products)) {
            const updated = data.products.filter(
              (p: Product) =>
                p.category?.toLowerCase().includes('motor') ||
                p.category?.toLowerCase().includes('pump') ||
                p.subCategory?.toLowerCase().includes('pump') ||
                p.name?.toLowerCase().includes('motor') ||
                p.name?.toLowerCase().includes('pump')
            );
            setMotorProducts(updated);
          }
        }
      } catch {}
    };

    window.addEventListener('dolphin_products_updated', handleProductsUpdated);
    return () => {
      window.removeEventListener('dolphin_products_updated', handleProductsUpdated);
    };
  }, []);

  const filteredProducts = motorProducts.filter((p) => {
    if (activeTab === 'air') {
      return (
        p.subCategory?.toLowerCase().includes('air') ||
        p.name?.toLowerCase().includes('air') ||
        p.variety?.toLowerCase().includes('outlet')
      );
    }
    if (activeTab === 'submersible') {
      return (
        p.subCategory?.toLowerCase().includes('internal') ||
        p.subCategory?.toLowerCase().includes('water') ||
        p.name?.toLowerCase().includes('submersible')
      );
    }
    if (activeTab === 'wavemaker') {
      return (
        p.subCategory?.toLowerCase().includes('wave') ||
        p.name?.toLowerCase().includes('wavemaker')
      );
    }
    return true;
  });

  return (
    <section className="flex flex-col gap-4">
      {/* Header with Title and Link */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">
              mode_fan
            </span>
            <h2 className="font-headline-sm font-bold text-on-surface">
              Aquarium Motors & Pumps
            </h2>
          </div>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            Whisper-silent air pumps, high-flow submersible powerheads & wavemaker circulation
          </p>
        </div>

        <Link
          href="/motors"
          className="font-label-sm text-primary font-bold text-xs hover:underline flex items-center gap-1 shrink-0"
        >
          <span>View All Motors & Pumps</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>

      {/* Feature Highlights Banner */}
      <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-surface-container/60 border border-surface-container-high/60 text-center">
        <div className="flex flex-col items-center justify-center p-1.5">
          <span className="font-label-sm text-[11px] text-primary font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">volume_off</span>
            &lt; 30 dB Silent
          </span>
          <span className="font-label-sm text-[10px] text-on-surface-variant hidden sm:inline">
            Zero Vibration Tech
          </span>
        </div>
        <div className="flex flex-col items-center justify-center p-1.5 border-x border-surface-container-high/60">
          <span className="font-label-sm text-[11px] text-primary font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">bolt</span>
            Low Wattage
          </span>
          <span className="font-label-sm text-[10px] text-on-surface-variant hidden sm:inline">
            24/7 Continuous Run
          </span>
        </div>
        <div className="flex flex-col items-center justify-center p-1.5">
          <span className="font-label-sm text-[11px] text-primary font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">air</span>
            Oxygen Boost
          </span>
          <span className="font-label-sm text-[10px] text-on-surface-variant hidden sm:inline">
            Dual Outlets & Spray Bars
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-label-md font-semibold transition-all ${
            activeTab === 'all'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          All Motors ({motorProducts.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('air')}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-label-md font-semibold transition-all ${
            activeTab === 'air'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Silent Air Pumps
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('submersible')}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-label-md font-semibold transition-all ${
            activeTab === 'submersible'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Submersible Powerheads
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('wavemaker')}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-label-md font-semibold transition-all ${
            activeTab === 'wavemaker'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Wavemakers
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} aspectRatio="square" />
        ))}
      </div>
    </section>
  );
}
