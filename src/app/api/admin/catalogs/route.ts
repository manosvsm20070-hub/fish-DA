import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifySessionToken } from '@/lib/auth';
import { getCatalogs, createCatalog } from '@/lib/storage';

function adminAuth(req: NextRequest) {
  const token =
    req.cookies.get('admin_session')?.value ||
    req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const verified = verifySessionToken(token);
  if (!verified.valid || verified.role !== 'ADMIN') return null;
  return verified;
}

// GET /api/admin/catalogs — list all catalogs (admin sees all including archived)
export async function GET(req: NextRequest) {
  const auth = adminAuth(req);
  if (!auth) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

  try {
    const catalogs = await getCatalogs();
    return NextResponse.json({ success: true, catalogs });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to load catalogs' }, { status: 500 });
  }
}

// POST /api/admin/catalogs — create a new catalog
export async function POST(req: NextRequest) {
  const auth = adminAuth(req);
  if (!auth) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();

    if (!body.name?.trim()) {
      return NextResponse.json({ success: false, error: 'Catalog name is required' }, { status: 400 });
    }

    const slug = (body.slug || body.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const catalogs = await getCatalogs();
    const maxOrder = catalogs.reduce((m, c) => Math.max(m, c.displayOrder), 0);

    const result = await createCatalog({
      id: `cat-${slug}-${Date.now()}`,
      name: body.name.trim(),
      slug,
      description: body.description?.trim() || '',
      image: body.image || undefined,
      displayOrder: body.displayOrder || maxOrder + 1,
      status: 'Active',
    });

    if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });

    try { revalidatePath('/', 'layout'); } catch {}

    return NextResponse.json({ success: true, catalog: result.catalog }, { status: 201 });
  } catch (err: unknown) {
    console.error('POST /api/admin/catalogs error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
