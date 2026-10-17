import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_session')?.value || req.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const verified = verifySessionToken(token);
  if (!verified.valid || verified.role !== 'ADMIN') {
    return NextResponse.json({ authenticated: false }, { status: 403 });
  }

  return NextResponse.json({
    authenticated: true,
    phone: verified.phone,
    role: verified.role,
  });
}
