import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseIdToken } from '@/lib/firebaseAdmin';
import { createSessionToken, ADMIN_PHONE_NUMBER } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken } = body;

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing Firebase ID token.' },
        { status: 400 }
      );
    }

    // 1. Cryptographically verify the Firebase ID token on the server
    const verification = await verifyFirebaseIdToken(idToken);
    if (!verification.valid || !verification.phone) {
      return NextResponse.json(
        {
          success: false,
          error: verification.error || 'Firebase OTP verification failed.',
        },
        { status: 401 }
      );
    }

    // 2. Strict server-side check: Is this phone authorized as ADMIN?
    if (verification.phone !== ADMIN_PHONE_NUMBER) {
      console.warn(`Unauthorized admin attempt from: ${verification.phone}`);
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Phone number is not permitted administrator access.',
        },
        { status: 403 }
      );
    }

    // 3. Issue secure HMAC session token for ADMIN
    const sessionToken = createSessionToken(ADMIN_PHONE_NUMBER, 'ADMIN');

    const res = NextResponse.json({
      success: true,
      message: 'Admin authenticated via Firebase SMS OTP successfully.',
      role: 'ADMIN',
      phone: verification.phone,
    });

    // 4. Set secure HTTP-only cookie
    res.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60, // 8 hours
    });

    return res;
  } catch (err: unknown) {
    console.error('API /api/admin/login-firebase error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error during admin authentication' },
      { status: 500 }
    );
  }
}
