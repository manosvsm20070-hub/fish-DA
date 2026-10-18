import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifySessionToken } from '@/lib/auth';
import { getProducts, createProduct, deleteAllProducts } from '@/lib/storage';
import { Product } from '@/types';

function adminAuth(req: NextRequest) {
  const token =
    req.cookies.get('admin_session')?.value ||
    req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const verified = verifySessionToken(token);
  if (!verified.valid || verified.role !== 'ADMIN') return null;
  return verified;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/admin/products — list all products for admin (all statuses)
export async function GET(req: NextRequest) {
  const auth = adminAuth(req);
  if (!auth) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

  try {
    const products = await getProducts();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    let filtered = products;
    if (status) filtered = filtered.filter((p) => p.status === status);
    if (category && category !== 'all') {
      filtered = filtered.filter((p) => p.category.toLowerCase().includes(category.toLowerCase()));
    }

    return NextResponse.json(
      { success: true, count: filtered.length, products: filtered },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to load products' }, { status: 500 });
  }
}

// POST /api/admin/products — create a new product
export async function POST(req: NextRequest) {
  const auth = adminAuth(req);
  if (!auth) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();

    // Required field validation
    if (!body.name?.trim()) return NextResponse.json({ success: false, error: 'Product name is required' }, { status: 400 });

    const isLiveFish = body.isLiveFish === true || body.isLiveFish === 'true';
    const category = body.category?.trim() || 'Fish';
    
    // Default price to numeric value or 0
    const priceVal =
      body.price !== undefined && body.price !== '' && !isNaN(Number(body.price))
        ? Number(body.price)
        : 0;

    const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const uniqueId = body.id || `prod-${slug}-${Date.now()}`;

    const newProduct: Omit<Product, 'createdAt' | 'updatedAt'> = {
      id: uniqueId,
      name: body.name.trim(),
      category,
      subCategory: body.subCategory?.trim() || '',
      variety: body.variety?.trim() || '',
      gender: body.gender || 'Unsexed',
      images: Array.isArray(body.images) ? body.images : (body.primaryImage ? [body.primaryImage] : []),
      primaryImage: body.primaryImage || (Array.isArray(body.images) ? body.images[0] : '') || '',
      price: priceVal,
      originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
      currency: '₹',
      sizes: Array.isArray(body.sizes) ? body.sizes : (body.sizes ? [body.sizes] : ['Standard']),
      stock: Number(body.stock) >= 0 ? Number(body.stock) : 10,
      availability: body.availability || 'in_stock',
      description: body.description?.trim() || '',
      isLiveFish,
      featured: body.featured === true || body.featured === 'true',
      status: body.status || 'Published',
      tags: Array.isArray(body.tags) ? body.tags : [],
      waterParams: body.waterParams || undefined,
      specs: body.specs || undefined,
    };

    const result = await createProduct(newProduct);
    if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/', 'page');
      revalidatePath('/fish', 'page');
      revalidatePath('/fish/[category]', 'page');
      revalidatePath('/tanks', 'page');
    } catch {}

    return NextResponse.json({ success: true, product: result.product }, { status: 201 });
  } catch (err: unknown) {
    console.error('POST /api/admin/products error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/products — delete all products
export async function DELETE(req: NextRequest) {
  const auth = adminAuth(req);
  if (!auth) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

  try {
    const result = await deleteAllProducts();
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/', 'page');
      revalidatePath('/fish', 'page');
      revalidatePath('/fish/[category]', 'page');
      revalidatePath('/tanks', 'page');
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Successfully deleted all products (${result.count} removed).`,
      count: result.count,
    });
  } catch (err: unknown) {
    console.error('DELETE /api/admin/products error:', err);
    return NextResponse.json({ success: false, error: 'Failed to delete all products' }, { status: 500 });
  }
}
