import { NextRequest, NextResponse } from 'next/server';
import { getPublishedProducts } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const query = searchParams.get('q');

    // Customers only see Published products
    let products = await getPublishedProducts();

    if (category && category !== 'all') {
      const catLower = category.toLowerCase();
      products = products.filter((p) => {
        return (
          p.category.toLowerCase().includes(catLower) ||
          p.subCategory?.toLowerCase().includes(catLower) ||
          p.variety.toLowerCase().includes(catLower)
        );
      });
    }

    if (query) {
      const qLower = query.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(qLower) ||
          p.category.toLowerCase().includes(qLower) ||
          p.variety.toLowerCase().includes(qLower) ||
          p.description.toLowerCase().includes(qLower)
      );
    }

    return NextResponse.json(
      { success: true, count: products.length, products },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (err: unknown) {
    console.error('API /api/products error:', err);
    return NextResponse.json({ success: false, error: 'Failed to retrieve products' }, { status: 500 });
  }
}
