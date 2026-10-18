'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { SHOP_INFO } from '@/data/products';
import ProductCard from '@/components/ProductCard';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailClient({
  product: initialProduct,
  relatedProducts,
}: ProductDetailClientProps) {
  const [product, setProduct] = useState<Product>(initialProduct);

  useEffect(() => {
    setProduct(initialProduct);
  }, [initialProduct]);

  useEffect(() => {
    const handleProductsUpdated = async () => {
      try {
        const res = await fetch(`/api/products/${initialProduct.id}?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', Pragma: 'no-cache' },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.product) {
            setProduct(data.product);
          }
        }
      } catch {}
    };

    window.addEventListener('dolphin_products_updated', handleProductsUpdated);
    return () => {
      window.removeEventListener('dolphin_products_updated', handleProductsUpdated);
    };
  }, [initialProduct.id]);

  const validImages = (product.images || []).filter(
    (img) => typeof img === 'string' && img.trim().length > 0
  );
  const primaryValid =
    typeof product.primaryImage === 'string' && product.primaryImage.trim().length > 0
      ? product.primaryImage.trim()
      : null;
  const initialImage = primaryValid || validImages[0] || null;

  const [selectedImage, setSelectedImage] = useState<string | null>(initialImage);
  const [selectedSize, setSelectedSize] = useState(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Standard'
  );
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const imagesList = validImages.length > 0 ? validImages : primaryValid ? [primaryValid] : [];

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs font-label-md text-on-surface-variant overflow-x-auto no-scrollbar py-1">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link
          href={product.isLiveFish ? '/fish' : '/tanks'}
          className="hover:text-primary transition-colors"
        >
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-on-surface font-semibold truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: Image Gallery */}
        <div className="flex flex-col gap-3">
          <div className="relative w-full aspect-[4/3] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-surface-container border border-surface-container shadow-sm">
            {selectedImage ? (
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                priority
                unoptimized={Boolean(selectedImage.startsWith('data:') || selectedImage.startsWith('/api/uploads/') || selectedImage.startsWith('/uploads/'))}
                className="object-cover transition-all duration-300"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container text-on-surface-variant/40 gap-2">
                <span className="material-symbols-outlined text-[48px]">set_meal</span>
                <span className="text-xs font-label-md">No Image Available</span>
              </div>
            )}
            {product.availability === 'in_stock' ? (
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-600/90 text-white font-label-sm text-xs font-bold shadow-sm backdrop-blur-md flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                In Stock & Verified
              </span>
            ) : (
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-red-600/90 text-white font-label-sm text-xs font-bold shadow-sm backdrop-blur-md">
                Low Stock
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {imagesList.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {imagesList.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    selectedImage === img
                      ? 'border-primary shadow-sm scale-105'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Preview ${i + 1}`}
                    fill
                    unoptimized={Boolean(img.startsWith('data:') || img.startsWith('/api/uploads/') || img.startsWith('/uploads/'))}
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Actions */}
        <div className="flex flex-col gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-surface-container text-primary font-label-sm text-xs font-bold">
                {product.category}
              </span>
              {product.variety && (
                <span className="font-label-sm text-xs text-secondary font-semibold">
                  {product.variety}
                </span>
              )}
              {product.gender && (
                <span className="font-label-sm text-xs px-2 py-0.5 rounded bg-surface-container-high text-primary font-semibold">
                  {product.gender}
                </span>
              )}
            </div>

            <h1 className="font-headline-lg font-bold text-on-surface leading-tight">
              {product.name}
            </h1>

            {/* Price Display */}
            <div className="mt-3 flex items-baseline gap-3">
              <span className="font-headline-xl font-extrabold text-primary">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="font-body-lg text-on-surface-variant line-through text-base">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              <span className="font-label-sm text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                Direct Store Price
              </span>
            </div>
          </div>

          <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
            {product.description}
          </p>

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="flex flex-col gap-1.5 pt-2">
              <span className="font-label-md text-xs font-bold text-on-surface">
                Select Size / Configuration:
              </span>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`px-3.5 py-1.5 rounded-xl font-label-md text-xs transition-all ${
                      selectedSize === s
                        ? 'bg-primary text-on-primary font-bold shadow-xs'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Controls */}
          <div className="flex items-center gap-4 pt-2">
            <span className="font-label-md text-xs font-bold text-on-surface">Quantity:</span>
            <div className="flex items-center border border-outline-variant/60 rounded-xl bg-surface-container-low overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 flex items-center justify-center text-on-surface hover:bg-surface-container font-bold"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="w-10 text-center font-label-md text-sm font-bold text-on-surface">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 flex items-center justify-center text-on-surface hover:bg-surface-container font-bold"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart & Primary Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
            <button
              type="button"
              onClick={() => addToCart(product, quantity, selectedSize)}
              className="h-12 rounded-xl bg-[#cc4729] hover:bg-[#b03b20] active:scale-95 text-white font-label-lg font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
              <span>Add to Cart</span>
            </button>

            <a
              href={`${SHOP_INFO.whatsappDirect}?text=Hello%20Dolphin%20Aquarium,%20I%20am%20interested%20in%20${encodeURIComponent(
                product.name
              )}%20(Size:%20${selectedSize},%20Price:%20₹${product.price})`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 rounded-xl bg-[#25D366] hover:bg-[#1ebd59] active:scale-95 text-white font-label-lg font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">chat</span>
              <span>WhatsApp Inquiry</span>
            </a>
          </div>

          <div className="pt-2">
            <a
              href={SHOP_INFO.phoneDial}
              className="w-full h-11 rounded-xl bg-surface-container text-primary font-label-md font-bold flex items-center justify-center gap-2 hover:bg-surface-container-high transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">call</span>
              <span>Call Store Directly: {SHOP_INFO.phoneDisplay}</span>
            </a>
          </div>

          {/* Live Fish Availability Disclaimer */}
          {product.isLiveFish && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-amber-700 shrink-0">info</span>
              <span>
                <strong>Notice:</strong> Live Fish Availability May Vary. All livestock undergo strict health quarantine. Please verify stock on WhatsApp before store pickup.
              </span>
            </div>
          )}

          {/* Water Parameters Breakdown (If Live Fish) */}
          {product.isLiveFish && product.waterParams && (
            <div className="mt-2 p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-2">
              <h4 className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider">
                Recommended Water Parameters
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                <div className="bg-surface-container-lowest p-2 rounded-lg">
                  <span className="text-secondary block">pH Range:</span>
                  <span className="font-bold text-on-surface">{product.waterParams.ph}</span>
                </div>
                <div className="bg-surface-container-lowest p-2 rounded-lg">
                  <span className="text-secondary block">Temperature:</span>
                  <span className="font-bold text-on-surface">{product.waterParams.temp}</span>
                </div>
                <div className="bg-surface-container-lowest p-2 rounded-lg">
                  <span className="text-secondary block">Temperament:</span>
                  <span className="font-bold text-on-surface">{product.waterParams.temperament}</span>
                </div>
                {product.waterParams.careLevel && (
                  <div className="bg-surface-container-lowest p-2 rounded-lg">
                    <span className="text-secondary block">Care Level:</span>
                    <span className="font-bold text-on-surface">{product.waterParams.careLevel}</span>
                  </div>
                )}
                {product.waterParams.tankMinGallons && (
                  <div className="bg-surface-container-lowest p-2 rounded-lg">
                    <span className="text-secondary block">Min Tank:</span>
                    <span className="font-bold text-on-surface">{product.waterParams.tankMinGallons} Gallons</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Technical Specs Breakdown (If Hardware) */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="mt-2 p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-2">
              <h4 className="font-label-md text-xs font-bold text-on-surface uppercase tracking-wider">
                Product Specifications
              </h4>
              <div className="flex flex-col gap-1.5 text-xs">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="flex justify-between py-1 border-b border-surface-container">
                    <span className="text-secondary font-medium">{key}:</span>
                    <span className="font-bold text-on-surface">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="flex flex-col gap-4 mt-8 pt-8 border-t border-surface-container">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm font-bold text-on-surface">Related Species & Products</h3>
            <Link
              href={product.isLiveFish ? '/fish' : '/tanks'}
              className="font-label-sm text-xs text-primary font-bold hover:underline"
            >
              Browse Full Catalog →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} aspectRatio="4/5" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
