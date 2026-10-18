'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';

interface LiveCuratedExoticsProps {
  initialProducts: Product[];
}

export default function LiveCuratedExotics({ initialProducts }: LiveCuratedExoticsProps) {
  const [featuredFish, setFeaturedFish] = useState<Product[]>(initialProducts);

  useEffect(() => {
    setFeaturedFish(initialProducts);
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
            const updated = data.products
              .filter((p: Product) => p.isLiveFish && p.featured)
              .slice(0, 4);
            setFeaturedFish(updated);
          }
        }
      } catch {}
    };

    window.addEventListener('dolphin_products_updated', handleProductsUpdated);
    return () => {
      window.removeEventListener('dolphin_products_updated', handleProductsUpdated);
    };
  }, []);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
          <h2 className="font-headline-sm font-bold text-on-surface">Curated Exotic Arrivals</h2>
        </div>
        <Link href="/fish" className="font-label-sm text-primary font-bold text-xs">
          Live in Sothupakkam
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {featuredFish.map((fish) => (
          <ProductCard key={fish.id} product={fish} aspectRatio="4/5" />
        ))}
      </div>
    </section>
  );
}
