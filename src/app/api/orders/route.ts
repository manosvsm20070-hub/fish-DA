import { NextRequest, NextResponse } from 'next/server';
import { normalizePhoneNumber } from '@/lib/auth';
import { getProducts, createOrder } from '@/lib/storage';
import { sendOrderNotifications } from '@/lib/notifications';
import { Order, OrderItem } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerDetails, items } = body;

    // 1. Validate customer details
    if (!customerDetails) {
      return NextResponse.json(
        { success: false, error: 'Delivery details are required.' },
        { status: 400 }
      );
    }

    const { name, house, city, district, state, pinCode, phoneNumber } = customerDetails;

    if (!name?.trim()) return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    if (!house?.trim()) return NextResponse.json({ success: false, error: 'House/Street address is required' }, { status: 400 });
    if (!city?.trim()) return NextResponse.json({ success: false, error: 'City is required' }, { status: 400 });
    if (!district?.trim()) return NextResponse.json({ success: false, error: 'District is required' }, { status: 400 });
    if (!state?.trim()) return NextResponse.json({ success: false, error: 'State is required' }, { status: 400 });

    // Validate phone number
    if (!phoneNumber?.trim()) {
      return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 });
    }
    const phoneNorm = normalizePhoneNumber(phoneNumber);
    if (!phoneNorm.valid) {
      return NextResponse.json({ success: false, error: phoneNorm.error || 'Please enter a valid mobile number' }, { status: 400 });
    }

    // Validate 6-digit Indian PIN code
    if (!pinCode || !/^\d{6}$/.test(pinCode.trim())) {
      return NextResponse.json({ success: false, error: 'Please enter a valid 6-digit Indian PIN code' }, { status: 400 });
    }

    // 2. Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Your cart is empty.' }, { status: 400 });
    }

    // 4. Server-Side Recalculation from active Product Database
    const allProducts = await getProducts();
    const verifiedOrderItems: OrderItem[] = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const dbProduct = allProducts.find((p) => p.id === item.productId);
      if (!dbProduct) {
        return NextResponse.json(
          { success: false, error: `Product "${item.productName || item.productId}" is no longer available.` },
          { status: 400 }
        );
      }

      if (dbProduct.availability === 'out_of_stock' || dbProduct.stock <= 0) {
        return NextResponse.json(
          { success: false, error: `${dbProduct.name} is currently out of stock. Please remove it from your cart.` },
          { status: 400 }
        );
      }

      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const activePrice = dbProduct.price; // Use authoritative server price
      const itemSubtotal = activePrice * qty;

      calculatedSubtotal += itemSubtotal;

      verifiedOrderItems.push({
        productId: dbProduct.id,
        productName: dbProduct.name,
        variety: item.variety || dbProduct.variety,
        size: item.selectedSize || item.size || (dbProduct.sizes[0] || 'Standard'),
        quantity: qty,
        unitPrice: activePrice,
        price: activePrice,
        subtotal: itemSubtotal,
        image: dbProduct.primaryImage,
      });
    }

    // Delivery charge calculation (Free for orders >= ₹1500, else ₹100)
    const deliveryCharge = calculatedSubtotal >= 1500 ? 0 : 100;
    const grandTotal = calculatedSubtotal + deliveryCharge;

    // 5. Generate unique human-readable order number: AQ-YYYYMMDD-XXXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `AQ-${dateStr}-${randomSuffix}`;
    const orderId = `ord_${Date.now()}_${randomSuffix}`;

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerName: name.trim(),
      house: house.trim(),
      city: city.trim(),
      district: district.trim(),
      state: state.trim(),
      pinCode: pinCode.trim(),
      phoneNumber: phoneNorm.normalized,
      items: verifiedOrderItems,
      subtotal: calculatedSubtotal,
      deliveryCharge,
      total: grandTotal,
      grandTotal,
      status: 'Pending',
      paymentStatus: 'Pending',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    // 6. Store order in server database first
    const saveResult = await createOrder(newOrder);
    if (!saveResult.success) {
      return NextResponse.json({ success: false, error: saveResult.error }, { status: 500 });
    }

    // 7. Dispatch Admin Notifications in the background
    // Notification failure does NOT delete or reject the placed order!
    sendOrderNotifications(newOrder).catch((err) => {
      console.error('Asynchronous order notification error:', err);
    });

    return NextResponse.json({
      success: true,
      orderNumber: newOrder.orderNumber,
      order: newOrder,
    });
  } catch (err: unknown) {
    console.error('API /api/orders error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error while processing order' }, { status: 500 });
  }
}
