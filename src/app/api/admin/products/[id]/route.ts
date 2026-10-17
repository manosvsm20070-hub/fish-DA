import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifySessionToken } from '@/lib/auth';
import { updateProductFull, archiveProduct } from '@/lib/storage';

function adminAuth(req: NextRequest) {
  const token =
    req.cookies.get('admin_session')?.value ||
    req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const verified = verifySessionToken(token);
  if (!verified.valid || verified.role !== 'ADMIN') return null;
  return verified;
}

// PATCH /api/admin/products/[id] — update any product fields (full CMS)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = adminAuth(req);
  if (!auth) return NextResponse.json({ success: false, error: 'Forbidden: Admin privilege required' }, { status: 403 });

  try {
    const { id } = await params;
    const body = await req.json();

    // Strip server-only immutable fields — everything else is editable by admin
    const { id: _id, createdAt: _c, ...updates } = body;

    // Validate price if present
    if (updates.price !== undefined) {
      const numPrice = Number(updates.price);
      if (isNaN(numPrice) || numPrice < 0) {
        return NextResponse.json({ success: false, error: 'Price must be a valid non-negative number' }, { status: 400 });
      }
      updates.price = numPrice;
    }

    // Validate images
    if (updates.images !== undefined && !Array.isArray(updates.images)) {
      return NextResponse.json({ success: false, error: 'Images must be an array' }, { status: 400 });
    }

    const result = await updateProductFull(id, updates, auth.phone);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/fish');
      revalidatePath('/tanks');
      revalidatePath(`/product/${id}`);
    } catch {}

    return NextResponse.json({ success: true, message: 'Product updated successfully.', product: result.product });
  } catch (err: any) {
    console.error('PATCH /api/admin/products/[id] error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id] — archive a product
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = adminAuth(req);
  if (!auth) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

  try {
    const { id } = await params;
    const result = await archiveProduct(id);
    if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/fish');
      revalidatePath('/tanks');
    } catch {}

    return NextResponse.json({ success: true, message: 'Product archived.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
