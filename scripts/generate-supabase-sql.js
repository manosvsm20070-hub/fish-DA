const fs = require('fs');
const path = require('path');

function sqlEscapeString(val) {
  if (val === null || val === undefined) return 'NULL';
  const str = String(val);
  return `'${str.replace(/'/g, "''")}'`;
}

function sqlEscapeJson(val) {
  if (val === null || val === undefined) return 'NULL';
  const jsonStr = JSON.stringify(val);
  return `'${jsonStr.replace(/'/g, "''")}'::jsonb`;
}

function sqlEscapeNumber(val) {
  if (val === null || val === undefined || isNaN(Number(val))) return 'NULL';
  return Number(val);
}

function sqlEscapeBool(val) {
  if (val === null || val === undefined) return 'NULL';
  return val ? 'TRUE' : 'FALSE';
}

function sqlEscapeTimestamp(val) {
  if (!val) return 'NOW()';
  return sqlEscapeString(new Date(val).toISOString());
}

function generate() {
  const dataDir = path.join(__dirname, '..', 'data');
  const catalogs = JSON.parse(fs.readFileSync(path.join(dataDir, 'catalogs.json'), 'utf8'));
  const products = JSON.parse(fs.readFileSync(path.join(dataDir, 'products.json'), 'utf8'));
  const orders = JSON.parse(fs.readFileSync(path.join(dataDir, 'orders.json'), 'utf8'));
  const priceHistory = JSON.parse(fs.readFileSync(path.join(dataDir, 'price_history.json'), 'utf8'));
  const settings = JSON.parse(fs.readFileSync(path.join(dataDir, 'settings.json'), 'utf8'));

  const lines = [];

  lines.push(`-- ==============================================================================`);
  lines.push(`-- Dolphin Aquarium - Complete Supabase Database Schema & Data Migration`);
  lines.push(`-- Generated: ${new Date().toISOString()}`);
  lines.push(`-- Tables: catalogs, products, orders, price_history, settings`);
  lines.push(`-- Features: Idempotent (safe to re-run), RLS enabled, Performance Indexes`);
  lines.push(`-- ==============================================================================`);
  lines.push(``);
  lines.push(`BEGIN;`);
  lines.push(``);

  // 1. Catalogs Table
  lines.push(`-- ==============================================================================`);
  lines.push(`-- 1. CATALOGS TABLE`);
  lines.push(`-- ==============================================================================`);
  lines.push(`CREATE TABLE IF NOT EXISTS public.catalogs (`);
  lines.push(`    id TEXT PRIMARY KEY,`);
  lines.push(`    name TEXT NOT NULL,`);
  lines.push(`    slug TEXT NOT NULL UNIQUE,`);
  lines.push(`    description TEXT,`);
  lines.push(`    image TEXT,`);
  lines.push(`    display_order INTEGER NOT NULL DEFAULT 0,`);
  lines.push(`    status TEXT NOT NULL DEFAULT 'Active',`);
  lines.push(`    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),`);
  lines.push(`    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`);
  lines.push(`);`);
  lines.push(``);
  lines.push(`CREATE INDEX IF NOT EXISTS idx_catalogs_slug ON public.catalogs (slug);`);
  lines.push(`CREATE INDEX IF NOT EXISTS idx_catalogs_status ON public.catalogs (status);`);
  lines.push(`CREATE INDEX IF NOT EXISTS idx_catalogs_display_order ON public.catalogs (display_order ASC);`);
  lines.push(``);

  // 2. Products Table
  lines.push(`-- ==============================================================================`);
  lines.push(`-- 2. PRODUCTS TABLE`);
  lines.push(`-- ==============================================================================`);
  lines.push(`CREATE TABLE IF NOT EXISTS public.products (`);
  lines.push(`    id TEXT PRIMARY KEY,`);
  lines.push(`    name TEXT NOT NULL,`);
  lines.push(`    category TEXT NOT NULL,`);
  lines.push(`    sub_category TEXT,`);
  lines.push(`    variety TEXT,`);
  lines.push(`    gender TEXT DEFAULT 'Unsexed',`);
  lines.push(`    images JSONB NOT NULL DEFAULT '[]'::jsonb,`);
  lines.push(`    primary_image TEXT,`);
  lines.push(`    price NUMERIC(10, 2) DEFAULT 0,`);
  lines.push(`    original_price NUMERIC(10, 2),`);
  lines.push(`    currency TEXT NOT NULL DEFAULT '₹',`);
  lines.push(`    sizes JSONB NOT NULL DEFAULT '[]'::jsonb,`);
  lines.push(`    stock INTEGER NOT NULL DEFAULT 0,`);
  lines.push(`    availability TEXT NOT NULL DEFAULT 'in_stock',`);
  lines.push(`    description TEXT,`);
  lines.push(`    water_params JSONB,`);
  lines.push(`    is_live_fish BOOLEAN NOT NULL DEFAULT TRUE,`);
  lines.push(`    featured BOOLEAN NOT NULL DEFAULT FALSE,`);
  lines.push(`    specs JSONB,`);
  lines.push(`    status TEXT NOT NULL DEFAULT 'Published',`);
  lines.push(`    tags JSONB NOT NULL DEFAULT '[]'::jsonb,`);
  lines.push(`    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),`);
  lines.push(`    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`);
  lines.push(`);`);
  lines.push(``);
  lines.push(`CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);`);
  lines.push(`CREATE INDEX IF NOT EXISTS idx_products_status ON public.products (status);`);
  lines.push(`CREATE INDEX IF NOT EXISTS idx_products_is_live_fish ON public.products (is_live_fish);`);
  lines.push(`CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products (featured);`);
  lines.push(`CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at DESC);`);
  lines.push(``);

  // 3. Orders Table
  lines.push(`-- ==============================================================================`);
  lines.push(`-- 3. ORDERS TABLE`);
  lines.push(`-- ==============================================================================`);
  lines.push(`CREATE TABLE IF NOT EXISTS public.orders (`);
  lines.push(`    id TEXT PRIMARY KEY,`);
  lines.push(`    order_number TEXT NOT NULL UNIQUE,`);
  lines.push(`    customer_id TEXT,`);
  lines.push(`    customer_name TEXT NOT NULL,`);
  lines.push(`    house TEXT,`);
  lines.push(`    city TEXT,`);
  lines.push(`    district TEXT,`);
  lines.push(`    state TEXT,`);
  lines.push(`    pin_code TEXT,`);
  lines.push(`    phone_number TEXT NOT NULL,`);
  lines.push(`    items JSONB NOT NULL DEFAULT '[]'::jsonb,`);
  lines.push(`    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,`);
  lines.push(`    delivery_charge NUMERIC(10, 2) NOT NULL DEFAULT 0,`);
  lines.push(`    total NUMERIC(10, 2) NOT NULL DEFAULT 0,`);
  lines.push(`    grand_total NUMERIC(10, 2) NOT NULL DEFAULT 0,`);
  lines.push(`    status TEXT NOT NULL DEFAULT 'Pending',`);
  lines.push(`    payment_status TEXT NOT NULL DEFAULT 'Pending',`);
  lines.push(`    notes TEXT,`);
  lines.push(`    email_sent BOOLEAN NOT NULL DEFAULT FALSE,`);
  lines.push(`    whatsapp_sent BOOLEAN NOT NULL DEFAULT FALSE,`);
  lines.push(`    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),`);
  lines.push(`    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`);
  lines.push(`);`);
  lines.push(``);
  lines.push(`CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders (order_number);`);
  lines.push(`CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders (phone_number);`);
  lines.push(`CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);`);
  lines.push(`CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);`);
  lines.push(``);

  // 4. Price History Table
  lines.push(`-- ==============================================================================`);
  lines.push(`-- 4. PRICE HISTORY TABLE`);
  lines.push(`-- ==============================================================================`);
  lines.push(`CREATE TABLE IF NOT EXISTS public.price_history (`);
  lines.push(`    id TEXT PRIMARY KEY,`);
  lines.push(`    product_id TEXT NOT NULL,`);
  lines.push(`    old_price NUMERIC(10, 2),`);
  lines.push(`    new_price NUMERIC(10, 2) NOT NULL,`);
  lines.push(`    changed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),`);
  lines.push(`    admin_id TEXT`);
  lines.push(`);`);
  lines.push(``);
  lines.push(`CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON public.price_history (product_id);`);
  lines.push(`CREATE INDEX IF NOT EXISTS idx_price_history_changed_at ON public.price_history (changed_at DESC);`);
  lines.push(``);

  // 5. Settings Table
  lines.push(`-- ==============================================================================`);
  lines.push(`-- 5. SETTINGS TABLE`);
  lines.push(`-- ==============================================================================`);
  lines.push(`CREATE TABLE IF NOT EXISTS public.settings (`);
  lines.push(`    id TEXT PRIMARY KEY DEFAULT 'default',`);
  lines.push(`    settings JSONB NOT NULL,`);
  lines.push(`    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())`);
  lines.push(`);`);
  lines.push(``);

  // Row Level Security (RLS)
  lines.push(`-- ==============================================================================`);
  lines.push(`-- 6. ROW LEVEL SECURITY (RLS) & ACCESS POLICIES`);
  lines.push(`-- ==============================================================================`);
  lines.push(`ALTER TABLE public.catalogs ENABLE ROW LEVEL SECURITY;`);
  lines.push(`ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;`);
  lines.push(`ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;`);
  lines.push(`ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;`);
  lines.push(`ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;`);
  lines.push(``);
  lines.push(`-- Idempotent policy creation`);
  lines.push(`DO $$`);
  lines.push(`BEGIN`);
  lines.push(`    DROP POLICY IF EXISTS "Public can view active catalogs" ON public.catalogs;`);
  lines.push(`    DROP POLICY IF EXISTS "Admin full access catalogs" ON public.catalogs;`);
  lines.push(`    DROP POLICY IF EXISTS "Public can view published products" ON public.products;`);
  lines.push(`    DROP POLICY IF EXISTS "Admin full access products" ON public.products;`);
  lines.push(`    DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;`);
  lines.push(`    DROP POLICY IF EXISTS "Public can view orders" ON public.orders;`);
  lines.push(`    DROP POLICY IF EXISTS "Admin full access orders" ON public.orders;`);
  lines.push(`    DROP POLICY IF EXISTS "Admin full access price_history" ON public.price_history;`);
  lines.push(`    DROP POLICY IF EXISTS "Public can view settings" ON public.settings;`);
  lines.push(`    DROP POLICY IF EXISTS "Admin full access settings" ON public.settings;`);
  lines.push(`EXCEPTION`);
  lines.push(`    WHEN undefined_object THEN null;`);
  lines.push(`END $$;`);
  lines.push(``);
  lines.push(`CREATE POLICY "Public can view active catalogs" ON public.catalogs FOR SELECT USING (true);`);
  lines.push(`CREATE POLICY "Admin full access catalogs" ON public.catalogs FOR ALL USING (true) WITH CHECK (true);`);
  lines.push(``);
  lines.push(`CREATE POLICY "Public can view published products" ON public.products FOR SELECT USING (true);`);
  lines.push(`CREATE POLICY "Admin full access products" ON public.products FOR ALL USING (true) WITH CHECK (true);`);
  lines.push(``);
  lines.push(`CREATE POLICY "Public can insert orders" ON public.orders FOR INSERT WITH CHECK (true);`);
  lines.push(`CREATE POLICY "Public can view orders" ON public.orders FOR SELECT USING (true);`);
  lines.push(`CREATE POLICY "Admin full access orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);`);
  lines.push(``);
  lines.push(`CREATE POLICY "Admin full access price_history" ON public.price_history FOR ALL USING (true) WITH CHECK (true);`);
  lines.push(``);
  lines.push(`CREATE POLICY "Public can view settings" ON public.settings FOR SELECT USING (true);`);
  lines.push(`CREATE POLICY "Admin full access settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);`);
  lines.push(``);

  // 7. Data Inserts - Catalogs
  lines.push(`-- ==============================================================================`);
  lines.push(`-- 7. SEED DATA: CATALOGS (${catalogs.length} items)`);
  lines.push(`-- ==============================================================================`);
  for (const c of catalogs) {
    lines.push(`INSERT INTO public.catalogs (id, name, slug, description, image, display_order, status, created_at, updated_at)`);
    lines.push(`VALUES (`);
    lines.push(`    ${sqlEscapeString(c.id)},`);
    lines.push(`    ${sqlEscapeString(c.name)},`);
    lines.push(`    ${sqlEscapeString(c.slug)},`);
    lines.push(`    ${sqlEscapeString(c.description || '')},`);
    lines.push(`    ${sqlEscapeString(c.image || null)},`);
    lines.push(`    ${sqlEscapeNumber(c.displayOrder || 0)},`);
    lines.push(`    ${sqlEscapeString(c.status || 'Active')},`);
    lines.push(`    ${sqlEscapeTimestamp(c.createdAt)},`);
    lines.push(`    ${sqlEscapeTimestamp(c.updatedAt)}`);
    lines.push(`)`);
    lines.push(`ON CONFLICT (id) DO UPDATE SET`);
    lines.push(`    name = EXCLUDED.name,`);
    lines.push(`    slug = EXCLUDED.slug,`);
    lines.push(`    description = EXCLUDED.description,`);
    lines.push(`    image = EXCLUDED.image,`);
    lines.push(`    display_order = EXCLUDED.display_order,`);
    lines.push(`    status = EXCLUDED.status,`);
    lines.push(`    updated_at = EXCLUDED.updated_at;`);
    lines.push(``);
  }

  // 8. Data Inserts - Products
  lines.push(`-- ==============================================================================`);
  lines.push(`-- 8. SEED DATA: PRODUCTS (${products.length} items)`);
  lines.push(`-- ==============================================================================`);
  for (const p of products) {
    lines.push(`INSERT INTO public.products (`);
    lines.push(`    id, name, category, sub_category, variety, gender, images, primary_image,`);
    lines.push(`    price, original_price, currency, sizes, stock, availability, description,`);
    lines.push(`    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at`);
    lines.push(`) VALUES (`);
    lines.push(`    ${sqlEscapeString(p.id)},`);
    lines.push(`    ${sqlEscapeString(p.name)},`);
    lines.push(`    ${sqlEscapeString(p.category)},`);
    lines.push(`    ${sqlEscapeString(p.subCategory || '')},`);
    lines.push(`    ${sqlEscapeString(p.variety || '')},`);
    lines.push(`    ${sqlEscapeString(p.gender || 'Unsexed')},`);
    lines.push(`    ${sqlEscapeJson(p.images || [])},`);
    lines.push(`    ${sqlEscapeString(p.primaryImage || '')},`);
    lines.push(`    ${sqlEscapeNumber(p.price != null ? p.price : 0)},`);
    lines.push(`    ${sqlEscapeNumber(p.originalPrice)},`);
    lines.push(`    ${sqlEscapeString(p.currency || '₹')},`);
    lines.push(`    ${sqlEscapeJson(p.sizes || [])},`);
    lines.push(`    ${sqlEscapeNumber(p.stock != null ? p.stock : 0)},`);
    lines.push(`    ${sqlEscapeString(p.availability || 'in_stock')},`);
    lines.push(`    ${sqlEscapeString(p.description || '')},`);
    lines.push(`    ${sqlEscapeJson(p.waterParams || null)},`);
    lines.push(`    ${sqlEscapeBool(p.isLiveFish !== false)},`);
    lines.push(`    ${sqlEscapeBool(Boolean(p.featured))},`);
    lines.push(`    ${sqlEscapeJson(p.specs || null)},`);
    lines.push(`    ${sqlEscapeString(p.status || 'Published')},`);
    lines.push(`    ${sqlEscapeJson(p.tags || [])},`);
    lines.push(`    ${sqlEscapeTimestamp(p.createdAt)},`);
    lines.push(`    ${sqlEscapeTimestamp(p.updatedAt)}`);
    lines.push(`)`);
    lines.push(`ON CONFLICT (id) DO UPDATE SET`);
    lines.push(`    name = EXCLUDED.name,`);
    lines.push(`    category = EXCLUDED.category,`);
    lines.push(`    sub_category = EXCLUDED.sub_category,`);
    lines.push(`    variety = EXCLUDED.variety,`);
    lines.push(`    gender = EXCLUDED.gender,`);
    lines.push(`    images = EXCLUDED.images,`);
    lines.push(`    primary_image = EXCLUDED.primary_image,`);
    lines.push(`    price = EXCLUDED.price,`);
    lines.push(`    original_price = EXCLUDED.original_price,`);
    lines.push(`    currency = EXCLUDED.currency,`);
    lines.push(`    sizes = EXCLUDED.sizes,`);
    lines.push(`    stock = EXCLUDED.stock,`);
    lines.push(`    availability = EXCLUDED.availability,`);
    lines.push(`    description = EXCLUDED.description,`);
    lines.push(`    water_params = EXCLUDED.water_params,`);
    lines.push(`    is_live_fish = EXCLUDED.is_live_fish,`);
    lines.push(`    featured = EXCLUDED.featured,`);
    lines.push(`    specs = EXCLUDED.specs,`);
    lines.push(`    status = EXCLUDED.status,`);
    lines.push(`    tags = EXCLUDED.tags,`);
    lines.push(`    updated_at = EXCLUDED.updated_at;`);
    lines.push(``);
  }

  // 9. Data Inserts - Orders
  lines.push(`-- ==============================================================================`);
  lines.push(`-- 9. SEED DATA: ORDERS (${orders.length} items)`);
  lines.push(`-- ==============================================================================`);
  for (const o of orders) {
    lines.push(`INSERT INTO public.orders (`);
    lines.push(`    id, order_number, customer_id, customer_name, house, city, district, state,`);
    lines.push(`    pin_code, phone_number, items, subtotal, delivery_charge, total, grand_total,`);
    lines.push(`    status, payment_status, notes, email_sent, whatsapp_sent, created_at, updated_at`);
    lines.push(`) VALUES (`);
    lines.push(`    ${sqlEscapeString(o.id)},`);
    lines.push(`    ${sqlEscapeString(o.orderNumber)},`);
    lines.push(`    ${sqlEscapeString(o.customerId || null)},`);
    lines.push(`    ${sqlEscapeString(o.customerName || 'Customer')},`);
    lines.push(`    ${sqlEscapeString(o.house || '')},`);
    lines.push(`    ${sqlEscapeString(o.city || '')},`);
    lines.push(`    ${sqlEscapeString(o.district || '')},`);
    lines.push(`    ${sqlEscapeString(o.state || '')},`);
    lines.push(`    ${sqlEscapeString(o.pinCode || '')},`);
    lines.push(`    ${sqlEscapeString(o.phoneNumber || '')},`);
    lines.push(`    ${sqlEscapeJson(o.items || [])},`);
    lines.push(`    ${sqlEscapeNumber(o.subtotal || 0)},`);
    lines.push(`    ${sqlEscapeNumber(o.deliveryCharge || 0)},`);
    lines.push(`    ${sqlEscapeNumber(o.total || 0)},`);
    lines.push(`    ${sqlEscapeNumber(o.grandTotal || o.total || 0)},`);
    lines.push(`    ${sqlEscapeString(o.status || 'Pending')},`);
    lines.push(`    ${sqlEscapeString(o.paymentStatus || 'Pending')},`);
    lines.push(`    ${sqlEscapeString(o.notes || null)},`);
    lines.push(`    ${sqlEscapeBool(Boolean(o.emailSent))},`);
    lines.push(`    ${sqlEscapeBool(Boolean(o.whatsappSent))},`);
    lines.push(`    ${sqlEscapeTimestamp(o.createdAt)},`);
    lines.push(`    ${sqlEscapeTimestamp(o.updatedAt)}`);
    lines.push(`)`);
    lines.push(`ON CONFLICT (id) DO UPDATE SET`);
    lines.push(`    order_number = EXCLUDED.order_number,`);
    lines.push(`    customer_name = EXCLUDED.customer_name,`);
    lines.push(`    house = EXCLUDED.house,`);
    lines.push(`    city = EXCLUDED.city,`);
    lines.push(`    district = EXCLUDED.district,`);
    lines.push(`    state = EXCLUDED.state,`);
    lines.push(`    pin_code = EXCLUDED.pin_code,`);
    lines.push(`    phone_number = EXCLUDED.phone_number,`);
    lines.push(`    items = EXCLUDED.items,`);
    lines.push(`    subtotal = EXCLUDED.subtotal,`);
    lines.push(`    delivery_charge = EXCLUDED.delivery_charge,`);
    lines.push(`    total = EXCLUDED.total,`);
    lines.push(`    grand_total = EXCLUDED.grand_total,`);
    lines.push(`    status = EXCLUDED.status,`);
    lines.push(`    payment_status = EXCLUDED.payment_status,`);
    lines.push(`    notes = EXCLUDED.notes,`);
    lines.push(`    email_sent = EXCLUDED.email_sent,`);
    lines.push(`    whatsapp_sent = EXCLUDED.whatsapp_sent,`);
    lines.push(`    updated_at = EXCLUDED.updated_at;`);
    lines.push(``);
  }

  // 10. Data Inserts - Price History
  lines.push(`-- ==============================================================================`);
  lines.push(`-- 10. SEED DATA: PRICE HISTORY (${priceHistory.length} items)`);
  lines.push(`-- ==============================================================================`);
  for (const ph of priceHistory) {
    lines.push(`INSERT INTO public.price_history (id, product_id, old_price, new_price, changed_at, admin_id)`);
    lines.push(`VALUES (`);
    lines.push(`    ${sqlEscapeString(ph.id)},`);
    lines.push(`    ${sqlEscapeString(ph.productId)},`);
    lines.push(`    ${sqlEscapeNumber(ph.oldPrice)},`);
    lines.push(`    ${sqlEscapeNumber(ph.newPrice)},`);
    lines.push(`    ${sqlEscapeTimestamp(ph.changedAt)},`);
    lines.push(`    ${sqlEscapeString(ph.adminId || null)}`);
    lines.push(`)`);
    lines.push(`ON CONFLICT (id) DO UPDATE SET`);
    lines.push(`    product_id = EXCLUDED.product_id,`);
    lines.push(`    old_price = EXCLUDED.old_price,`);
    lines.push(`    new_price = EXCLUDED.new_price,`);
    lines.push(`    changed_at = EXCLUDED.changed_at,`);
    lines.push(`    admin_id = EXCLUDED.admin_id;`);
    lines.push(``);
  }

  // 11. Data Inserts - Site Settings
  lines.push(`-- ==============================================================================`);
  lines.push(`-- 11. SEED DATA: SITE SETTINGS`);
  lines.push(`-- ==============================================================================`);
  lines.push(`INSERT INTO public.settings (id, settings, updated_at)`);
  lines.push(`VALUES (`);
  lines.push(`    'default',`);
  lines.push(`    ${sqlEscapeJson(settings)},`);
  lines.push(`    NOW()`);
  lines.push(`)`);
  lines.push(`ON CONFLICT (id) DO UPDATE SET`);
  lines.push(`    settings = EXCLUDED.settings,`);
  lines.push(`    updated_at = EXCLUDED.updated_at;`);
  lines.push(``);

  lines.push(`COMMIT;`);
  lines.push(``);
  lines.push(`-- ==============================================================================`);
  lines.push(`-- VERIFICATION`);
  lines.push(`-- ==============================================================================`);
  lines.push(`SELECT`);
  lines.push(`    (SELECT count(*) FROM public.catalogs) AS total_catalogs,`);
  lines.push(`    (SELECT count(*) FROM public.products) AS total_products,`);
  lines.push(`    (SELECT count(*) FROM public.orders) AS total_orders,`);
  lines.push(`    (SELECT count(*) FROM public.price_history) AS total_price_history,`);
  lines.push(`    (SELECT count(*) FROM public.settings) AS total_settings;`);

  return lines.join('\n');
}

const sql = generate();
const outDir = path.join(__dirname, '..', 'supabase');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
const outPath = path.join(outDir, 'schema_and_data.sql');
fs.writeFileSync(outPath, sql, 'utf8');

// Also save as supabase/schema.sql for standard naming convention
fs.writeFileSync(path.join(outDir, 'schema.sql'), sql, 'utf8');

console.log(`Generated SQL successfully at:`);
console.log(` - ${outPath}`);
console.log(` - ${path.join(outDir, 'schema.sql')}`);
console.log(`Total size: ${(Buffer.byteLength(sql, 'utf8') / 1024).toFixed(2)} KB`);
