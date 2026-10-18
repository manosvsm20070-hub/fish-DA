import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifySessionToken } from '@/lib/auth';
import { getOrders, deleteAllOrders } from '@/lib/storage';

function adminAuth(req: NextRequest) {
  const token =
    req.cookies.get('admin_session')?.value ||
    req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const verified = verifySessionToken(token);
  if (!verified.valid || verified.role !== 'ADMIN') return null;
  return verified;
}

// GET /api/admin/orders — list all orders
export async function GET(req: NextRequest) {
  const auth = adminAuth(req);
  if (!auth) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

  try {
    const orders = await getOrders();
    return NextResponse.json({ success: true, count: orders.length, orders });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to load orders' }, { status: 500 });
  }
}

// DELETE /api/admin/orders — delete all orders
export async function DELETE(req: NextRequest) {
  const auth = adminAuth(req);
  if (!auth) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

  try {
    const result = await deleteAllOrders();
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    try {
      revalidatePath('/admin', 'page');
      revalidatePath('/admin/dashboard', 'page');
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Successfully deleted all orders (${result.count} removed).`,
      count: result.count,
    });
  } catch (err: unknown) {
    console.error('DELETE /api/admin/orders error:', err);
    return NextResponse.json({ success: false, error: 'Failed to delete orders' }, { status: 500 });
  }
}
