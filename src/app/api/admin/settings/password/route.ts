import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { updateAdminPassword } from '@/lib/storage';

function authenticateAdmin(req: NextRequest): boolean {
  const token =
    req.cookies.get('admin_session')?.value ||
    req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return false;
  const verified = verifySessionToken(token);
  return verified.valid && verified.role === 'ADMIN';
}

// POST /api/admin/settings/password
export async function POST(req: NextRequest) {
  if (!authenticateAdmin(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin authentication required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword) {
      return NextResponse.json({ success: false, error: 'Current password is required.' }, { status: 400 });
    }

    if (!newPassword || newPassword.trim().length < 4) {
      return NextResponse.json({ success: false, error: 'New password must be at least 4 characters long.' }, { status: 400 });
    }

    const result = await updateAdminPassword(currentPassword, newPassword);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || 'Failed to update password.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Admin password updated successfully.',
    });
  } catch (err: unknown) {
    console.error('Error changing admin password:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
