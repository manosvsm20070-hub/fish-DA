'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SiteSettings } from '@/types';

interface SettingsManagerProps {
  settings: SiteSettings | null;
  onRefresh: () => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

type SettingsSubTab = 'theme' | 'password' | 'interface';

interface ThemePreset {
  id: string;
  name: string;
  desc: string;
  primary: string;
  accent: string;
}

const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'ocean-teal',
    name: 'Ocean Teal',
    desc: 'Classic Dolphin Aquarium signature colors',
    primary: '#006572',
    accent: '#cc4729',
  },
  {
    id: 'marine-blue',
    name: 'Marine Deep Blue',
    desc: 'Deep oceanic water tones with neon coral accents',
    primary: '#005088',
    accent: '#ff6b4a',
  },
  {
    id: 'emerald-lagoon',
    name: 'Emerald Lagoon',
    desc: 'Lush planted aquascape with sunset warmth',
    primary: '#0b6b53',
    accent: '#e05a2b',
  },
  {
    id: 'coral-sunset',
    name: 'Coral Sunset',
    desc: 'Warm vibrant reef orange with teal contrast',
    primary: '#cc4729',
    accent: '#006572',
  },
  {
    id: 'royal-indigo',
    name: 'Royal Indigo',
    desc: 'Modern midnight indigo with amber highlights',
    primary: '#4338ca',
    accent: '#f97316',
  },
  {
    id: 'midnight-dark',
    name: 'Midnight Slate',
    desc: 'Sleek dark aquatic atmosphere with cyan pop',
    primary: '#1e293b',
    accent: '#0284c7',
  },
];

