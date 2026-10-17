import fs from 'fs';
import path from 'path';
import { Product, Order, PriceHistory, Catalog, ProductStatus, OrderStatus, SiteSettings } from '@/types';
import { INITIAL_PRODUCTS, SHOP_INFO } from '@/data/products';

const DATA_DIR = path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const PRICE_HISTORY_FILE = path.join(DATA_DIR, 'price_history.json');
const CATALOGS_FILE = path.join(DATA_DIR, 'catalogs.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

export const DEFAULT_SETTINGS: SiteSettings = {
  adminPassword: process.env.ADMIN_PASSWORD || 'bestfish',
  theme: {
    preset: 'ocean-teal',
    primaryColor: '#006572',
    accentColor: '#cc4729',
    darkMode: false,
  },
  customerInterface: {
    storeName: SHOP_INFO.name,
    tagline: SHOP_INFO.tagline,
    announcement: {
      enabled: true,
      text: '🌊 Direct live fish transit & delivery across Sothupakkam & Chengalpattu region. Free delivery on orders over ₹1,500!',
      linkText: 'Shop Fish Now',
      linkUrl: '/fish',
    },
    hero: {
      headline: SHOP_INFO.name,
      subtitle: 'Freshwater Livestock, Custom Rimless Tanks & Aquatic Equipment',
      bannerImage: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=1600&q=80',
      quarantineBadgeText: 'Quarantine Certified',
      ratingBadgeText: '4.9 (Live Stock)',
      highlightNotice: '100% Healthy Quarantine Assured. Direct Tank Delivery across Sothupakkam & Chengalpattu region.',
    },
    contact: {
      address: SHOP_INFO.address,
      phoneDisplay: SHOP_INFO.phoneDisplay,
      phoneDial: SHOP_INFO.phoneDial,
      whatsappNumber: SHOP_INFO.whatsappNumber,
      openHours: SHOP_INFO.openHours,
    },
  },
};

// Default catalog list seeded from existing categories
const DEFAULT_CATALOGS: Catalog[] = [
  { id: 'cat-fish', name: 'Fish', slug: 'fish', description: 'Live freshwater fish — goldfish, betta, guppies, sharks and more', displayOrder: 1, status: 'Active', createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z' },
  { id: 'cat-goldfish', name: 'Goldfish', slug: 'goldfish', description: 'Fancy goldfish varieties', displayOrder: 2, status: 'Active', createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z' },
  { id: 'cat-betta', name: 'Betta Fish', slug: 'betta', description: 'Show betta fish varieties', displayOrder: 3, status: 'Active', createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z' },
  { id: 'cat-guppy', name: 'Guppy', slug: 'guppy', description: 'Breeder guppies and endlers', displayOrder: 4, status: 'Active', createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z' },
  { id: 'cat-molly', name: 'Molly', slug: 'molly', description: 'Mollies and livebearers', displayOrder: 5, status: 'Active', createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z' },
  { id: 'cat-flowerhorn', name: 'Flowerhorn', slug: 'flowerhorn', description: 'King Kamfa and Flowerhorn cichlids', displayOrder: 6, status: 'Active', createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z' },
  { id: 'cat-sharks', name: 'Aquarium Sharks', slug: 'sharks', description: 'Freshwater aquarium sharks', displayOrder: 7, status: 'Active', createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z' },
  { id: 'cat-monster', name: 'Monster Fish', slug: 'monster-fish', description: 'Monster fish and gars', displayOrder: 8, status: 'Active', createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z' },
  { id: 'cat-catfish', name: 'Catfish', slug: 'catfish', description: 'Monster catfish varieties', displayOrder: 9, status: 'Active', createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z' },
  { id: 'cat-danio', name: 'Zebra Danio', slug: 'zebra-danio', description: 'Zebra danio and GloFish', displayOrder: 10, status: 'Active', createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z' },
  { id: 'cat-tanks', name: 'Aquarium Tanks', slug: 'tanks', description: 'Standard and rimless aquarium tanks', displayOrder: 11, status: 'Active', createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z' },
  { id: 'cat-custom-tanks', name: 'Custom Tanks', slug: 'custom-tanks', description: 'Custom-built rimless aquarium tanks', displayOrder: 12, status: 'Active', createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z' },
  { id: 'cat-motors', name: 'Motors & Pumps', slug: 'motors', description: 'Aquarium motors and water pumps', displayOrder: 13, status: 'Active', createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z' },
  { id: 'cat-filters', name: 'Filters', slug: 'filters', description: 'Aquarium filtration systems', displayOrder: 14, status: 'Active', createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z' },
  { id: 'cat-medicines', name: 'Fish Medicines', slug: 'medicines', description: 'Fish medicines and water conditioners', displayOrder: 15, status: 'Active', createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z' },
  { id: 'cat-food', name: 'Fish Food', slug: 'food', description: 'Premium fish food and feeding supplies', displayOrder: 16, status: 'Active', createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z' },
  { id: 'cat-stones', name: 'Aquarium Stones', slug: 'stones', description: 'Decorative aquarium stones and rocks', displayOrder: 17, status: 'Active', createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z' },
  { id: 'cat-gravel', name: 'Colored Gravel', slug: 'gravel', description: 'Colored aquarium gravel and substrate', displayOrder: 18, status: 'Active', createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z' },
  { id: 'cat-bowls', name: 'Aquarium Bowls', slug: 'bowls', description: 'Decorative aquarium bowls and small tanks', displayOrder: 19, status: 'Active', createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z' },
  { id: 'cat-nets', name: 'Aquarium Nets', slug: 'nets', description: 'Fish catching and cleaning nets', displayOrder: 20, status: 'Active', createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z' },
  { id: 'cat-plants', name: 'Aquarium Plants', slug: 'plants', description: 'Live and artificial aquarium plants', displayOrder: 21, status: 'Active', createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z' },
  { id: 'cat-decorations', name: 'Decorations', slug: 'decorations', description: 'Aquarium decorations and ornaments', displayOrder: 22, status: 'Active', createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z' },
  { id: 'cat-accessories', name: 'Accessories', slug: 'accessories', description: 'Aquarium accessories and tools', displayOrder: 23, status: 'Active', createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z' },
];

// Ensure data directory and files exist
function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(PRODUCTS_FILE)) {
    // Seed initial products with Published status
    const seeded = INITIAL_PRODUCTS.map((p) => ({ ...p, status: 'Published' as ProductStatus }));
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(seeded, null, 2), 'utf-8');
  }

  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }

  if (!fs.existsSync(PRICE_HISTORY_FILE)) {
    fs.writeFileSync(PRICE_HISTORY_FILE, JSON.stringify([], null, 2), 'utf-8');
  }

  if (!fs.existsSync(CATALOGS_FILE)) {
    fs.writeFileSync(CATALOGS_FILE, JSON.stringify(DEFAULT_CATALOGS, null, 2), 'utf-8');
  }

  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8');
  }
}

// ======================== CATALOG OPERATIONS ========================

export async function getCatalogs(): Promise<Catalog[]> {
  try {
    ensureDataFiles();
    const data = fs.readFileSync(CATALOGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed reading catalogs:', err);
    return DEFAULT_CATALOGS;
  }
}

export async function getActiveCatalogs(): Promise<Catalog[]> {
  const all = await getCatalogs();
  return all.filter((c) => c.status === 'Active').sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function createCatalog(catalog: Omit<Catalog, 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; catalog?: Catalog; error?: string }> {
  try {
    ensureDataFiles();
    const catalogs = await getCatalogs();
    const now = new Date().toISOString();

    if (catalogs.some((c) => c.slug === catalog.slug)) {
      return { success: false, error: 'A catalog with this slug already exists' };
    }

    const newCatalog: Catalog = { ...catalog, createdAt: now, updatedAt: now };
    catalogs.push(newCatalog);
    fs.writeFileSync(CATALOGS_FILE, JSON.stringify(catalogs, null, 2), 'utf-8');
    return { success: true, catalog: newCatalog };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to create catalog';
    return { success: false, error: errorMsg };
  }
}

export async function updateCatalog(id: string, updates: Partial<Omit<Catalog, 'id' | 'createdAt'>>): Promise<{ success: boolean; catalog?: Catalog; error?: string }> {
  try {
    ensureDataFiles();
    const catalogs = await getCatalogs();
    const index = catalogs.findIndex((c) => c.id === id);
    if (index === -1) return { success: false, error: 'Catalog not found' };

    catalogs[index] = { ...catalogs[index], ...updates, updatedAt: new Date().toISOString() };
    fs.writeFileSync(CATALOGS_FILE, JSON.stringify(catalogs, null, 2), 'utf-8');
    return { success: true, catalog: catalogs[index] };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to update catalog';
    return { success: false, error: errorMsg };
  }
}

// ======================== PRODUCT OPERATIONS ========================

export async function getProducts(): Promise<Product[]> {
  try {
    ensureDataFiles();
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    const products: Product[] = JSON.parse(data);
    // Backfill status for old products that don't have it
    return products.map((p) => ({ ...p, status: p.status || 'Published' }));
  } catch (err) {
    console.error('Failed reading products file, returning initial products:', err);
    return INITIAL_PRODUCTS.map((p) => ({ ...p, status: 'Published' as ProductStatus }));
  }
}

export async function getPublishedProducts(): Promise<Product[]> {
  const all = await getProducts();
  return all.filter((p) => p.status === 'Published');
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.id === id) || null;
}

// Full product create (Admin CMS)
export async function createProduct(product: Omit<Product, 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; product?: Product; error?: string }> {
  try {
    ensureDataFiles();
    const products = await getProducts();

    if (products.some((p) => p.id === product.id)) {
      return { success: false, error: 'Product with this ID already exists' };
    }

    const now = new Date().toISOString();
    const newProduct: Product = { ...product, createdAt: now, updatedAt: now };
    products.push(newProduct);
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
    return { success: true, product: newProduct };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to create product';
    return { success: false, error: errorMsg };
  }
}

// Full product update (Admin CMS) — all fields except id/createdAt
export async function updateProductFull(
  id: string,
  updates: Partial<Omit<Product, 'id' | 'createdAt'>>,
  adminId: string = '+917845637566'
): Promise<{ success: boolean; product?: Product; error?: string }> {
  try {
    ensureDataFiles();
    const products = await getProducts();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) return { success: false, error: 'Product not found' };

    const currentProduct = products[index];
    const now = new Date().toISOString();

    // Audit price changes
    if (typeof updates.price === 'number' && updates.price !== currentProduct.price) {
      try {
        const history: PriceHistory[] = JSON.parse(
          fs.readFileSync(PRICE_HISTORY_FILE, 'utf-8') || '[]'
        );
        history.push({
          id: `ph_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          productId: id,
          oldPrice: currentProduct.price,
          newPrice: updates.price,
          changedAt: now,
          adminId,
        });
        fs.writeFileSync(PRICE_HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
      } catch {}
    }

    products[index] = { ...currentProduct, ...updates, id, createdAt: currentProduct.createdAt, updatedAt: now };
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
    return { success: true, product: products[index] };
  } catch (err: unknown) {
    console.error('Failed to update product:', err);
    const errorMsg = err instanceof Error ? err.message : 'Database update failed';
    return { success: false, error: errorMsg };
  }
}

// Legacy restricted admin update (price + images only) — kept for backward compat
export async function updateProductAdmin(
  id: string,
  updates: { price?: number; images?: string[]; primaryImage?: string },
  adminId: string = '+917845637566'
): Promise<{ success: boolean; product?: Product; error?: string }> {
  return updateProductFull(id, updates, adminId);
}

// Archive a product
export async function archiveProduct(id: string): Promise<{ success: boolean; error?: string }> {
  const result = await updateProductFull(id, { status: 'Archived' });
  return { success: result.success, error: result.error };
}

// ======================== ORDER OPERATIONS ========================

export async function getOrders(): Promise<Order[]> {
  try {
    ensureDataFiles();
    const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed reading orders file:', err);
    return [];
  }
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const orders = await getOrders();
  return orders.find((o) => o.orderNumber === orderNumber) || null;
}

export async function createOrder(order: Order): Promise<{ success: boolean; order?: Order; error?: string }> {
  try {
    ensureDataFiles();
    const orders = await getOrders();

    if (orders.some((o) => o.id === order.id || o.orderNumber === order.orderNumber)) {
      return { success: false, error: 'Order already exists' };
    }

    orders.unshift(order);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
    return { success: true, order };
  } catch (err: unknown) {
    console.error('Failed creating order:', err);
    const errorMsg = err instanceof Error ? err.message : 'Failed to save order';
    return { success: false, error: errorMsg };
  }
}

export async function updateOrderStatus(orderNumber: string, status: string): Promise<{ success: boolean; error?: string }> {
  try {
    ensureDataFiles();
    const orders = await getOrders();
    const index = orders.findIndex((o) => o.orderNumber === orderNumber);
    if (index === -1) return { success: false, error: 'Order not found' };
    orders[index] = { ...orders[index], status: status as OrderStatus, updatedAt: new Date().toISOString() };
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to update order status';
    return { success: false, error: errorMsg };
  }
}

export async function updateOrderNotificationStatus(
  orderNumber: string,
  status: { emailSent?: boolean; whatsappSent?: boolean }
) {
  try {
    ensureDataFiles();
    const orders = await getOrders();
    const index = orders.findIndex((o) => o.orderNumber === orderNumber);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...status, updatedAt: new Date().toISOString() };
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Failed to update order notification status:', err);
  }
}

// ======================== SETTINGS & THEME OPERATIONS ========================

export async function getSettings(): Promise<SiteSettings> {
  try {
    ensureDataFiles();
    const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      theme: { ...DEFAULT_SETTINGS.theme, ...(parsed.theme || {}) },
      customerInterface: {
        ...DEFAULT_SETTINGS.customerInterface,
        ...(parsed.customerInterface || {}),
        announcement: {
          ...DEFAULT_SETTINGS.customerInterface.announcement,
          ...(parsed.customerInterface?.announcement || {}),
        },
        hero: {
          ...DEFAULT_SETTINGS.customerInterface.hero,
          ...(parsed.customerInterface?.hero || {}),
        },
        contact: {
          ...DEFAULT_SETTINGS.customerInterface.contact,
          ...(parsed.customerInterface?.contact || {}),
        },
      },
    };
  } catch (err) {
    console.error('Failed reading settings file, returning defaults:', err);
    return DEFAULT_SETTINGS;
  }
}

export async function updateSettings(
  updates: Partial<SiteSettings>
): Promise<{ success: boolean; settings?: SiteSettings; error?: string }> {
  try {
    ensureDataFiles();
    const current = await getSettings();
    const next: SiteSettings = {
      ...current,
      ...updates,
      theme: { ...current.theme, ...(updates.theme || {}) },
      customerInterface: {
        ...current.customerInterface,
        ...(updates.customerInterface || {}),
        announcement: {
          ...current.customerInterface.announcement,
          ...(updates.customerInterface?.announcement || {}),
        },
        hero: {
          ...current.customerInterface.hero,
          ...(updates.customerInterface?.hero || {}),
        },
        contact: {
          ...current.customerInterface.contact,
          ...(updates.customerInterface?.contact || {}),
        },
      },
    };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(next, null, 2), 'utf-8');
    return { success: true, settings: next };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to update settings';
    return { success: false, error: errorMsg };
  }
}

export async function getAdminPassword(): Promise<string> {
  const settings = await getSettings();
  return settings.adminPassword || process.env.ADMIN_PASSWORD || 'bestfish';
}

export async function updateAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    ensureDataFiles();
    const existing = await getAdminPassword();
    if (currentPassword !== existing) {
      return { success: false, error: 'Current password is incorrect.' };
    }
    if (!newPassword || newPassword.trim().length < 4) {
      return { success: false, error: 'New password must be at least 4 characters long.' };
    }
    const current = await getSettings();
    current.adminPassword = newPassword.trim();
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(current, null, 2), 'utf-8');
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to update password';
    return { success: false, error: errorMsg };
  }
}
