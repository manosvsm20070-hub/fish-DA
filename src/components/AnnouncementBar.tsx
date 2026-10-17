'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface AnnouncementBarProps {
  announcement?: {
    enabled: boolean;
    text: string;
    linkText?: string;
    linkUrl?: string;
  };
}

export default function AnnouncementBar({ announcement }: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!announcement || !announcement.enabled || !announcement.text || dismissed) {
    return null;
  }

  return (
    <aside
      aria-label="Shop Announcement"
      className="w-full bg-gradient-to-r from-primary via-primary-container to-primary text-on-primary text-xs font-semibold py-2 px-4 shadow-xs flex items-center justify-between gap-3 relative z-50 border-b border-white/10"
    >
      <div className="flex-1 text-center flex items-center justify-center gap-2 flex-wrap">
        <span>{announcement.text}</span>
        {announcement.linkText && announcement.linkUrl && (
          <Link
            href={announcement.linkUrl}
            className="inline-flex items-center gap-1 underline font-bold hover:text-white/80 transition-colors ml-1 bg-white/15 px-2.5 py-0.5 rounded-full"
          >
            <span>{announcement.linkText}</span>
            <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
          </Link>
        )}
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="opacity-75 hover:opacity-100 p-1 rounded-full hover:bg-white/10 transition-all shrink-0 cursor-pointer"
        aria-label="Dismiss announcement"
      >
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </aside>
  );
}
