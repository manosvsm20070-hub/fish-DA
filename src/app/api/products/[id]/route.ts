import { NextRequest, NextResponse } from 'next/server';
import { getProductById } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product || product.status === 'Archived') {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (err: unknown) {
    console.error('API /api/products/[id] error:', err);
    return NextResponse.json({ success: false, error: 'Failed to retrieve product' }, { status: 500 });
  }
}
