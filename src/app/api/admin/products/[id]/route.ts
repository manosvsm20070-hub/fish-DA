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

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// PATCH /api/admin/products/[id] — update any product fields (full CMS)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = adminAuth(req);
  if (!auth) return NextResponse.json({ success: false, error: 'Forbidden: Admin privilege required' }, { status: 403 });

  try {
    const rawId = (await params).id;
    const cleanId = decodeURIComponent(rawId).trim();
    const body = await req.json();

    // Strip server-only immutable fields — everything else is editable by admin
    const updates = { ...body };
    delete updates.id;
    delete updates.createdAt;

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

    const result = await updateProductFull(cleanId, updates, auth.phone);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/');
      revalidatePath('/fish');
      revalidatePath('/tanks');
      revalidatePath('/medicines');
      revalidatePath('/bowls');
      revalidatePath('/food');
      revalidatePath('/equipment');
      revalidatePath(`/product/${cleanId}`);
    } catch {}

    return NextResponse.json(
      { success: true, message: 'Product updated successfully.', product: result.product },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (err: unknown) {
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
    const rawId = (await params).id;
    const cleanId = decodeURIComponent(rawId).trim();
    const result = await archiveProduct(cleanId);
    if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/fish');
      revalidatePath('/tanks');
    } catch {}

    return NextResponse.json({ success: true, message: 'Product archived.' });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
