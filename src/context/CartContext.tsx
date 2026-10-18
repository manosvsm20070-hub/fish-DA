'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product } from '@/types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedSize?: string) => void;
  updateQuantity: (productId: string, selectedSize: string, delta: number) => void;
  removeFromCart: (productId: string, selectedSize: string) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  toastMessage: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'dolphin_aquarium_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed reading cart from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error('Failed saving cart to localStorage', e);
      }
    }
  }, [items, isLoaded]);

  // Synchronize cart item prices when admin updates product pricing
  useEffect(() => {
    const syncCartPrices = async () => {
      try {
        const res = await fetch(`/api/products?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', Pragma: 'no-cache' },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          const productMap = new Map<string, Product>(
            data.products.map((p: Product) => [p.id, p])
          );
          setItems((prev) => {
            let changed = false;
            const updated = prev.map((item) => {
              const live = productMap.get(item.productId);
              if (live && live.price !== item.price) {
                changed = true;
                return {
                  ...item,
                  price: live.price,
                  productName: live.name,
                  primaryImage: live.primaryImage || item.primaryImage,
                };
              }
              return item;
            });
            return changed ? updated : prev;
          });
        }
      } catch {}
    };

    window.addEventListener('dolphin_products_updated', syncCartPrices);
    return () => {
      window.removeEventListener('dolphin_products_updated', syncCartPrices);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const addToCart = (product: Product, quantity: number = 1, selectedSize?: string) => {
    const size = selectedSize || (product.sizes && product.sizes[0]) || 'Standard';

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && item.selectedSize === size
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      } else {
        const newItem: CartItem = {
          productId: product.id,
          productName: product.name,
          variety: product.variety,
          selectedSize: size,
          primaryImage: product.primaryImage,
          price: product.price,
          quantity,
          isLiveFish: product.isLiveFish,
        };
        return [...prev, newItem];
      }
    });

    showToast(`Added ${product.name} to cart`);
  };

  const updateQuantity = (productId: string, selectedSize: string, delta: number) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.productId === productId && item.selectedSize === selectedSize) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string, selectedSize: string) => {
    setItems((prev) =>
      prev.filter((item) => !(item.productId === productId && item.selectedSize === selectedSize))
    );
    showToast('Item removed from cart');
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {}
  };

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => (item.isLiveFish ? acc : acc + item.price * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        subtotal,
        toastMessage,
      }}
    >
      {children}
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md shadow-lg flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
