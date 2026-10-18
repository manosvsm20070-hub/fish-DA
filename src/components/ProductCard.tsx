'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { SHOP_INFO } from '@/data/products';

interface ProductCardProps {
  product: Product;
  aspectRatio?: '4/5' | '16/10' | 'square';
}

export default function ProductCard({
  product,
  aspectRatio = '4/5',
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Standard'
  );
  const quantity = 1;

  const aspectClass =
    aspectRatio === '16/10'
      ? 'aspect-[16/10]'
      : aspectRatio === 'square'
      ? 'aspect-square'
      : 'aspect-[4/5]';

  const imageSrc =
    (typeof product.primaryImage === 'string' && product.primaryImage.trim().length > 0)
      ? product.primaryImage.trim()
      : (product.images && product.images.length > 0 && typeof product.images[0] === 'string' && product.images[0].trim().length > 0)
      ? product.images[0].trim()
      : null;

  return (
    <article className="fish-item flex flex-col rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-surface-container/60 group">
      {/* Image Container */}
      <div className={`relative w-full ${aspectClass} bg-surface-container overflow-hidden`}>
        <Link href={`/product/${product.id}`} className="relative block w-full h-full">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              unoptimized={Boolean(imageSrc.startsWith('data:') || imageSrc.startsWith('/api/uploads/') || imageSrc.startsWith('/uploads/'))}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container text-on-surface-variant/40 gap-1">
              <span className="material-symbols-outlined text-[32px]">set_meal</span>
              <span className="text-[11px] font-label-sm font-medium">No Image</span>
            </div>
          )}
        </Link>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
          {product.availability === 'in_stock' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600/90 text-white font-label-sm shadow-sm backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              In Stock
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600/90 text-white font-label-sm shadow-sm backdrop-blur-sm">
              Low Stock
            </span>
          )}

          {product.variety && (
            <span className="px-2 py-0.5 rounded-md bg-surface-container-lowest/85 backdrop-blur-md text-primary font-label-sm font-semibold shadow-xs">
              {product.variety}
            </span>
          )}
        </div>

        {/* Size Badge */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest/85 backdrop-blur-md text-on-surface font-label-sm flex items-center gap-0.5 shadow-sm">
              <span className="material-symbols-outlined text-[13px] text-primary">straighten</span>
              {selectedSize}
            </span>
          </div>
        )}

        {/* Water Parameters Overlay for Live Fish */}
        {product.isLiveFish && product.waterParams && (
          <div className="absolute bottom-2.5 inset-x-2.5 bg-surface-container-lowest/90 backdrop-blur-md rounded-xl px-2 py-1 flex items-center justify-between text-on-surface-variant font-label-sm">
            <span className="flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[13px] text-primary">water_ph</span>
              {product.waterParams.ph}
            </span>
            <span className="flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[13px] text-primary">thermostat</span>
              {product.waterParams.temp}
            </span>
            <span className="hidden sm:flex items-center gap-0.5 truncate max-w-[80px]">
              <span className="material-symbols-outlined text-[13px] text-primary">groups</span>
              {product.waterParams.temperament.split(' ')[0]}
            </span>
          </div>
        )}
      </div>

      {/* Content Details */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-1">
            <span className="font-label-sm text-secondary font-semibold uppercase tracking-wider">
              {product.category}
            </span>
            {product.isLiveFish && (
              <span className="font-label-sm text-[10px] text-primary bg-surface-container px-1.5 py-0.2 rounded font-semibold">
                Live Stock
              </span>
            )}
          </div>

          <Link href={`/product/${product.id}`} className="hover:text-primary transition-colors">
            <h3 className="font-headline-sm text-on-surface font-bold truncate mt-0.5">
              {product.name}
            </h3>
          </Link>

          <p className="font-body-sm text-on-surface-variant line-clamp-2 mt-1">
            {product.description}
          </p>

          {/* Size Selector if multiple sizes */}
          {product.sizes && product.sizes.length > 1 && (
            <div className="mt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSize(s)}
                  className={`text-[11px] px-2 py-0.5 rounded-md font-label-sm shrink-0 transition-all ${
                    selectedSize === s
                      ? 'bg-primary text-on-primary font-bold shadow-xs'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & Cart Action Bar */}
        <div className="pt-2 border-t border-surface-container/80 flex flex-col gap-2">
          {product.isLiveFish ? (
            <div className="flex items-center justify-between">
              <span className="font-label-md font-bold text-primary flex items-center gap-1.5 text-sm">
                <span className="material-symbols-outlined text-[17px] text-[#25D366]">chat</span>
                Price on Request
              </span>
              <span className="font-label-sm text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-xs">
                Live in Sothupakkam
              </span>
            </div>
          ) : (
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="font-headline-sm font-bold text-on-surface">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="font-body-sm text-on-surface-variant line-through text-xs">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <span className="font-label-sm text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold">
                Live in Sothupakkam
              </span>
            </div>
          )}

          {/* Action Buttons: If live fish, direct WhatsApp Inquiry button. Otherwise, Add to Cart + WhatsApp */}
          {product.isLiveFish ? (
            <a
              href={`${SHOP_INFO.whatsappDirect}?text=Hello%20Dolphin%20Aquarium,%20I%20am%20interested%20in%20${encodeURIComponent(
                product.name
              )}%20(Size:%20${encodeURIComponent(selectedSize)}).%20Please%20share%20current%20price%20and%20availability.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-10 rounded-xl bg-[#25D366] hover:bg-[#1ebd59] active:scale-95 text-white font-label-md font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              <span>WhatsApp Inquiry</span>
            </a>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => addToCart(product, quantity, selectedSize)}
                className="h-10 rounded-xl bg-[#cc4729] hover:bg-[#b03b20] active:scale-95 text-white font-label-md flex items-center justify-center gap-1 transition-all shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                <span>Add to Cart</span>
              </button>

              <a
                href={`${SHOP_INFO.whatsappDirect}?text=Hello%20Dolphin%20Aquarium,%20I%20am%20interested%20in%20${encodeURIComponent(
                  product.name
                )}%20(Price:%20₹${product.price})`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 rounded-xl bg-[#25D366] hover:bg-[#1ebd59] active:scale-95 text-white font-label-md font-bold flex items-center justify-center gap-1 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                <span>WhatsApp</span>
              </a>
            </div>
          )}

          {product.isLiveFish && (
            <p className="text-[11px] text-on-surface-variant/80 text-center italic">
              * Live Fish Availability May Vary
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
