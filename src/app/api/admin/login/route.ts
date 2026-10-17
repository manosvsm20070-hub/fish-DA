import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Password is required.' },
        { status: 400 }
      );
    }

    const result = await verifyAdminPassword(password);
    if (!result.success || !result.token) {
      return NextResponse.json(
        { success: false, error: result.error || 'Incorrect admin password.' },
        { status: 401 }
      );
    }

    const res = NextResponse.json({
      success: true,
      message: 'Admin authenticated successfully',
      role: 'ADMIN',
      token: result.token,
    });

    // Set secure HTTP-only cookie for admin
    res.cookies.set('admin_session', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60, // 8 hours
    });

    return res;
  } catch (err: unknown) {
    console.error('API /api/admin/login error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