export default function SettingsManager({ settings, onRefresh, showToast }: SettingsManagerProps) {
  const [activeTab, setActiveTab] = useState<SettingsSubTab>('theme');
  const [isSaving, setIsSaving] = useState(false);

  // ── Theme State ──────────────────────────────────────────
  const [themePreset, setThemePreset] = useState(settings?.theme?.preset || 'ocean-teal');
  const [primaryColor, setPrimaryColor] = useState(settings?.theme?.primaryColor || '#006572');
  const [accentColor, setAccentColor] = useState(settings?.theme?.accentColor || '#cc4729');
  const [darkMode, setDarkMode] = useState(!!settings?.theme?.darkMode);

  // ── Password State ───────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // ── Customer Interface State ─────────────────────────────
  const [storeName, setStoreName] = useState(settings?.customerInterface?.storeName || 'Dolphin Aquarium');
  const [tagline, setTagline] = useState(settings?.customerInterface?.tagline || 'Freshwater Specialist & Custom Rimless Tanks');
  const [announcementEnabled, setAnnouncementEnabled] = useState(settings?.customerInterface?.announcement?.enabled ?? true);
  const [announcementText, setAnnouncementText] = useState(settings?.customerInterface?.announcement?.text || '');
  const [announcementLinkText, setAnnouncementLinkText] = useState(settings?.customerInterface?.announcement?.linkText || '');
  const [announcementLinkUrl, setAnnouncementLinkUrl] = useState(settings?.customerInterface?.announcement?.linkUrl || '');

  // Hero
  const [heroHeadline, setHeroHeadline] = useState(settings?.customerInterface?.hero?.headline || '');
  const [heroSubtitle, setHeroSubtitle] = useState(settings?.customerInterface?.hero?.subtitle || '');
  const [heroBannerImage, setHeroBannerImage] = useState(settings?.customerInterface?.hero?.bannerImage || '');
  const [quarantineBadgeText, setQuarantineBadgeText] = useState(settings?.customerInterface?.hero?.quarantineBadgeText || 'Quarantine Certified');
  const [ratingBadgeText, setRatingBadgeText] = useState(settings?.customerInterface?.hero?.ratingBadgeText || '4.9 (Live Stock)');
  const [highlightNotice, setHighlightNotice] = useState(settings?.customerInterface?.hero?.highlightNotice || '');
  const [uploadingHero, setUploadingHero] = useState(false);

  // Contact
  const [address, setAddress] = useState(settings?.customerInterface?.contact?.address || '');
  const [phoneDisplay, setPhoneDisplay] = useState(settings?.customerInterface?.contact?.phoneDisplay || '');
  const [phoneDial, setPhoneDial] = useState(settings?.customerInterface?.contact?.phoneDial || '');
  const [whatsappNumber, setWhatsappNumber] = useState(settings?.customerInterface?.contact?.whatsappNumber || '');
  const [openHours, setOpenHours] = useState(settings?.customerInterface?.contact?.openHours || '');

  // Apply theme preset
  const handleSelectPreset = (preset: ThemePreset) => {
    setThemePreset(preset.id);
    setPrimaryColor(preset.primary);
    setAccentColor(preset.accent);
  };

  // Upload hero banner image
  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Maximum image size is 5MB', 'error');
      return;
    }
    setUploadingHero(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success && data.url) {
        setHeroBannerImage(data.url);
        showToast('Hero image uploaded!');
      } else {
        showToast(data.error || 'Upload failed', 'error');
      }
    } catch {
      showToast('Upload failed', 'error');
    } finally {
      setUploadingHero(false);
      e.target.value = '';
    }
  };

  // ── SAVE THEME ───────────────────────────────────────────
  const handleSaveTheme = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: {
            preset: themePreset,
            primaryColor,
            accentColor,
            darkMode,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.error || 'Failed to save theme', 'error');
        return;
      }

      // Dynamically apply colors to root document
      if (typeof document !== 'undefined') {
        document.documentElement.style.setProperty('--color-primary', primaryColor);
        document.documentElement.style.setProperty('--color-primary-container', primaryColor);
        document.documentElement.style.setProperty('--color-tertiary-container', accentColor);
        document.documentElement.style.setProperty('--color-coral', accentColor);
        if (darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }

      showToast('Theme settings saved! Storefront updated.');
      await onRefresh();
    } catch {
      showToast('Network error while saving theme', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ── SAVE PASSWORD ────────────────────────────────────────
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current admin password.');
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setPasswordError('New password must be at least 4 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setPasswordError(data.error || 'Failed to update password.');
        showToast(data.error || 'Password update failed', 'error');
        return;
      }

      showToast('Admin password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      await onRefresh();
    } catch {
      setPasswordError('Network error while updating password.');
      showToast('Failed to update password', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ── SAVE CUSTOMER INTERFACE ──────────────────────────────
  const handleSaveInterface = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerInterface: {
            storeName,
            tagline,
            announcement: {
              enabled: announcementEnabled,
              text: announcementText,
              linkText: announcementLinkText,
              linkUrl: announcementLinkUrl,
            },
            hero: {
              headline: heroHeadline,
              subtitle: heroSubtitle,
              bannerImage: heroBannerImage,
              quarantineBadgeText,
              ratingBadgeText,
              highlightNotice,
            },
            contact: {
              address,
              phoneDisplay,
              phoneDial,
              whatsappNumber,
              openHours,
            },
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.error || 'Failed to save interface', 'error');
        return;
      }

      showToast('Customer interface saved! Storefront updated.');
      await onRefresh();
    } catch {
      showToast('Network error while saving customer interface', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-container pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('theme')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-label-md text-sm font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'theme'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">palette</span>
          <span>Theme & Palette</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('password')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-label-md text-sm font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'password'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">lock</span>
          <span>Admin Password</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('interface')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-label-md text-sm font-bold transition-all cursor-pointer shrink-0 ${
            activeTab === 'interface'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">desktop_windows</span>
          <span>Customer Page Interface</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 1. THEME & PALETTE TAB */}
      {/* ═══════════════════════════════════════════════════════ */}
      {activeTab === 'theme' && (
        <div className="flex flex-col gap-6">
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-xs flex flex-col gap-6">
            <div>
              <h3 className="font-headline-sm font-bold text-on-surface text-lg">
                Color Palette & Theme Presets
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                Choose a curated aquarium palette or customize your primary brand and accent action colors.
              </p>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {THEME_PRESETS.map((preset) => {
                const isSelected = themePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                        : 'border-surface-container hover:border-outline-variant bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <span
                          className="w-5 h-5 rounded-full border border-black/10 shadow-xs -ml-1"
                          style={{ backgroundColor: preset.accent }}
                        />
                      </div>
                      {isSelected && (
                        <span className="material-symbols-outlined text-primary text-[18px]">
                          check_circle
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-label-md font-bold text-sm text-on-surface">
                        {preset.name}
                      </p>
                      <p className="font-body-sm text-[11px] text-on-surface-variant leading-tight mt-0.5">
                        {preset.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-surface-container">
              {/* Primary Color */}
              <div className="flex flex-col gap-2 p-4 rounded-xl bg-surface-container-low border border-surface-container">
                <label className="font-label-md text-xs font-bold text-on-surface flex items-center justify-between">
                  <span>Primary Brand Color</span>
                  <span className="font-mono text-[11px] text-on-surface-variant uppercase">
                    {primaryColor}
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => {
                      setPrimaryColor(e.target.value);
                      setThemePreset('custom');
                    }}
                    className="w-12 h-10 rounded-lg cursor-pointer border border-outline-variant/60 p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => {
                      setPrimaryColor(e.target.value);
                      setThemePreset('custom');
                    }}
                    className="h-10 px-3 rounded-lg bg-surface border border-outline-variant/60 font-mono text-xs text-on-surface uppercase w-32 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>
                <span className="text-[11px] text-on-surface-variant">
                  Used for headers, navigation, primary tags, and main icons.
                </span>
              </div>

              {/* Accent Color */}
              <div className="flex flex-col gap-2 p-4 rounded-xl bg-surface-container-low border border-surface-container">
                <label className="font-label-md text-xs font-bold text-on-surface flex items-center justify-between">
                  <span>Accent / CTA Action Color</span>
                  <span className="font-mono text-[11px] text-on-surface-variant uppercase">
                    {accentColor}
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => {
                      setAccentColor(e.target.value);
                      setThemePreset('custom');
                    }}
                    className="w-12 h-10 rounded-lg cursor-pointer border border-outline-variant/60 p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => {
                      setAccentColor(e.target.value);
                      setThemePreset('custom');
                    }}
                    className="h-10 px-3 rounded-lg bg-surface border border-outline-variant/60 font-mono text-xs text-on-surface uppercase w-32 focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>
                <span className="text-[11px] text-on-surface-variant">
                  Used for &quot;Place Order&quot;, badges, special notices, and call-to-actions.
                </span>
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-surface-container">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface">
                  <span className="material-symbols-outlined text-[20px]">
                    {darkMode ? 'dark_mode' : 'light_mode'}
                  </span>
                </div>
                <div>
                  <p className="font-label-md font-bold text-xs text-on-surface">
                    Dark Storefront Mode
                  </p>
                  <p className="font-body-sm text-[11px] text-on-surface-variant">
                    Enable a nocturnal oceanic dark theme across the website.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>

            {/* Live Preview Box */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-3">
              <span className="font-label-sm text-xs font-bold text-on-surface uppercase tracking-wider">
                Live Storefront Component Preview
              </span>
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <span className="material-symbols-outlined text-[22px]">pets</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-headline-sm font-bold text-sm text-on-surface">
                        Red Cap Oranda Goldfish
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Quarantine Certified
                      </span>
                    </div>
                    <p className="font-body-sm text-xs text-on-surface-variant">
                      Fancy Wen Growth &bull; High Grade Live Stock
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className="font-headline-md font-extrabold text-lg"
                    style={{ color: accentColor }}
                  >
                    ₹850
                  </span>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl text-white font-label-md text-xs font-bold shadow-xs active:scale-95 transition-all"
                    style={{ backgroundColor: accentColor }}
                  >
                    Order Now
                  </button>
                </div>
              </div>
            </div>

            {/* Save Theme Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveTheme}
                className="h-11 px-6 rounded-xl bg-primary text-on-primary font-label-md text-xs font-bold flex items-center gap-2 shadow-sm hover:bg-primary-container transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Theme...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    <span>Save Theme Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 2. ADMIN PASSWORD TAB */}
      {/* ═══════════════════════════════════════════════════════ */}
      {activeTab === 'password' && (
        <div className="flex flex-col gap-6">
          <form
            onSubmit={handleUpdatePassword}
            className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-xs flex flex-col gap-5"
          >
            <div>
              <h3 className="font-headline-sm font-bold text-on-surface text-lg">
                Change Admin Password
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                Update the master password used to log in at <code className="font-mono text-primary font-bold">/admin</code>.
              </p>
            </div>

            {passwordError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 font-label-md text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{passwordError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Current Password */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="font-label-md text-xs font-bold text-on-surface">
                  Current Password *
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full h-11 px-3.5 pr-11 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 text-on-surface-variant hover:text-on-surface p-1 cursor-pointer"
                    tabIndex={-1}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showCurrent ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-xs font-bold text-on-surface">
                  New Password *
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showNew ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-11 px-3.5 pr-11 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 text-on-surface-variant hover:text-on-surface p-1 cursor-pointer"
                    tabIndex={-1}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showNew ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-xs font-bold text-on-surface">
                  Confirm New Password *
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-11 px-3.5 pr-11 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 text-on-surface-variant hover:text-on-surface p-1 cursor-pointer"
                    tabIndex={-1}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showConfirm ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container flex items-center gap-2.5 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px] text-primary shrink-0">shield</span>
              <span>
                Passwords are saved persistently in server storage. Your active session remains authenticated after updating.
              </span>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="h-11 px-6 rounded-xl bg-primary text-on-primary font-label-md text-xs font-bold flex items-center gap-2 shadow-sm hover:bg-primary-container transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">key</span>
                    <span>Update Admin Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 3. CUSTOMER PAGE INTERFACE TAB */}
      {/* ═══════════════════════════════════════════════════════ */}
      {activeTab === 'interface' && (
        <div className="flex flex-col gap-6">
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-xs flex flex-col gap-6">
            <div>
              <h3 className="font-headline-sm font-bold text-on-surface text-lg">
                Customer Storefront Interface
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                Customize the announcement bar, homepage hero banner, trust badges, and public store contact details.
              </p>
            </div>

            {/* SECTION A: Top Announcement Bar */}
            <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">campaign</span>
                  <span className="font-label-md font-bold text-sm text-on-surface">
                    Top Announcement Bar
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={announcementEnabled}
                    onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>

              {announcementEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-surface-container">
                  <div className="flex flex-col gap-1.5 sm:col-span-3">
                    <label className="font-label-md text-xs font-bold text-on-surface">
                      Announcement Text
                    </label>
                    <input
                      type="text"
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                      placeholder="e.g. 🌊 Free live transit & delivery across Sothupakkam on orders over ₹1,500!"
                      className="h-10 px-3.5 rounded-xl bg-surface border border-outline-variant/60 font-body-md text-xs focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-1">
                    <label className="font-label-md text-xs font-bold text-on-surface">
                      Button Link Text (Optional)
                    </label>
                    <input
                      type="text"
                      value={announcementLinkText}
                      onChange={(e) => setAnnouncementLinkText(e.target.value)}
                      placeholder="e.g. Shop Fish Now"
                      className="h-10 px-3.5 rounded-xl bg-surface border border-outline-variant/60 font-body-md text-xs focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="font-label-md text-xs font-bold text-on-surface">
                      Button Link URL
                    </label>
                    <input
                      type="text"
                      value={announcementLinkUrl}
                      onChange={(e) => setAnnouncementLinkUrl(e.target.value)}
                      placeholder="e.g. /fish"
                      className="h-10 px-3.5 rounded-xl bg-surface border border-outline-variant/60 font-body-md text-xs focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SECTION B: Homepage Hero Spotlight */}
            <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">image</span>
                <span className="font-label-md font-bold text-sm text-on-surface">
                  Homepage Hero Spotlight Banner
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Headline */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-xs font-bold text-on-surface">
                    Hero Main Headline
                  </label>
                  <input
                    type="text"
                    value={heroHeadline}
                    onChange={(e) => setHeroHeadline(e.target.value)}
                    placeholder="e.g. Dolphin Aquarium"
                    className="h-10 px-3.5 rounded-xl bg-surface border border-outline-variant/60 font-body-md text-xs focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>

                {/* Subtitle */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-xs font-bold text-on-surface">
                    Hero Subtitle / Tagline
                  </label>
                  <input
                    type="text"
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    placeholder="e.g. Freshwater Livestock, Custom Rimless Tanks & Aquatic Equipment"
                    className="h-10 px-3.5 rounded-xl bg-surface border border-outline-variant/60 font-body-md text-xs focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>

                {/* Hero Banner Image */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="font-label-md text-xs font-bold text-on-surface">
                    Banner Background Image
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="text"
                      value={heroBannerImage}
                      onChange={(e) => setHeroBannerImage(e.target.value)}
                      placeholder="Paste image URL (https://...)"
                      className="flex-1 h-10 px-3.5 rounded-xl bg-surface border border-outline-variant/60 font-body-md text-xs focus:ring-2 focus:ring-primary/40 focus:outline-none w-full"
                    />
                    <label className="h-10 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0">
                      <span className="material-symbols-outlined text-[16px]">upload</span>
                      <span>{uploadingHero ? 'Uploading...' : 'Upload Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleHeroImageUpload}
                        disabled={uploadingHero}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {heroBannerImage && (
                    <div className="relative w-full h-36 rounded-xl overflow-hidden mt-1 border border-surface-container bg-surface-container">
                      <Image
                        src={heroBannerImage}
                        alt="Hero Banner Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Trust Badges */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-xs font-bold text-on-surface">
                    Left Trust Badge Text
                  </label>
                  <input
                    type="text"
                    value={quarantineBadgeText}
                    onChange={(e) => setQuarantineBadgeText(e.target.value)}
                    placeholder="e.g. Quarantine Certified"
                    className="h-10 px-3.5 rounded-xl bg-surface border border-outline-variant/60 font-body-md text-xs focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-xs font-bold text-on-surface">
                    Right Rating Badge Text
                  </label>
                  <input
                    type="text"
                    value={ratingBadgeText}
                    onChange={(e) => setRatingBadgeText(e.target.value)}
                    placeholder="e.g. 4.9 (Live Stock)"
                    className="h-10 px-3.5 rounded-xl bg-surface border border-outline-variant/60 font-body-md text-xs focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>

                {/* Highlight Notice */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="font-label-md text-xs font-bold text-on-surface">
                    Store Assurance Banner Notice
                  </label>
                  <textarea
                    rows={2}
                    value={highlightNotice}
                    onChange={(e) => setHighlightNotice(e.target.value)}
                    placeholder="e.g. 100% Healthy Quarantine Assured. Direct Tank Delivery across Sothupakkam & Chengalpattu region."
                    className="p-3 rounded-xl bg-surface border border-outline-variant/60 font-body-md text-xs focus:ring-2 focus:ring-primary/40 focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION C: Store Identity & Contact */}
            <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">store</span>
                <span className="font-label-md font-bold text-sm text-on-surface">
                  Store Identity & Public Contact Details
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-xs font-bold text-on-surface">
                    Store Name
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="h-10 px-3.5 rounded-xl bg-surface border border-outline-variant/60 font-body-md text-xs focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-xs font-bold text-on-surface">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="h-10 px-3.5 rounded-xl bg-surface border border-outline-variant/60 font-body-md text-xs focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="font-label-md text-xs font-bold text-on-surface">
                    Physical Store Address
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="p-3 rounded-xl bg-surface border border-outline-variant/60 font-body-md text-xs focus:ring-2 focus:ring-primary/40 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-xs font-bold text-on-surface">
                    Display Phone Number
                  </label>
                  <input
                    type="text"
                    value={phoneDisplay}
                    onChange={(e) => setPhoneDisplay(e.target.value)}
                    className="h-10 px-3.5 rounded-xl bg-surface border border-outline-variant/60 font-body-md text-xs focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-xs font-bold text-on-surface">
                    Phone Dial URL
                  </label>
                  <input
                    type="text"
                    value={phoneDial}
                    onChange={(e) => setPhoneDial(e.target.value)}
                    placeholder="tel:07845637566"
                    className="h-10 px-3.5 rounded-xl bg-surface border border-outline-variant/60 font-body-md text-xs focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-xs font-bold text-on-surface">
                    WhatsApp Direct Number
                  </label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="917845637566"
                    className="h-10 px-3.5 rounded-xl bg-surface border border-outline-variant/60 font-body-md text-xs focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-xs font-bold text-on-surface">
                    Store Open Hours
                  </label>
                  <input
                    type="text"
                    value={openHours}
                    onChange={(e) => setOpenHours(e.target.value)}
                    placeholder="Open 7 days a week: 9:00 AM – 9:00 PM"
                    className="h-10 px-3.5 rounded-xl bg-surface border border-outline-variant/60 font-body-md text-xs focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Save Interface Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveInterface}
                className="h-11 px-6 rounded-xl bg-primary text-on-primary font-label-md text-xs font-bold flex items-center gap-2 shadow-sm hover:bg-primary-container transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Interface...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    <span>Save Customer Interface</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
