'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';

interface LiveFishFoodSectionProps {
  initialProducts: Product[];
}

export default function LiveFishFoodSection({ initialProducts }: LiveFishFoodSectionProps) {
  const [foodProducts, setFoodProducts] = useState<Product[]>(initialProducts);
  const [activeTab, setActiveTab] = useState<'all' | 'pellet' | 'flake' | 'specialty'>('all');

  useEffect(() => {
    setFoodProducts(initialProducts);
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
                p.category?.toLowerCase().includes('food') ||
                p.subCategory?.toLowerCase().includes('food') ||
                p.subCategory?.toLowerCase().includes('pellet') ||
                p.subCategory?.toLowerCase().includes('flake') ||
                p.variety?.toLowerCase().includes('food') ||
                p.name?.toLowerCase().includes('pellet') ||
                p.name?.toLowerCase().includes('flakes')
            );
            setFoodProducts(updated);
          }
        }
      } catch {}
    };

    window.addEventListener('dolphin_products_updated', handleProductsUpdated);
    return () => {
      window.removeEventListener('dolphin_products_updated', handleProductsUpdated);
    };
  }, []);

  const filteredProducts = foodProducts.filter((p) => {
    if (activeTab === 'pellet') {
      return (
        p.subCategory?.toLowerCase().includes('pellet') ||
        p.name?.toLowerCase().includes('pellet')
      );
    }
    if (activeTab === 'flake') {
      return (
        p.subCategory?.toLowerCase().includes('flake') ||
        p.name?.toLowerCase().includes('flake')
      );
    }
    if (activeTab === 'specialty') {
      return (
        p.subCategory?.toLowerCase().includes('specialty') ||
        p.name?.toLowerCase().includes('bloodworm') ||
        p.variety?.toLowerCase().includes('betta')
      );
    }
    return true;
  });

  return (
    <section className="flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#cc4729] text-[24px]">
              nutrition
            </span>
            <h2 className="font-headline-sm font-bold text-on-surface">
              Fish Food & Daily Nutrition
            </h2>
          </div>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            Rich spirulina pellets, gourmet flakes & freeze-dried bloodworms for vibrant health & rapid growth
          </p>
        </div>

        <Link
          href="/food"
          className="font-label-sm text-[#cc4729] hover:underline font-bold text-xs flex items-center gap-1 shrink-0"
        >
          <span>View All Fish Food</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>

      {/* Feature Nutrition Highlights */}
      <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-surface-container/60 border border-surface-container-high/60 text-center">
        <div className="flex flex-col items-center justify-center p-1.5">
          <span className="font-label-sm text-[11px] text-[#cc4729] font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">eco</span>
            12% Spirulina
          </span>
          <span className="font-label-sm text-[10px] text-on-surface-variant hidden sm:inline">
            Intense Color Enhancing
          </span>
        </div>
        <div className="flex flex-col items-center justify-center p-1.5 border-x border-surface-container-high/60">
          <span className="font-label-sm text-[11px] text-[#cc4729] font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">fitness_center</span>
            45%+ High Protein
          </span>
          <span className="font-label-sm text-[10px] text-on-surface-variant hidden sm:inline">
            Rapid Fin & Body Growth
          </span>
        </div>
        <div className="flex flex-col items-center justify-center p-1.5">
          <span className="font-label-sm text-[11px] text-[#cc4729] font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">water</span>
            Non-Clouding
          </span>
          <span className="font-label-sm text-[10px] text-on-surface-variant hidden sm:inline">
            Clean & Clear Tank Water
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
              ? 'bg-[#cc4729] text-white shadow-xs'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          All Nutrition ({foodProducts.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pellet')}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-label-md font-semibold transition-all ${
            activeTab === 'pellet'
              ? 'bg-[#cc4729] text-white shadow-xs'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Growth Pellets
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('flake')}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-label-md font-semibold transition-all ${
            activeTab === 'flake'
              ? 'bg-[#cc4729] text-white shadow-xs'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Community Flakes
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('specialty')}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-label-md font-semibold transition-all ${
            activeTab === 'specialty'
              ? 'bg-[#cc4729] text-white shadow-xs'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Betta & Bloodworms
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
