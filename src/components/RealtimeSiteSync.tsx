'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SiteSettings } from '@/types';

interface LiveSettingsContextType {
  theme?: SiteSettings['theme'];
  customerInterface?: SiteSettings['customerInterface'];
  announcement?: SiteSettings['customerInterface']['announcement'];
  contact?: SiteSettings['customerInterface']['contact'];
  hero?: SiteSettings['customerInterface']['hero'];
  storeName?: string;
  tagline?: string;
}

const LiveSettingsContext = createContext<LiveSettingsContextType | null>(null);

export function useLiveSettings() {
  const ctx = useContext(LiveSettingsContext);
  return ctx;
}

interface RealtimeSiteSyncProps {
  children?: React.ReactNode;
  initialSettings: SiteSettings;
  initialSyncVersion?: {
    settingsUpdatedAt: number;
    productsUpdatedAt: number;
  };
}

export default function RealtimeSiteSync({
  children,
  initialSettings,
  initialSyncVersion,
}: RealtimeSiteSyncProps) {
  const router = useRouter();

  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const lastSettingsTs = useRef<number>(initialSyncVersion?.settingsUpdatedAt || Date.now());
  const lastProductsTs = useRef<number>(initialSyncVersion?.productsUpdatedAt || Date.now());

  // Apply CSS theme variables & dark mode directly to document.documentElement
  const applyTheme = useCallback((theme?: SiteSettings['theme']) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    const primary = theme?.primaryColor || '#006572';
    const accent = theme?.accentColor || '#cc4729';
    const isDark = !!theme?.darkMode;

    root.style.setProperty('--color-primary', primary);
    root.style.setProperty('--color-primary-container', primary);
    root.style.setProperty('--color-tertiary-container', accent);
    root.style.setProperty('--color-coral', accent);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  // Apply initial theme on mount
  useEffect(() => {
    applyTheme(settings.theme);
  }, [applyTheme, settings.theme]);

  // Handle incoming update from broadcast or poll
  const handleUpdate = useCallback(
    (newSettings?: Partial<SiteSettings>, productsChanged?: boolean) => {
      if (newSettings) {
        setSettings((prev) => {
          const merged: SiteSettings = {
            ...prev,
            ...newSettings,
            theme: { ...prev.theme, ...(newSettings.theme || {}) },
            customerInterface: {
              ...prev.customerInterface,
              ...(newSettings.customerInterface || {}),
              announcement: {
                ...prev.customerInterface.announcement,
                ...(newSettings.customerInterface?.announcement || {}),
              },
              contact: {
                ...prev.customerInterface.contact,
                ...(newSettings.customerInterface?.contact || {}),
              },
            },
          };
          applyTheme(merged.theme);
          return merged;
        });
      }

      if (productsChanged) {
        window.dispatchEvent(new CustomEvent('dolphin_products_updated'));
      }

      // Refresh server-side components (prices, cards, banners)
      try {
        router.refresh();
      } catch {}
    },
    [applyTheme, router]
  );

  useEffect(() => {
    // 1. Cross-tab instant communication via BroadcastChannel
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('dolphin_site_sync');
        channel.onmessage = (event) => {
          const data = event.data;
          if (!data) return;

          if (data.type === 'SETTINGS_UPDATED' || data.type === 'ALL') {
            handleUpdate(data.settings, false);
          }
          if (data.type === 'PRODUCTS_UPDATED' || data.type === 'ALL') {
            handleUpdate(undefined, true);
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel init error:', e);
    }

    // 2. Storage event listener (fallback for cross-tab sync)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'dolphin_site_sync' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.type === 'SETTINGS_UPDATED' || parsed.type === 'ALL') {
            handleUpdate(parsed.settings, false);
          }
          if (parsed.type === 'PRODUCTS_UPDATED' || parsed.type === 'ALL') {
            handleUpdate(undefined, true);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    // 3. Polling check for remote devices / other browsers (heartbeat every 2s)
    let isChecking = false;
    const checkSync = async () => {
      if (isChecking) return;
      isChecking = true;
      try {
        const res = await fetch(`/api/sync?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            let shouldRefresh = false;

            if (data.settingsUpdatedAt && data.settingsUpdatedAt > lastSettingsTs.current) {
              lastSettingsTs.current = data.settingsUpdatedAt;
              handleUpdate(
                {
                  theme: data.theme,
                  customerInterface: data.customerInterface,
                },
                false
              );
              shouldRefresh = true;
            }

            if (data.productsUpdatedAt && data.productsUpdatedAt > lastProductsTs.current) {
              lastProductsTs.current = data.productsUpdatedAt;
              window.dispatchEvent(new CustomEvent('dolphin_products_updated'));
              shouldRefresh = true;
            }

            if (shouldRefresh) {
              try {
                router.refresh();
              } catch {}
            }
          }
        }
      } catch {
        // Silently ignore background poll errors
      } finally {
        isChecking = false;
      }
    };

    const interval = setInterval(checkSync, 2000);

    // Immediate sync on tab focus or visibility change
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkSync();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', checkSync);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', checkSync);
    };
  }, [handleUpdate, router]);

  const value: LiveSettingsContextType = {
    theme: settings.theme,
    customerInterface: settings.customerInterface,
    announcement: settings.customerInterface?.announcement,
    contact: settings.customerInterface?.contact,
    hero: settings.customerInterface?.hero,
    storeName: settings.customerInterface?.storeName || 'Dolphin Aquarium',
    tagline: settings.customerInterface?.tagline,
  };

  return <LiveSettingsContext.Provider value={value}>{children}</LiveSettingsContext.Provider>;
}
