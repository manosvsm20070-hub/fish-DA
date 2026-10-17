import { NextResponse } from 'next/server';
import { getActiveCatalogs } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/catalogs — public endpoint for customer website
export async function GET() {
  try {
    const catalogs = await getActiveCatalogs();
    return NextResponse.json({ success: true, catalogs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Failed to load catalogs' }, { status: 500 });
  }
}
