import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifySessionToken } from '@/lib/auth';
import { getSettings, updateSettings } from '@/lib/storage';

function authenticateAdmin(req: NextRequest): boolean {
  const token =
    req.cookies.get('admin_session')?.value ||
    req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return false;
  const verified = verifySessionToken(token);
  return verified.valid && verified.role === 'ADMIN';
}

// GET /api/admin/settings
export async function GET(req: NextRequest) {
  if (!authenticateAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin authentication required' }, { status: 401 });
  }

  try {
    const settings = await getSettings();
    return NextResponse.json({
      success: true,
      settings: {
        theme: settings.theme,
        customerInterface: settings.customerInterface,
      },
    });
  } catch (err: unknown) {
    console.error('Error fetching settings:', err);
    return NextResponse.json({ success: false, error: 'Failed to retrieve settings' }, { status: 500 });
  }
}

// PUT /api/admin/settings
export async function PUT(req: NextRequest) {
  if (!authenticateAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin authentication required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { theme, customerInterface } = body;

    const result = await updateSettings({
      ...(theme ? { theme } : {}),
      ...(customerInterface ? { customerInterface } : {}),
    });

    if (!result.success || !result.settings) {
      return NextResponse.json({ success: false, error: result.error || 'Failed to update settings' }, { status: 500 });
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/', 'page');
      revalidatePath('/fish', 'page');
      revalidatePath('/tanks', 'page');
      revalidatePath('/contact', 'page');
      revalidatePath('/medicines', 'page');
    } catch {}

    return NextResponse.json({
      success: true,
      settings: {
        theme: result.settings.theme,
        customerInterface: result.settings.customerInterface,
      },
    });
  } catch (err: unknown) {
    console.error('Error updating settings:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
