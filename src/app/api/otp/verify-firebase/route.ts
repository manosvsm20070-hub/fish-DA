import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseIdToken } from '@/lib/firebaseAdmin';
import { createSessionToken } from '@/lib/auth';

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

    // Cryptographically verify the Firebase ID token on the server
    const verification = await verifyFirebaseIdToken(idToken);
    if (!verification.valid || !verification.phone) {
      return NextResponse.json(
        {
          success: false,
          error: verification.error || 'Firebase phone verification failed.',
        },
        { status: 401 }
      );
    }

    // Create a CUSTOMER role session token only
    // Customers can NEVER obtain admin credentials from this endpoint
    const sessionToken = createSessionToken(verification.phone, 'CUSTOMER');

    return NextResponse.json({
      success: true,
      phone: verification.phone,
      token: sessionToken,
      role: 'CUSTOMER',
    });
  } catch (err: unknown) {
    console.error('API /api/otp/verify-firebase error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error during phone verification' },
      { status: 500 }
    );
  }
}
