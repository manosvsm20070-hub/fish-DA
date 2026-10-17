import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifySessionToken } from '@/lib/auth';
import { updateCatalog } from '@/lib/storage';

function adminAuth(req: NextRequest) {
  const token =
    req.cookies.get('admin_session')?.value ||
    req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const verified = verifySessionToken(token);
  if (!verified.valid || verified.role !== 'ADMIN') return null;
  return verified;
}

// PATCH /api/admin/catalogs/[id] — edit catalog
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = adminAuth(req);
  if (!auth) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

  try {
    const { id } = await params;
    const body = await req.json();
    const updates = { ...body };
    delete updates.id;
    delete updates.createdAt;

    const result = await updateCatalog(id, updates);
    if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });

    try { revalidatePath('/', 'layout'); } catch {}

    return NextResponse.json({ success: true, catalog: result.catalog });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/catalogs/[id] — archive catalog
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = adminAuth(req);
  if (!auth) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

  try {
    const { id } = await params;
    const result = await updateCatalog(id, { status: 'Archived' });
    if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });

    try { revalidatePath('/', 'layout'); } catch {}

    return NextResponse.json({ success: true, message: 'Catalog archived.' });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
