import { NextRequest, NextResponse } from 'next/server';
import { normalizePhoneNumber, verifyOtp } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const role = (body.role || 'CUSTOMER').toString().toUpperCase() as 'ADMIN' | 'CUSTOMER';
    const { phone, code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ success: false, error: 'Please enter the 6-digit OTP' }, { status: 400 });
    }

    const normalized = normalizePhoneNumber(phone);
    if (!normalized.valid) {
      return NextResponse.json({ success: false, error: normalized.error }, { status: 400 });
    }

    const result = verifyOtp(normalized.normalized, code, role);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 401 });
    }

    const res = NextResponse.json({
      success: true,
      phone: normalized.normalized,
      token: result.token,
      role,
      requiresPassword: role === 'ADMIN',
    });

    return res;
  } catch (err: any) {
    console.error('API /api/otp/verify error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
