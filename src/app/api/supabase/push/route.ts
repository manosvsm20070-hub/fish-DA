import { NextResponse } from 'next/server';
import {
  getSupabaseDbClient,
  mapCatalogToDb,
  mapProductToDb,
  mapOrderToDb,
  mapPriceHistoryToDb,
} from '@/lib/supabase-db';
import {
  getCatalogs,
  getProducts,
  getOrders,
  getPriceHistory,
  getSettings,
} from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const supabase = getSupabaseDbClient();
    if (!supabase) {
      return NextResponse.json(
        {
          success: false,
          error: 'Supabase credentials not configured in environment variables.',
        },
        { status: 500 }
      );
    }

    // 1. Fetch current data
    const [catalogs, products, orders, priceHistory, settings] = await Promise.all([
      getCatalogs(),
      getProducts(),
      getOrders(),
      getPriceHistory(),
      getSettings(),
    ]);

    // 2. Push catalogs
    const catalogRows = catalogs.map(mapCatalogToDb);
    const { error: catError } = await supabase
      .from('catalogs')
      .upsert(catalogRows, { onConflict: 'id' });

    if (catError) {
      return NextResponse.json(
        {
          success: false,
          stage: 'catalogs',
          error: catError.message,
          hint: 'Please ensure you have executed the schema.sql script in your Supabase SQL Editor.',
        },
        { status: 500 }
      );
    }

    // 3. Push products
    const productRows = products.map(mapProductToDb);
    const { error: prodError } = await supabase
      .from('products')
      .upsert(productRows, { onConflict: 'id' });

    if (prodError) {
      return NextResponse.json(
        {
          success: false,
          stage: 'products',
          error: prodError.message,
          hint: 'Please ensure you have executed the schema.sql script in your Supabase SQL Editor.',
        },
        { status: 500 }
      );
    }

    // 4. Push orders
    const orderRows = orders.map(mapOrderToDb);
    const { error: orderError } = await supabase
      .from('orders')
      .upsert(orderRows, { onConflict: 'id' });

    if (orderError) {
      return NextResponse.json(
        {
          success: false,
          stage: 'orders',
          error: orderError.message,
        },
        { status: 500 }
      );
    }

    // 5. Push price history
    const phRows = priceHistory.map(mapPriceHistoryToDb);
    const { error: phError } = await supabase
      .from('price_history')
      .upsert(phRows, { onConflict: 'id' });

    if (phError) {
      return NextResponse.json(
        {
          success: false,
          stage: 'price_history',
          error: phError.message,
        },
        { status: 500 }
      );
    }

    // 6. Push settings
    const { error: setErrors } = await supabase
      .from('settings')
      .upsert({ id: 'default', settings, updated_at: new Date().toISOString() }, { onConflict: 'id' });

    if (setErrors) {
      console.warn('[supabase] Settings sync warning:', setErrors.message);
    }

    return NextResponse.json({
      success: true,
      message: 'All catalogs, products, orders, and price history pushed to Supabase successfully!',
      pushed: {
        catalogs: catalogs.length,
        products: products.length,
        orders: orders.length,
        priceHistory: priceHistory.length,
        settings: 1,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error pushing to Supabase';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
