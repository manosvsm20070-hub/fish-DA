import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { updateOrderStatus } from '@/lib/storage';

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

// PATCH /api/admin/orders/[orderNumber] — update order status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const token =
    req.cookies.get('admin_session')?.value ||
    req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

  const verified = verifySessionToken(token);
  if (!verified.valid || verified.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { orderNumber } = await params;
    const { status } = await req.json();

    if (!ORDER_STATUSES.includes(status)) {
      return NextResponse.json({ success: false, error: `Invalid status. Must be one of: ${ORDER_STATUSES.join(', ')}` }, { status: 400 });
    }

    const result = await updateOrderStatus(orderNumber, status);
    if (!result.success) return NextResponse.json({ success: false, error: result.error }, { status: 400 });

    return NextResponse.json({ success: true, message: `Order ${orderNumber} status updated to ${status}` });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
