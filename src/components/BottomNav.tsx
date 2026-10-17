'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { cartCount } = useCart();

  const navItems = [
    { label: 'Home', href: '/', icon: 'water_drop' },
    { label: 'Fish', href: '/fish', icon: 'set_meal' },
    { label: 'Tanks', href: '/tanks', icon: 'waves' },
    { label: 'Care', href: '/medicines', icon: 'sanitizer' },
    { label: 'Cart', href: '/cart', icon: 'shopping_bag', badge: cartCount },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.06)] border-t border-surface-container lg:hidden">
      <div className="flex justify-around items-center h-16 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex flex-col items-center justify-center min-w-[56px] h-12 px-2 transition-all rounded-xl ${
                isActive
                  ? 'text-primary font-bold bg-surface-container-high'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <div className="relative">
                <span className="material-symbols-outlined text-[22px]">
                  {item.icon}
                </span>
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#ff6b4a] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="font-label-sm text-[10px] mt-0.5 leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
