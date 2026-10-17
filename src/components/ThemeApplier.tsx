'use client';

import { useEffect } from 'react';

interface ThemeApplierProps {
  primaryColor?: string;
  accentColor?: string;
  darkMode?: boolean;
}

export default function ThemeApplier({ primaryColor, accentColor, darkMode }: ThemeApplierProps) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    if (primaryColor) {
      root.style.setProperty('--color-primary', primaryColor);
      root.style.setProperty('--color-primary-container', primaryColor);
    }

    if (accentColor) {
      root.style.setProperty('--color-tertiary-container', accentColor);
      root.style.setProperty('--color-coral', accentColor);
    }

    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [primaryColor, accentColor, darkMode]);

  return null;
}
