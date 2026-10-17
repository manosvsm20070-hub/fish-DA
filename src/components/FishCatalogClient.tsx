'use client';

import React, { useState, useMemo } from 'react';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';

interface FishCatalogClientProps {
  initialProducts: Product[];
  initialCategory?: string;
}

export default function FishCatalogClient({
  initialProducts,
  initialCategory = 'all',
}: FishCatalogClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeQuickFilter, setActiveQuickFilter] = useState<'all' | 'community' | 'beginner' | 'aggressive'>('all');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [careFilter, setCareFilter] = useState<string>('all');

  const categories = [
    { label: 'All Live Stock', key: 'all', count: initialProducts.length },
    { label: 'Goldfish (26)', key: 'goldfish', count: 5 },
    { label: 'Betta Fish (15)', key: 'betta', count: 3 },
    { label: 'Guppies & Endlers', key: 'guppy', count: 2 },
    { label: 'Mollies', key: 'molly', count: 1 },
    { label: 'Aquarium Sharks', key: 'sharks', count: 2 },
    { label: 'Flowerhorn', key: 'flowerhorn', count: 2 },
    { label: 'Zebra & GloFish', key: 'zebra-danio', count: 1 },
    { label: 'Monster Fish & Catfish', key: 'monster-fish', count: 2 },
  ];

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          product.name.toLowerCase().includes(q) ||
          product.variety.toLowerCase().includes(q) ||
          product.category.toLowerCase().includes(q) ||
          product.description.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // 2. Category Filter
      if (activeCategory !== 'all') {
        const catLower = activeCategory.toLowerCase();
        const matchesCategory =
          product.category.toLowerCase().includes(catLower) ||
          product.subCategory?.toLowerCase().includes(catLower) ||
          product.variety.toLowerCase().includes(catLower);
        if (!matchesCategory) return false;
      }

      // 3. Quick Temperament Filter
      if (activeQuickFilter !== 'all' && product.waterParams) {
        const temp = product.waterParams.temperament.toLowerCase();
        if (activeQuickFilter === 'community' && !temp.includes('community') && !temp.includes('peaceful')) {
          return false;
        }
        if (activeQuickFilter === 'beginner' && product.waterParams.careLevel !== 'Beginner') {
          return false;
        }
        if (activeQuickFilter === 'aggressive' && !temp.includes('aggressive') && !temp.includes('predatory')) {
          return false;
        }
      }

      // 4. Care Level Drawer Filter
      if (careFilter !== 'all' && product.waterParams) {
        if (product.waterParams.careLevel !== careFilter) return false;
      }

      return true;
    });
  }, [initialProducts, searchQuery, activeCategory, activeQuickFilter, careFilter]);

  const resetFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
    setActiveQuickFilter('all');
    setCareFilter('all');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    activeCategory !== 'all' ||
    activeQuickFilter !== 'all' ||
    careFilter !== 'all';

  return (
    <div className="flex flex-col w-full gap-4">
      {/* Search & Filter Controls (From Stitch Screen 2) */}
      <section className="flex flex-col gap-2">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Oranda, Betta, Shark, Molly..."
            className="w-full h-12 pl-11 pr-11 bg-surface-container-low text-on-surface rounded-xl font-body-md text-sm placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-surface-container transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant p-1 rounded-full hover:bg-surface-container"
              aria-label="Clear Search"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Filter Toggle Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            className={`h-9 px-3 rounded-lg font-label-md text-xs flex items-center gap-1.5 shrink-0 transition-all ${
              filterDrawerOpen
                ? 'bg-primary text-on-primary font-bold'
                : 'bg-surface-container-high text-primary hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#cc4729]"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveQuickFilter(activeQuickFilter === 'community' ? 'all' : 'community')
            }
            className={`h-9 px-3 rounded-lg font-label-md text-xs shrink-0 flex items-center gap-1 transition-all ${
              activeQuickFilter === 'community'
                ? 'bg-primary text-on-primary font-bold shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">groups</span>
            <span>Community Safe</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveQuickFilter(activeQuickFilter === 'beginner' ? 'all' : 'beginner')
            }
            className={`h-9 px-3 rounded-lg font-label-md text-xs shrink-0 flex items-center gap-1 transition-all ${
              activeQuickFilter === 'beginner'
                ? 'bg-primary text-on-primary font-bold shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Beginner Friendly</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveQuickFilter(activeQuickFilter === 'aggressive' ? 'all' : 'aggressive')
            }
            className={`h-9 px-3 rounded-lg font-label-md text-xs shrink-0 flex items-center gap-1 transition-all ${
              activeQuickFilter === 'aggressive'
                ? 'bg-primary text-on-primary font-bold shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">warning</span>
            <span>Aggressive / Single</span>
          </button>
        </div>

        {/* Drawer Options */}
        {filterDrawerOpen && (
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-label-md font-bold text-on-surface">Filter by Care Difficulty:</span>
              <button
                type="button"
                onClick={resetFilters}
                className="font-label-sm text-xs text-primary font-bold hover:underline"
              >
                Reset All
              </button>
            </div>
            <div className="flex items-center gap-2">
              {['all', 'Beginner', 'Intermediate', 'Expert'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setCareFilter(lvl)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-label-md transition-all ${
                    careFilter === lvl
                      ? 'bg-primary text-on-primary font-bold'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {lvl === 'all' ? 'All Levels' : lvl}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Filter Chips Bar */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between bg-primary-fixed/40 text-on-primary-fixed px-3 py-1.5 rounded-lg">
            <span className="font-label-sm text-xs truncate">
              Showing {filteredProducts.length} matching species
            </span>
            <button
              type="button"
              onClick={resetFilters}
              className="font-label-sm text-xs text-primary font-bold hover:underline shrink-0"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>

      {/* Category Nav Pills Carousel (From Stitch Screen 2) */}
      <section className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-2 py-1 w-max">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3.5 py-1.5 rounded-full font-label-md text-xs sm:text-sm transition-all ${
                  isSelected
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Live Stock Stat Strip */}
      <section className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container/60">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#059669] animate-pulse"></span>
          <span className="font-label-sm text-xs text-on-surface-variant">
            <strong className="text-on-surface font-semibold">
              {filteredProducts.length}
            </strong>{' '}
            premium species ready for pickup & delivery
          </span>
        </div>
        <span className="font-label-sm text-xs text-primary flex items-center gap-1 font-semibold">
          <span className="material-symbols-outlined text-[16px]">local_shipping</span>
          Tamil Nadu Direct
        </span>
      </section>

      {/* 4:5 Aspect Ratio Product Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} aspectRatio="4/5" />
          ))
        ) : (
          <div className="col-span-full py-16 text-center flex flex-col items-center justify-center gap-3 bg-surface-container-low rounded-2xl p-8 border border-dashed border-outline-variant">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/60">
              set_meal
            </span>
            <h3 className="font-headline-sm font-bold text-on-surface">No Fish Match Your Search</h3>
            <p className="font-body-sm text-on-surface-variant text-sm max-w-sm">
              We carry 26 goldfish varieties, 15 bettas, exotic cichlids, and livebearers. Try clearing your filters or search keywords.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-2 px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md font-bold text-xs"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
