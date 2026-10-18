import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Catalog, Order, PriceHistory, SiteSettings } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let dbClientInstance: SupabaseClient | null = null;

export function getSupabaseDbClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseKey) return null;
  if (!dbClientInstance) {
    dbClientInstance = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
  }
  return dbClientInstance;
}

// ======================== MAPPERS ========================

export function mapCatalogFromDb(row: Record<string, any>): Catalog {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    image: row.image || undefined,
    displayOrder: typeof row.display_order === 'number' ? row.display_order : 0,
    status: row.status === 'Archived' ? 'Archived' : 'Active',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCatalogToDb(c: Partial<Catalog>): Record<string, any> {
  const row: Record<string, any> = {};
  if (c.id !== undefined) row.id = c.id;
  if (c.name !== undefined) row.name = c.name;
  if (c.slug !== undefined) row.slug = c.slug;
  if (c.description !== undefined) row.description = c.description;
  if (c.image !== undefined) row.image = c.image;
  if (c.displayOrder !== undefined) row.display_order = c.displayOrder;
  if (c.status !== undefined) row.status = c.status;
  if (c.createdAt !== undefined) row.created_at = c.createdAt;
  if (c.updatedAt !== undefined) row.updated_at = c.updatedAt;
  return row;
}

export function mapProductFromDb(row: Record<string, any>): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    subCategory: row.sub_category || '',
    variety: row.variety || '',
    gender: row.gender || 'Unsexed',
    images: Array.isArray(row.images) ? row.images : [],
    primaryImage: row.primary_image || '',
    price: row.price != null ? Number(row.price) : 0,
    originalPrice: row.original_price != null ? Number(row.original_price) : undefined,
    currency: row.currency || '₹',
    sizes: Array.isArray(row.sizes) ? row.sizes : [],
    stock: typeof row.stock === 'number' ? row.stock : 0,
    availability: row.availability || 'in_stock',
    description: row.description || '',
    waterParams: row.water_params || undefined,
    isLiveFish: row.is_live_fish ?? true,
    featured: Boolean(row.featured),
    specs: row.specs || undefined,
    status: row.status || 'Published',
    tags: Array.isArray(row.tags) ? row.tags : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapProductToDb(p: Partial<Product>): Record<string, any> {
  const row: Record<string, any> = {};
  if (p.id !== undefined) row.id = p.id;
  if (p.name !== undefined) row.name = p.name;
  if (p.category !== undefined) row.category = p.category;
  if (p.subCategory !== undefined) row.sub_category = p.subCategory;
  if (p.variety !== undefined) row.variety = p.variety;
  if (p.gender !== undefined) row.gender = p.gender;
  if (p.images !== undefined) row.images = p.images;
  if (p.primaryImage !== undefined) row.primary_image = p.primaryImage;
  if (p.price !== undefined) row.price = p.price;
  if (p.originalPrice !== undefined) row.original_price = p.originalPrice;
  if (p.currency !== undefined) row.currency = p.currency;
  if (p.sizes !== undefined) row.sizes = p.sizes;
  if (p.stock !== undefined) row.stock = p.stock;
  if (p.availability !== undefined) row.availability = p.availability;
  if (p.description !== undefined) row.description = p.description;
  if (p.waterParams !== undefined) row.water_params = p.waterParams;
  if (p.isLiveFish !== undefined) row.is_live_fish = p.isLiveFish;
  if (p.featured !== undefined) row.featured = p.featured;
  if (p.specs !== undefined) row.specs = p.specs;
  if (p.status !== undefined) row.status = p.status;
  if (p.tags !== undefined) row.tags = p.tags;
  if (p.createdAt !== undefined) row.created_at = p.createdAt;
  if (p.updatedAt !== undefined) row.updated_at = p.updatedAt;
  return row;
}

export function mapOrderFromDb(row: Record<string, any>): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerId: row.customer_id || undefined,
    customerName: row.customer_name,
    house: row.house || '',
    city: row.city || '',
    district: row.district || '',
    state: row.state || '',
    pinCode: row.pin_code || '',
    phoneNumber: row.phone_number,
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal) || 0,
    deliveryCharge: Number(row.delivery_charge) || 0,
    total: Number(row.total) || 0,
    grandTotal: Number(row.grand_total) || Number(row.total) || 0,
    status: row.status || 'Pending',
    paymentStatus: row.payment_status || 'Pending',
    notes: row.notes || undefined,
    emailSent: Boolean(row.email_sent),
    whatsappSent: Boolean(row.whatsapp_sent),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapOrderToDb(o: Partial<Order>): Record<string, any> {
  const row: Record<string, any> = {};
  if (o.id !== undefined) row.id = o.id;
  if (o.orderNumber !== undefined) row.order_number = o.orderNumber;
  if (o.customerId !== undefined) row.customer_id = o.customerId;
  if (o.customerName !== undefined) row.customer_name = o.customerName;
  if (o.house !== undefined) row.house = o.house;
  if (o.city !== undefined) row.city = o.city;
  if (o.district !== undefined) row.district = o.district;
  if (o.state !== undefined) row.state = o.state;
  if (o.pinCode !== undefined) row.pin_code = o.pinCode;
  if (o.phoneNumber !== undefined) row.phone_number = o.phoneNumber;
  if (o.items !== undefined) row.items = o.items;
  if (o.subtotal !== undefined) row.subtotal = o.subtotal;
  if (o.deliveryCharge !== undefined) row.delivery_charge = o.deliveryCharge;
  if (o.total !== undefined) row.total = o.total;
  if (o.grandTotal !== undefined) row.grand_total = o.grandTotal;
  if (o.status !== undefined) row.status = o.status;
  if (o.paymentStatus !== undefined) row.payment_status = o.paymentStatus;
  if (o.notes !== undefined) row.notes = o.notes;
  if (o.emailSent !== undefined) row.email_sent = o.emailSent;
  if (o.whatsappSent !== undefined) row.whatsapp_sent = o.whatsappSent;
  if (o.createdAt !== undefined) row.created_at = o.createdAt;
  if (o.updatedAt !== undefined) row.updated_at = o.updatedAt;
  return row;
}

export function mapPriceHistoryFromDb(row: Record<string, any>): PriceHistory {
  return {
    id: row.id,
    productId: row.product_id,
    oldPrice: Number(row.old_price) || 0,
    newPrice: Number(row.new_price) || 0,
    changedAt: row.changed_at,
    adminId: row.admin_id || '',
  };
}

export function mapPriceHistoryToDb(ph: Partial<PriceHistory>): Record<string, any> {
  const row: Record<string, any> = {};
  if (ph.id !== undefined) row.id = ph.id;
  if (ph.productId !== undefined) row.product_id = ph.productId;
  if (ph.oldPrice !== undefined) row.old_price = ph.oldPrice;
  if (ph.newPrice !== undefined) row.new_price = ph.newPrice;
  if (ph.changedAt !== undefined) row.changed_at = ph.changedAt;
  if (ph.adminId !== undefined) row.admin_id = ph.adminId;
  return row;
}
