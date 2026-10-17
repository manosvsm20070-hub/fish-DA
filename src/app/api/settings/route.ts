import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/settings
export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({
      success: true,
      theme: settings.theme,
      customerInterface: settings.customerInterface,
    });
  } catch (err: unknown) {
    console.error('Error fetching public settings:', err);
    return NextResponse.json({ success: false, error: 'Failed to retrieve settings' }, { status: 500 });
  }
}
