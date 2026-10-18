import { NextResponse } from 'next/server';
import { getSettings, getSyncVersion } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/sync — Fast real-time sync heartbeat for customer site
export async function GET() {
  try {
    const [settings, syncVersion] = await Promise.all([
      getSettings(),
      Promise.resolve(getSyncVersion()),
    ]);

    return NextResponse.json(
      {
        success: true,
        settingsUpdatedAt: syncVersion.settingsUpdatedAt,
        productsUpdatedAt: syncVersion.productsUpdatedAt,
        theme: settings.theme,
        customerInterface: settings.customerInterface,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (err: unknown) {
    console.error('API /api/sync error:', err);
    return NextResponse.json({ success: false, error: 'Sync failed' }, { status: 500 });
  }
}
