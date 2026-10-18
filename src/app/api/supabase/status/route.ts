import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return NextResponse.json({
        connected: false,
        error: error.message,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      }, { status: 500 });
    }

    return NextResponse.json({
      connected: true,
      message: 'Supabase connected successfully',
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSession: Boolean(data.session),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({
      connected: false,
      error: message,
    }, { status: 500 });
  }
}
