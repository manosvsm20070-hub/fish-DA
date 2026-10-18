'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';

interface LiveGearEssentialsProps {
  initialGear: Product[];
}

export default function LiveGearEssentials({ initialGear }: LiveGearEssentialsProps) {
  const [gearEssentials, setGearEssentials] = useState<Product[]>(initialGear);

  useEffect(() => {
    setGearEssentials(initialGear);
  }, [initialGear]);

  useEffect(() => {
    const handleProductsUpdated = async () => {
      try {
        const res = await fetch('/api/products', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.products && Array.isArray(data.products)) {
            const updated = data.products
              .filter((p: Product) => !p.isLiveFish)
              .slice(0, 4);
            setGearEssentials(updated);
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
        <h2 className="font-headline-sm font-bold text-on-surface">Tanks, Filters & Care Essentials</h2>
        <Link href="/tanks" className="font-label-sm text-secondary text-xs hover:text-primary">
          View Store Supplies →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {gearEssentials.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container/60 hover:shadow-md transition-all"
          >
            <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-surface-container">
              <Image
                src={item.primaryImage}
                alt={item.name}
                fill
                unoptimized={Boolean(item.primaryImage?.startsWith('data:') || item.primaryImage?.startsWith('/api/uploads/') || item.primaryImage?.startsWith('/uploads/'))}
                className="object-cover"
              />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-label-sm text-[10px] px-1.5 py-0.2 rounded bg-surface-container text-primary font-bold">
                  {item.category}
                </span>
                <span className="font-label-sm text-[10px] text-secondary">
                  {item.variety}
                </span>
              </div>
              <h3 className="font-label-lg font-bold text-on-surface truncate mt-0.5">
                {item.name}
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant line-clamp-1">
                {item.description}
              </p>
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-surface-container/50">
                <span className="font-headline-sm text-sm font-bold text-primary">
                  ₹{item.price.toLocaleString('en-IN')}
                </span>
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/product/${item.id}`}
                    className="px-2.5 py-1 rounded-lg bg-surface-container-high text-primary font-label-sm text-xs font-semibold hover:bg-surface-container"
                  >
                    Details
                  </Link>
                  <Link
                    href="/cart"
                    className="px-2.5 py-1 rounded-lg bg-[#cc4729] text-white font-label-sm text-xs font-bold hover:bg-[#b03b20]"
                  >
                    Order
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
