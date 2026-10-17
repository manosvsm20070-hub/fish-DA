import { NextRequest, NextResponse } from 'next/server';
import { normalizePhoneNumber, sendOtp } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const role = (body.role || 'CUSTOMER').toString().toUpperCase() as 'ADMIN' | 'CUSTOMER';
    const { phone } = body;

    const normalized = normalizePhoneNumber(phone);
    if (!normalized.valid) {
      return NextResponse.json({ success: false, error: normalized.error }, { status: 400 });
    }

    const result = await sendOtp(normalized.normalized, role);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      phone: normalized.normalized,
      countdownSec: result.countdownSec,
      devOtp: result.devOtp, // available only in mock development mode
    });
  } catch (err: any) {
    console.error('API /api/otp/send error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
