'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { SHOP_INFO } from '@/data/products';

interface TanksEquipmentClientProps {
  products: Product[];
  initialFilter?: string;
}

export default function TanksEquipmentClient({
  products: initialProducts,
  initialFilter = 'all',
}: TanksEquipmentClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const { addToCart } = useCart();

  useEffect(() => {
    setProducts(initialProducts);
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
            const gear = data.products.filter((p: Product) => !p.isLiveFish);
            setProducts(gear);
          }
        }
      } catch {}
    };

    window.addEventListener('dolphin_products_updated', handleProductsUpdated);
    return () => {
      window.removeEventListener('dolphin_products_updated', handleProductsUpdated);
    };
  }, []);

  const filterTabs = [
    { label: 'All Gear', key: 'all', icon: 'apps' },
    { label: 'Glass Tanks', key: 'tanks', icon: 'crop_free' },
    { label: 'Bowls', key: 'bowls', icon: 'circle' },
    { label: 'Air & Motors', key: 'motors', icon: 'air' },
    { label: 'Filtration', key: 'filters', icon: 'filter_alt' },
    { label: 'Stones & Gravel', key: 'hardscape', icon: 'terrain' },
    { label: 'LED & Heaters', key: 'accessories', icon: 'lightbulb' },
  ];

  const filtered = products.filter((p) => {
    if (activeFilter === 'all') return true;
    const catLower = p.category.toLowerCase();
    const subLower = p.subCategory?.toLowerCase() || '';

    if (activeFilter === 'tanks') return catLower.includes('tank');
    if (activeFilter === 'bowls') return catLower.includes('bowl');
    if (activeFilter === 'motors') return catLower.includes('motor') || subLower.includes('pump');
    if (activeFilter === 'filters') return catLower.includes('filter');
    if (activeFilter === 'hardscape') return catLower.includes('stone') || catLower.includes('gravel');
    if (activeFilter === 'accessories') return catLower.includes('accessories') || catLower.includes('plant');

    return true;
  });

  return (
    <div className="flex flex-col w-full gap-4">
      {/* Department Catalog Navigation Carousel (From Stitch Screen 5) */}
      <section className="w-full">
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
            Department Catalog
          </span>
          <span className="font-label-sm text-xs text-primary font-bold flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[14px]">tune</span>
            Select Category
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar snap-x">
          {filterTabs.map((tab) => {
            const isSelected = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveFilter(tab.key)}
                className={`snap-start shrink-0 px-4 py-2 rounded-full font-label-md text-xs sm:text-sm shadow-xs transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Live Video Callout Box (From Stitch Screen 5) */}
      <div className="w-full bg-surface-container-low rounded-2xl p-4 flex items-center gap-3 shadow-xs border border-surface-container">
        <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-on-primary-fixed text-[22px]">
            verified
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-label-md text-sm text-on-surface font-bold truncate">
            Direct Sothupakkam Store Pickup & Safe Delivery
          </div>
          <p className="font-body-sm text-xs text-on-surface-variant truncate">
            Live video inspection available via WhatsApp before dispatch
          </p>
        </div>
      </div>

      {/* Product Catalog Cards Grid (16:10 Ratios matching Stitch Screen 5) */}
      <div className="flex flex-col gap-4 w-full">
        {filtered.map((item) => (
          <article
            key={item.id}
            className="w-full bg-surface-container-lowest rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col gap-3 border border-surface-container/70"
          >
            <div className="relative w-full aspect-[16/10] sm:aspect-[21/9] rounded-xl overflow-hidden bg-surface-container">
              <Image
                src={item.primaryImage}
                alt={item.name}
                fill
                unoptimized={Boolean(item.primaryImage?.startsWith('data:') || item.primaryImage?.startsWith('/api/uploads/') || item.primaryImage?.startsWith('/uploads/'))}
                className="object-cover"
              />
              <div className="absolute top-2.5 left-2.5 flex gap-1 z-10">
                <span className="bg-surface-container-lowest/95 backdrop-blur-md px-2.5 py-0.5 rounded-full font-label-sm text-xs text-primary font-bold flex items-center gap-1 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  In Store & Ready
                </span>
              </div>
              {item.variety && (
                <div className="absolute bottom-2.5 right-2.5 bg-inverse-surface/85 backdrop-blur-md text-inverse-on-surface px-2.5 py-0.5 rounded-md font-label-sm text-xs">
                  {item.variety}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-label-sm text-xs text-secondary uppercase font-semibold">
                    {item.category}
                  </span>
                  <Link href={`/product/${item.id}`} className="hover:text-primary transition-colors">
                    <h3 className="font-headline-sm font-bold text-on-surface">
                      {item.name}
                    </h3>
                  </Link>
                </div>
                <span className="font-label-sm text-xs px-2.5 py-1 rounded-lg bg-surface-container-high text-primary font-bold whitespace-nowrap">
                  Premium Grade
                </span>
              </div>
              <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant">
                {item.description}
              </p>
            </div>

            {/* Size Comparative Matrix (If sizes exist) */}
            {item.sizes && item.sizes.length > 0 && (
              <div className="bg-surface-container-low rounded-xl p-3 flex flex-col gap-1.5 border border-surface-container">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-xs text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-primary">
                      straighten
                    </span>
                    Available Configurations
                  </span>
                  <span className="font-label-sm text-xs text-primary font-semibold">
                    Standard & Custom
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                  {item.sizes.map((sz, idx) => (
                    <div
                      key={sz}
                      className={`rounded-lg p-2 flex flex-col justify-center ${
                        idx === 0
                          ? 'bg-primary text-on-primary font-bold'
                          : 'bg-surface-container-lowest text-on-surface'
                      }`}
                    >
                      <span className="font-label-sm text-xs">{sz}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price & Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-surface-container">
              <div>
                <span className="font-label-sm text-xs text-on-surface-variant block">
                  Store Price
                </span>
                <span className="font-headline-sm font-bold text-primary text-xl">
                  ₹{item.price.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => addToCart(item, 1, item.sizes[0])}
                  className="flex-1 sm:flex-none h-11 px-4 rounded-xl bg-[#cc4729] hover:bg-[#b03b20] active:scale-95 text-white font-label-md font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                  <span>Add to Cart</span>
                </button>

                <a
                  href={`${SHOP_INFO.whatsappDirect}?text=Hi%20Dolphin%20Aquarium,%20I%20am%20interested%20in%20${encodeURIComponent(
                    item.name
                  )}%20(Price:%20₹${item.price})`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-11 px-4 rounded-xl bg-[#25D366] text-white font-label-md font-bold flex items-center justify-center gap-1.5 active:scale-95 shadow-sm hover:bg-[#1ebd59] transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
