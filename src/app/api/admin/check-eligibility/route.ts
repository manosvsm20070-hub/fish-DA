import { NextRequest, NextResponse } from 'next/server';
import { normalizePhoneNumber, ADMIN_PHONE_NUMBER } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Mobile number is required.' },
        { status: 400 }
      );
    }

    const normalized = normalizePhoneNumber(phone);
    if (!normalized.valid) {
      return NextResponse.json(
        { success: false, error: normalized.error || 'Invalid phone number format.' },
        { status: 400 }
      );
    }

    // Server-side admin authorization verification:
    // Only the designated store administrator number is permitted
    if (normalized.normalized !== ADMIN_PHONE_NUMBER) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied. This mobile number is not authorized for administrator access.',
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      phone: normalized.normalized,
      authorized: true,
    });
  } catch (err: unknown) {
    console.error('API /api/admin/check-eligibility error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
