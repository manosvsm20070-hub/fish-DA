-- ==============================================================================
-- Dolphin Aquarium - Complete Supabase Database Schema & Data Migration
-- Generated: 2026-10-18T07:46:48.276Z
-- Tables: catalogs, products, orders, price_history, settings
-- Features: Idempotent (safe to re-run), RLS enabled, Performance Indexes
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- 1. CATALOGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.catalogs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_catalogs_slug ON public.catalogs (slug);
CREATE INDEX IF NOT EXISTS idx_catalogs_status ON public.catalogs (status);
CREATE INDEX IF NOT EXISTS idx_catalogs_display_order ON public.catalogs (display_order ASC);

-- ==============================================================================
-- 2. PRODUCTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    sub_category TEXT,
    variety TEXT,
    gender TEXT DEFAULT 'Unsexed',
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    primary_image TEXT,
    price NUMERIC(10, 2) DEFAULT 0,
    original_price NUMERIC(10, 2),
    currency TEXT NOT NULL DEFAULT '₹',
    sizes JSONB NOT NULL DEFAULT '[]'::jsonb,
    stock INTEGER NOT NULL DEFAULT 0,
    availability TEXT NOT NULL DEFAULT 'in_stock',
    description TEXT,
    water_params JSONB,
    is_live_fish BOOLEAN NOT NULL DEFAULT TRUE,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    specs JSONB,
    status TEXT NOT NULL DEFAULT 'Published',
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products (status);
CREATE INDEX IF NOT EXISTS idx_products_is_live_fish ON public.products (is_live_fish);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products (featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at DESC);

-- ==============================================================================
-- 3. ORDERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    customer_id TEXT,
    customer_name TEXT NOT NULL,
    house TEXT,
    city TEXT,
    district TEXT,
    state TEXT,
    pin_code TEXT,
    phone_number TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    delivery_charge NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    grand_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Pending',
    payment_status TEXT NOT NULL DEFAULT 'Pending',
    notes TEXT,
    email_sent BOOLEAN NOT NULL DEFAULT FALSE,
    whatsapp_sent BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders (phone_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);

-- ==============================================================================
-- 4. PRICE HISTORY TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.price_history (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    old_price NUMERIC(10, 2),
    new_price NUMERIC(10, 2) NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    admin_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON public.price_history (product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_changed_at ON public.price_history (changed_at DESC);

-- ==============================================================================
-- 5. SETTINGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    settings JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) & ACCESS POLICIES
-- ==============================================================================
ALTER TABLE public.catalogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Idempotent policy creation
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public can view active catalogs" ON public.catalogs;
    DROP POLICY IF EXISTS "Admin full access catalogs" ON public.catalogs;
    DROP POLICY IF EXISTS "Public can view published products" ON public.products;
    DROP POLICY IF EXISTS "Admin full access products" ON public.products;
    DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
    DROP POLICY IF EXISTS "Public can view orders" ON public.orders;
    DROP POLICY IF EXISTS "Admin full access orders" ON public.orders;
    DROP POLICY IF EXISTS "Admin full access price_history" ON public.price_history;
    DROP POLICY IF EXISTS "Public can view settings" ON public.settings;
    DROP POLICY IF EXISTS "Admin full access settings" ON public.settings;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Public can view active catalogs" ON public.catalogs FOR SELECT USING (true);
CREATE POLICY "Admin full access catalogs" ON public.catalogs FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public can view published products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin full access products" ON public.products FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Admin full access orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access price_history" ON public.price_history FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public can view settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admin full access settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 7. SEED DATA: CATALOGS (25 items)
-- ==============================================================================
INSERT INTO public.catalogs (id, name, slug, description, image, display_order, status, created_at, updated_at)
VALUES (
    'cat-fish',
    'Fish',
    'fish',
    'Live freshwater fish — goldfish, betta, guppies, sharks and more',
    NULL,
    1,
    'Active',
    '2026-09-01T00:00:00.000Z',
    '2026-10-01T04:27:59.993Z'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    display_order = EXCLUDED.display_order,
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.catalogs (id, name, slug, description, image, display_order, status, created_at, updated_at)
VALUES (
    'cat-goldfish',
    'Goldfish',
    'goldfish',
    'Fancy goldfish varieties',
    NULL,
    2,
    'Active',
    '2026-09-01T00:00:00.000Z',
    '2026-09-01T00:00:00.000Z'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    display_order = EXCLUDED.display_order,
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.catalogs (id, name, slug, description, image, display_order, status, created_at, updated_at)
VALUES (
    'cat-betta',
    'Betta Fish',
    'betta',
    'Show betta fish varieties',
    NULL,
    3,
    'Active',
    '2026-09-01T00:00:00.000Z',
    '2026-09-01T00:00:00.000Z'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    display_order = EXCLUDED.display_order,
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.catalogs (id, name, slug, description, image, display_order, status, created_at, updated_at)
VALUES (
    'cat-guppy',
    'Guppy',
    'guppy',
    'Breeder guppies and endlers',
    NULL,
    4,
    'Active',
    '2026-09-01T00:00:00.000Z',
    '2026-09-01T00:00:00.000Z'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    display_order = EXCLUDED.display_order,
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.catalogs (id, name, slug, description, image, display_order, status, created_at, updated_at)
VALUES (
    'cat-molly',
    'Molly',
    'molly',
    'Mollies and livebearers',
    NULL,
    5,
    'Active',
    '2026-09-01T00:00:00.000Z',
    '2026-09-01T00:00:00.000Z'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    display_order = EXCLUDED.display_order,
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.catalogs (id, name, slug, description, image, display_order, status, created_at, updated_at)
VALUES (
    'cat-flowerhorn',
    'Flowerhorn',
    'flowerhorn',
    'King Kamfa and Flowerhorn cichlids',
    NULL,
    6,
    'Active',
    '2026-09-01T00:00:00.000Z',
    '2026-09-01T00:00:00.000Z'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    display_order = EXCLUDED.display_order,
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.catalogs (id, name, slug, description, image, display_order, status, created_at, updated_at)
VALUES (
    'cat-sharks',
    'Aquarium Sharks',
    'sharks',
    'Freshwater aquarium sharks',
    NULL,
    7,
    'Active',
    '2026-09-01T00:00:00.000Z',
    '2026-09-01T00:00:00.000Z'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    display_order = EXCLUDED.display_order,
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.catalogs (id, name, slug, description, image, display_order, status, created_at, updated_at)
VALUES (
    'cat-monster',
    'Monster Fish',
    'monster-fish',
    'Monster fish and gars',
    NULL,
    8,
    'Active',
    '2026-09-01T00:00:00.000Z',
    '2026-09-01T00:00:00.000Z'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    display_order = EXCLUDED.display_order,
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.catalogs (id, name, slug, description, image, display_order, status, created_at, updated_at)
VALUES (
    'cat-catfish',
    'Catfish',
    'catfish',
    'Monster catfish varieties',
    NULL,
    9,
    'Active',
    '2026-09-01T00:00:00.000Z',
    '2026-09-01T00:00:00.000Z'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    display_order = EXCLUDED.display_order,
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.catalogs (id, name, slug, description, image, display_order, status, created_at, updated_at)
VALUES (
    'cat-danio',
    'Zebra Danio',
    'zebra-danio',
    'Zebra danio and GloFish',
    NULL,
    10,
    'Active',
    '2026-09-01T00:00:00.000Z',
    '2026-09-01T00:00:00.000Z'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    display_order = EXCLUDED.display_order,
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.catalogs (id, name, slug, description, image, display_order, status, created_at, updated_at)
VALUES (
    'cat-tanks',
    'Aquarium Tanks',
    'tanks',
    'Standard and rimless aquarium tanks',
    NULL,
    11,
    'Active',
    '2026-09-01T00:00:00.000Z',
    '2026-09-01T00:00:00.000Z'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    display_order = EXCLUDED.display_order,
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.catalogs (id, name, slug, description, image, display_order, status, created_at, updated_at)
VALUES (
    'cat-custom-tanks',
    'Custom Tanks',
    'custom-tanks',
    'Custom-built rimless aquarium tanks',
    NULL,
    12,
    'Active',
    '2026-09-01T00:00:00.000Z',
    '2026-09-01T00:00:00.000Z'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    display_order = EXCLUDED.display_order,
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.catalogs (id, name, slug, description, image, display_order, status, created_at, updated_at)
VALUES (
    'cat-motors',
    'Motors & Pumps',
    'motors',
    'Aquarium motors and water pumps',
    NULL,
    13,
    'Active',
    '2026-09-01T00:00:00.000Z',
    '2026-09-01T00:00:00.000Z'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    display_order = EXCLUDED.display_order,
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.catalogs (id, name, slug, description, image, display_order, status, created_at, updated_at)
VALUES (
    'cat-filters',
    'Filters',
    'filters',
    'Aquarium filtration systems',
    NULL,
    14,
    'Active',
    '2026-09-01T00:00:00.000Z',
    '2026-09-01T00:00:00.000Z'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    display_order = EXCLUDED.display_order,
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.catalogs (id, name, slug, description, image, display_order, status, created_at, updated_at)
VALUES (
    'cat-medicines',
    'Fish Medicines',
    'medicines',
    'Fish medicines and water conditioners',
    NULL,
    15,
    'Active',
    '2026-09-01T00:00:00.000Z',
    '2026-09-01T00:00:00.000Z'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    display_order = EXCLUDED.display_order,
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.catalogs (id, name, slug, description, image, display_order, status, created_at, updated_at)
VALUES (
    'cat-food',
    'Fish Food',
    'food',
    'Premium fish food and feeding supplies',
    NULL,
    16,
    'Active',
    '2026-09-01T00:00:00.000Z',
    '2026-09-01T00:00:00.000Z'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    display_order = EXCLUDED.display_order,
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.catalogs (id, name, slug, description, image, display_order, status, created_at, updated_at)
VALUES (
    'cat-stones',
    'Aquarium Stones',
    'stones',
    'Decorative aquarium stones and rocks',
    NULL,
    17,
    'Active',
    '2026-09-01T00:00:00.000Z',
    '2026-09-01T00:00:00.000Z'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    display_order = EXCLUDED.display_order,
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.catalogs (id, name, slug, description, image, display_order, status, created_at, updated_at)
VALUES (
    'cat-gravel',
    'Colored Gravel',
    'gravel',
    'Colored aquarium gravel and substrate',
    NULL,
    18,
    'Active',
    '2026-09-01T00:00:00.000Z',
    '2026-09-01T00:00:00.000Z'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    display_order = EXCLUDED.display_order,
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.catalogs (id, name, slug, description, image, display_order, status, created_at, updated_at)
VALUES (
    'cat-bowls',
    'Aquarium Bowls',
    'bowls',
    'Decorative aquarium bowls and small tanks',
    NULL,
    19,
    'Active',
    '2026-09-01T00:00:00.000Z',
    '2026-09-01T00:00:00.000Z'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    display_order = EXCLUDED.display_order,
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.catalogs (id, name, slug, description, image, display_order, status, created_at, updated_at)
VALUES (
    'cat-nets',
    'Aquarium Nets',
    'nets',
    'Fish catching and cleaning nets',
    NULL,
    20,
    'Active',
    '2026-09-01T00:00:00.000Z',
    '2026-09-01T00:00:00.000Z'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    display_order = EXCLUDED.display_order,
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.catalogs (id, name, slug, description, image, display_order, status, created_at, updated_at)
VALUES (
    'cat-plants',
    'Aquarium Plants',
    'plants',
    'Live and artificial aquarium plants',
    NULL,
    21,
    'Active',
    '2026-09-01T00:00:00.000Z',
    '2026-09-01T00:00:00.000Z'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    display_order = EXCLUDED.display_order,
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.catalogs (id, name, slug, description, image, display_order, status, created_at, updated_at)
VALUES (
    'cat-decorations',
    'Decorations',
    'decorations',
    'Aquarium decorations and ornaments',
    NULL,
    22,
    'Active',
    '2026-09-01T00:00:00.000Z',
    '2026-09-01T00:00:00.000Z'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    display_order = EXCLUDED.display_order,
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.catalogs (id, name, slug, description, image, display_order, status, created_at, updated_at)
VALUES (
    'cat-accessories',
    'Accessories',
    'accessories',
    'Aquarium accessories and tools',
    NULL,
    23,
    'Active',
    '2026-09-01T00:00:00.000Z',
    '2026-09-01T00:00:00.000Z'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    display_order = EXCLUDED.display_order,
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.catalogs (id, name, slug, description, image, display_order, status, created_at, updated_at)
VALUES (
    'cat-aquarium-lighting-1790314692686',
    'Aquarium Lighting',
    'aquarium-lighting',
    'High-spec LED lamps and full-spectrum planted lights',
    NULL,
    15,
    'Active',
    '2026-09-25T05:38:12.686Z',
    '2026-09-25T05:38:12.686Z'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    display_order = EXCLUDED.display_order,
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.catalogs (id, name, slug, description, image, display_order, status, created_at, updated_at)
VALUES (
    'cat-dwcwdvc-1790828890238',
    'dwcwdvc',
    'dwcwdvc',
    'evrevv',
    NULL,
    43,
    'Archived',
    '2026-10-01T04:28:10.238Z',
    '2026-10-06T05:02:33.662Z'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    display_order = EXCLUDED.display_order,
    status = EXCLUDED.status,
    updated_at = EXCLUDED.updated_at;

-- ==============================================================================
-- 8. SEED DATA: PRODUCTS (1 items)
-- ==============================================================================
INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'prod-betta-1792309316059',
    'betta',
    'Fish',
    'male betta',
    'full moon',
    'Unsexed',
    '["/uploads/img_1792309387729_qtdx8a.webp"]'::jsonb,
    '/uploads/img_1792309387729_qtdx8a.webp',
    150,
    160,
    '₹',
    '["2.5inch"]'::jsonb,
    15,
    'in_stock',
    '',
    NULL,
    TRUE,
    FALSE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-10-18T07:41:56.060Z',
    '2026-10-18T07:43:09.342Z'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    sub_category = EXCLUDED.sub_category,
    variety = EXCLUDED.variety,
    gender = EXCLUDED.gender,
    images = EXCLUDED.images,
    primary_image = EXCLUDED.primary_image,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    currency = EXCLUDED.currency,
    sizes = EXCLUDED.sizes,
    stock = EXCLUDED.stock,
    availability = EXCLUDED.availability,
    description = EXCLUDED.description,
    water_params = EXCLUDED.water_params,
    is_live_fish = EXCLUDED.is_live_fish,
    featured = EXCLUDED.featured,
    specs = EXCLUDED.specs,
    status = EXCLUDED.status,
    tags = EXCLUDED.tags,
    updated_at = EXCLUDED.updated_at;

-- ==============================================================================
-- 9. SEED DATA: ORDERS (7 items)
-- ==============================================================================
INSERT INTO public.orders (
    id, order_number, customer_id, customer_name, house, city, district, state,
    pin_code, phone_number, items, subtotal, delivery_charge, total, grand_total,
    status, payment_status, notes, email_sent, whatsapp_sent, created_at, updated_at
) VALUES (
    'ord_1792298317524_5779',
    'AQ-20261018-5779',
    NULL,
    'WhatsApp Customer',
    'WhatsApp Order',
    'Sothupakkam',
    'Chengalpattu',
    'Tamil Nadu',
    '603319',
    '+917845637566',
    '[{"productId":"gf-oranda-red-cap","productName":"Red Cap Oranda Goldfish","variety":"Red Cap","size":"3.5 inch","quantity":1,"unitPrice":850,"price":850,"subtotal":850,"image":"https://lh3.googleusercontent.com/aida-public/AB6AXuCe6ajzYgPnKEeMg6lfYrC_4AcF7eKah27k-HVdru1NNy-53eUgKBY6z-81QDjo40OuztuQ_9QvErDgpYIigHMtmcesxajymUhWYjkN4_-U1ah6l-GQIgnUN6PWCB18hwKdoIDCB9rXJJICJxkyy3IrwuNA0O0FiRGtPL0Y-NDh5e1OVoTyNA9PuHMAsP-X7HN6X7fqbg9z8ZXhVF45wM2u-jnQCD_TMNAkXDF4r13lSn-YrqWb7ZeJBg"}]'::jsonb,
    850,
    100,
    950,
    950,
    'Cancelled',
    'Pending',
    NULL,
    TRUE,
    TRUE,
    '2026-10-18T04:38:37.524Z',
    '2026-10-18T07:12:56.850Z'
)
ON CONFLICT (id) DO UPDATE SET
    order_number = EXCLUDED.order_number,
    customer_name = EXCLUDED.customer_name,
    house = EXCLUDED.house,
    city = EXCLUDED.city,
    district = EXCLUDED.district,
    state = EXCLUDED.state,
    pin_code = EXCLUDED.pin_code,
    phone_number = EXCLUDED.phone_number,
    items = EXCLUDED.items,
    subtotal = EXCLUDED.subtotal,
    delivery_charge = EXCLUDED.delivery_charge,
    total = EXCLUDED.total,
    grand_total = EXCLUDED.grand_total,
    status = EXCLUDED.status,
    payment_status = EXCLUDED.payment_status,
    notes = EXCLUDED.notes,
    email_sent = EXCLUDED.email_sent,
    whatsapp_sent = EXCLUDED.whatsapp_sent,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.orders (
    id, order_number, customer_id, customer_name, house, city, district, state,
    pin_code, phone_number, items, subtotal, delivery_charge, total, grand_total,
    status, payment_status, notes, email_sent, whatsapp_sent, created_at, updated_at
) VALUES (
    'ord_1791701577869_2708',
    'AQ-20261011-2708',
    NULL,
    'mugulusukuuuu',
    'ellapakkam road palli pettai EB colony acharapakkam',
    'acharapakkalm',
    'Chengalpattu',
    'Tamil Nadu',
    '603319',
    '+918015568894',
    '[{"productId":"gf-oranda-red-cap","productName":"Red Cap Oranda Goldfish","variety":"Red Cap","size":"3.5 inch","quantity":1,"unitPrice":1,"price":1,"subtotal":1,"image":"https://lh3.googleusercontent.com/aida-public/AB6AXuCe6ajzYgPnKEeMg6lfYrC_4AcF7eKah27k-HVdru1NNy-53eUgKBY6z-81QDjo40OuztuQ_9QvErDgpYIigHMtmcesxajymUhWYjkN4_-U1ah6l-GQIgnUN6PWCB18hwKdoIDCB9rXJJICJxkyy3IrwuNA0O0FiRGtPL0Y-NDh5e1OVoTyNA9PuHMAsP-X7HN6X7fqbg9z8ZXhVF45wM2u-jnQCD_TMNAkXDF4r13lSn-YrqWb7ZeJBg"},{"productId":"gf-ryukin-calico","productName":"Calico Ryukin Goldfish","variety":"Calico","size":"3 inch","quantity":13,"unitPrice":100,"price":100,"subtotal":1300,"image":"https://lh3.googleusercontent.com/aida-public/AB6AXuDViXqBf6VmELAJvHhUtBwFzZP03nxnfV5CO_8rNpTmIS6VDVCotPqrlxUUA-fuAFYWKfz_A47GNVWVfkq7Vnmrbk5Q5w25hoFnWkRCYgluBxFDCQZMz3kOmsklYw2XWlweTbbI14YqlULjnloPOdjAL6OMFrZEgIRC214TkDbGFpqZiOBEBH6YyIZGKRl__22nmcukeWK3xN_K8pTE644BwnZPMvPHesR1HZI_InK1Wfpj4Ln5rwEq1g"},{"productId":"gf-black-moor","productName":"Black Moor Goldfish","variety":"Black Moor","size":"2.5 inch","quantity":13,"unitPrice":450,"price":450,"subtotal":5850,"image":"https://lh3.googleusercontent.com/aida-public/AB6AXuBQPq6AFXefOzoyBtBguegYM07bV0ThdsntibX5EehzpljNqf4bBoefhyAVwkNDcl_-IrynMuxMEfnDrqUxQ475kSCsGvGD5IGemHKTAELbJzgXuv6i86iL7-yY-R4TiqfIqeuqNzdPFrNknRY2hYyp-Aerdh81m9VqHpCUxQ43DAbFkrdQF6C9eaKVfvDEoE6M3ZYRLV5NOI2U4AEQtIo1aH2zH0deqpyYkr58HcXFX_RhSHn9jcDLug"}]'::jsonb,
    7151,
    0,
    7151,
    7151,
    'Cancelled',
    'Pending',
    NULL,
    TRUE,
    TRUE,
    '2026-10-11T06:52:57.869Z',
    '2026-10-11T06:53:12.713Z'
)
ON CONFLICT (id) DO UPDATE SET
    order_number = EXCLUDED.order_number,
    customer_name = EXCLUDED.customer_name,
    house = EXCLUDED.house,
    city = EXCLUDED.city,
    district = EXCLUDED.district,
    state = EXCLUDED.state,
    pin_code = EXCLUDED.pin_code,
    phone_number = EXCLUDED.phone_number,
    items = EXCLUDED.items,
    subtotal = EXCLUDED.subtotal,
    delivery_charge = EXCLUDED.delivery_charge,
    total = EXCLUDED.total,
    grand_total = EXCLUDED.grand_total,
    status = EXCLUDED.status,
    payment_status = EXCLUDED.payment_status,
    notes = EXCLUDED.notes,
    email_sent = EXCLUDED.email_sent,
    whatsapp_sent = EXCLUDED.whatsapp_sent,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.orders (
    id, order_number, customer_id, customer_name, house, city, district, state,
    pin_code, phone_number, items, subtotal, delivery_charge, total, grand_total,
    status, payment_status, notes, email_sent, whatsapp_sent, created_at, updated_at
) VALUES (
    'ord_1790828771803_6783',
    'AQ-20261001-6783',
    NULL,
    'Manorajankumar S',
    'ellapakkam road palli pettai EB colony acharapakkam',
    'Sothupakkam',
    'Chengalpattu',
    'Tamil Nadu',
    '603319',
    '+918015568894',
    '[{"productId":"gf-oranda-red-cap","productName":"Red Cap Oranda Goldfish","variety":"Red Cap","size":"3.5 inch","quantity":1,"unitPrice":100,"price":100,"subtotal":100,"image":"https://lh3.googleusercontent.com/aida-public/AB6AXuCe6ajzYgPnKEeMg6lfYrC_4AcF7eKah27k-HVdru1NNy-53eUgKBY6z-81QDjo40OuztuQ_9QvErDgpYIigHMtmcesxajymUhWYjkN4_-U1ah6l-GQIgnUN6PWCB18hwKdoIDCB9rXJJICJxkyy3IrwuNA0O0FiRGtPL0Y-NDh5e1OVoTyNA9PuHMAsP-X7HN6X7fqbg9z8ZXhVF45wM2u-jnQCD_TMNAkXDF4r13lSn-YrqWb7ZeJBg"},{"productId":"gf-ryukin-calico","productName":"Calico Ryukin Goldfish","variety":"Calico","size":"3 inch","quantity":1,"unitPrice":750,"price":750,"subtotal":750,"image":"https://lh3.googleusercontent.com/aida-public/AB6AXuDViXqBf6VmELAJvHhUtBwFzZP03nxnfV5CO_8rNpTmIS6VDVCotPqrlxUUA-fuAFYWKfz_A47GNVWVfkq7Vnmrbk5Q5w25hoFnWkRCYgluBxFDCQZMz3kOmsklYw2XWlweTbbI14YqlULjnloPOdjAL6OMFrZEgIRC214TkDbGFpqZiOBEBH6YyIZGKRl__22nmcukeWK3xN_K8pTE644BwnZPMvPHesR1HZI_InK1Wfpj4Ln5rwEq1g"},{"productId":"gf-black-moor","productName":"Black Moor Goldfish","variety":"Black Moor","size":"2.5 inch","quantity":1,"unitPrice":450,"price":450,"subtotal":450,"image":"https://lh3.googleusercontent.com/aida-public/AB6AXuBQPq6AFXefOzoyBtBguegYM07bV0ThdsntibX5EehzpljNqf4bBoefhyAVwkNDcl_-IrynMuxMEfnDrqUxQ475kSCsGvGD5IGemHKTAELbJzgXuv6i86iL7-yY-R4TiqfIqeuqNzdPFrNknRY2hYyp-Aerdh81m9VqHpCUxQ43DAbFkrdQF6C9eaKVfvDEoE6M3ZYRLV5NOI2U4AEQtIo1aH2zH0deqpyYkr58HcXFX_RhSHn9jcDLug"},{"productId":"betta-halfmoon-royal-blue","productName":"Royal Blue Halfmoon Betta","variety":"Halfmoon","size":"2.5 inch Show Grade","quantity":1,"unitPrice":350,"price":350,"subtotal":350,"image":"https://lh3.googleusercontent.com/aida-public/AB6AXuCLAXDObZy5BCxqWWScFhhJUTlUUOtlct7-sRC8RpkZz4_B-ZwDYLPXdA4ddI6Ehm-pCCM1KPUT0gY_13sC-p00tDf_jb7qzkIpnVXKQP9zuQkeGO6uQIDiOJhnhyhXwJBt0aDOn2QBGfDyvFfSRn4_DS-6EYAnz6rS1ltYyicIppLAPJa_v5gqTUUEP8yUDtfjW2sSJR9rm5n9jRFLxq54l8TeQZzI83FKm2x1Qv7xdCPwPMCvENEYXQ"}]'::jsonb,
    1650,
    0,
    1650,
    1650,
    'Cancelled',
    'Pending',
    NULL,
    TRUE,
    TRUE,
    '2026-10-01T04:26:11.803Z',
    '2026-10-06T05:01:54.456Z'
)
ON CONFLICT (id) DO UPDATE SET
    order_number = EXCLUDED.order_number,
    customer_name = EXCLUDED.customer_name,
    house = EXCLUDED.house,
    city = EXCLUDED.city,
    district = EXCLUDED.district,
    state = EXCLUDED.state,
    pin_code = EXCLUDED.pin_code,
    phone_number = EXCLUDED.phone_number,
    items = EXCLUDED.items,
    subtotal = EXCLUDED.subtotal,
    delivery_charge = EXCLUDED.delivery_charge,
    total = EXCLUDED.total,
    grand_total = EXCLUDED.grand_total,
    status = EXCLUDED.status,
    payment_status = EXCLUDED.payment_status,
    notes = EXCLUDED.notes,
    email_sent = EXCLUDED.email_sent,
    whatsapp_sent = EXCLUDED.whatsapp_sent,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.orders (
    id, order_number, customer_id, customer_name, house, city, district, state,
    pin_code, phone_number, items, subtotal, delivery_charge, total, grand_total,
    status, payment_status, notes, email_sent, whatsapp_sent, created_at, updated_at
) VALUES (
    'ord_1790342868664_7618',
    'AQ-20260925-7618',
    NULL,
    'jbgflv seigfeiuw vf',
    'ybfhics',
    'Sothupakkam',
    'Chengalpattu',
    'Tamil Nadu',
    '603319',
    '+919709777972',
    '[{"productId":"gf-black-moor","productName":"Black Moor Goldfish","variety":"Black Moor","size":"2.5 inch","quantity":1,"unitPrice":450,"price":450,"subtotal":450,"image":"https://lh3.googleusercontent.com/aida-public/AB6AXuBQPq6AFXefOzoyBtBguegYM07bV0ThdsntibX5EehzpljNqf4bBoefhyAVwkNDcl_-IrynMuxMEfnDrqUxQ475kSCsGvGD5IGemHKTAELbJzgXuv6i86iL7-yY-R4TiqfIqeuqNzdPFrNknRY2hYyp-Aerdh81m9VqHpCUxQ43DAbFkrdQF6C9eaKVfvDEoE6M3ZYRLV5NOI2U4AEQtIo1aH2zH0deqpyYkr58HcXFX_RhSHn9jcDLug"},{"productId":"gf-ranchu-lionhead","productName":"Lionchu / Ranchu Goldfish","variety":"Lionhead Ranchu","size":"3.0 inch","quantity":1,"unitPrice":1100,"price":1100,"subtotal":1100,"image":"https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80"},{"productId":"gf-ryukin-calico","productName":"Calico Ryukin Goldfish","variety":"Calico","size":"3 inch","quantity":1,"unitPrice":750,"price":750,"subtotal":750,"image":"https://lh3.googleusercontent.com/aida-public/AB6AXuDViXqBf6VmELAJvHhUtBwFzZP03nxnfV5CO_8rNpTmIS6VDVCotPqrlxUUA-fuAFYWKfz_A47GNVWVfkq7Vnmrbk5Q5w25hoFnWkRCYgluBxFDCQZMz3kOmsklYw2XWlweTbbI14YqlULjnloPOdjAL6OMFrZEgIRC214TkDbGFpqZiOBEBH6YyIZGKRl__22nmcukeWK3xN_K8pTE644BwnZPMvPHesR1HZI_InK1Wfpj4Ln5rwEq1g"},{"productId":"gf-oranda-red-cap","productName":"Red Cap Oranda Goldfish","variety":"Red Cap","size":"3.5 inch","quantity":1,"unitPrice":100,"price":100,"subtotal":100,"image":"https://lh3.googleusercontent.com/aida-public/AB6AXuCe6ajzYgPnKEeMg6lfYrC_4AcF7eKah27k-HVdru1NNy-53eUgKBY6z-81QDjo40OuztuQ_9QvErDgpYIigHMtmcesxajymUhWYjkN4_-U1ah6l-GQIgnUN6PWCB18hwKdoIDCB9rXJJICJxkyy3IrwuNA0O0FiRGtPL0Y-NDh5e1OVoTyNA9PuHMAsP-X7HN6X7fqbg9z8ZXhVF45wM2u-jnQCD_TMNAkXDF4r13lSn-YrqWb7ZeJBg"},{"productId":"gf-shubunkin-comet","productName":"Shubunkin & Sarasa Comet","variety":"Shubunkin","size":"3 inch","quantity":1,"unitPrice":180,"price":180,"subtotal":180,"image":"https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=800&q=80"}]'::jsonb,
    2580,
    0,
    2580,
    2580,
    'Cancelled',
    'Pending',
    NULL,
    TRUE,
    TRUE,
    '2026-09-25T13:27:48.664Z',
    '2026-10-18T07:12:52.857Z'
)
ON CONFLICT (id) DO UPDATE SET
    order_number = EXCLUDED.order_number,
    customer_name = EXCLUDED.customer_name,
    house = EXCLUDED.house,
    city = EXCLUDED.city,
    district = EXCLUDED.district,
    state = EXCLUDED.state,
    pin_code = EXCLUDED.pin_code,
    phone_number = EXCLUDED.phone_number,
    items = EXCLUDED.items,
    subtotal = EXCLUDED.subtotal,
    delivery_charge = EXCLUDED.delivery_charge,
    total = EXCLUDED.total,
    grand_total = EXCLUDED.grand_total,
    status = EXCLUDED.status,
    payment_status = EXCLUDED.payment_status,
    notes = EXCLUDED.notes,
    email_sent = EXCLUDED.email_sent,
    whatsapp_sent = EXCLUDED.whatsapp_sent,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.orders (
    id, order_number, customer_id, customer_name, house, city, district, state,
    pin_code, phone_number, items, subtotal, delivery_charge, total, grand_total,
    status, payment_status, notes, email_sent, whatsapp_sent, created_at, updated_at
) VALUES (
    'ord_1790314849751_2161',
    'AQ-20260925-2161',
    NULL,
    'Karthik Raja',
    '12 Gandhi Salai',
    'Madurantakam',
    'Chengalpattu',
    'Tamil Nadu',
    '603306',
    '+919840123456',
    '[{"productId":"prod-pro-canister-filter-1500l-h-1790314849731-1790314849737","productName":"Pro Ultra Canister Filter 1500L/H 1790314849731","variety":"Canister Biological","size":"1500 L/H (Up to 300L)","quantity":1,"unitPrice":4800,"price":4800,"subtotal":4800,"image":"https://images.unsplash.com/photo-1544943910-4c1dc44a0558?w=800"}]'::jsonb,
    4800,
    0,
    4800,
    4800,
    'Cancelled',
    'Pending',
    NULL,
    TRUE,
    TRUE,
    '2026-09-25T05:40:49.751Z',
    '2026-09-25T06:00:43.244Z'
)
ON CONFLICT (id) DO UPDATE SET
    order_number = EXCLUDED.order_number,
    customer_name = EXCLUDED.customer_name,
    house = EXCLUDED.house,
    city = EXCLUDED.city,
    district = EXCLUDED.district,
    state = EXCLUDED.state,
    pin_code = EXCLUDED.pin_code,
    phone_number = EXCLUDED.phone_number,
    items = EXCLUDED.items,
    subtotal = EXCLUDED.subtotal,
    delivery_charge = EXCLUDED.delivery_charge,
    total = EXCLUDED.total,
    grand_total = EXCLUDED.grand_total,
    status = EXCLUDED.status,
    payment_status = EXCLUDED.payment_status,
    notes = EXCLUDED.notes,
    email_sent = EXCLUDED.email_sent,
    whatsapp_sent = EXCLUDED.whatsapp_sent,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.orders (
    id, order_number, customer_id, customer_name, house, city, district, state,
    pin_code, phone_number, items, subtotal, delivery_charge, total, grand_total,
    status, payment_status, notes, email_sent, whatsapp_sent, created_at, updated_at
) VALUES (
    'ord_1790314726576_9574',
    'AQ-20260925-9574',
    NULL,
    'Ramesh Babu',
    'Plot 42, River View Street',
    'Chennai',
    'Chengalpattu',
    'Tamil Nadu',
    '603302',
    '+919840123456',
    '[{"productId":"prod-full-spectrum-wrgb-led-light-60cm-1790314726564","productName":"Full Spectrum WRGB Pro LED Light 60cm","variety":"WRGB Smart App Control","size":"60cm (for 2ft tank)","quantity":2,"unitPrice":2850,"subtotal":5700,"image":"https://images.unsplash.com/photo-1544943910-4c1dc44a0558?w=800"}]'::jsonb,
    5700,
    0,
    5700,
    5700,
    'Cancelled',
    'Pending',
    NULL,
    TRUE,
    TRUE,
    '2026-09-25T05:38:46.576Z',
    '2026-09-25T05:53:45.912Z'
)
ON CONFLICT (id) DO UPDATE SET
    order_number = EXCLUDED.order_number,
    customer_name = EXCLUDED.customer_name,
    house = EXCLUDED.house,
    city = EXCLUDED.city,
    district = EXCLUDED.district,
    state = EXCLUDED.state,
    pin_code = EXCLUDED.pin_code,
    phone_number = EXCLUDED.phone_number,
    items = EXCLUDED.items,
    subtotal = EXCLUDED.subtotal,
    delivery_charge = EXCLUDED.delivery_charge,
    total = EXCLUDED.total,
    grand_total = EXCLUDED.grand_total,
    status = EXCLUDED.status,
    payment_status = EXCLUDED.payment_status,
    notes = EXCLUDED.notes,
    email_sent = EXCLUDED.email_sent,
    whatsapp_sent = EXCLUDED.whatsapp_sent,
    updated_at = EXCLUDED.updated_at;

INSERT INTO public.orders (
    id, order_number, customer_id, customer_name, house, city, district, state,
    pin_code, phone_number, items, subtotal, delivery_charge, total, grand_total,
    status, payment_status, notes, email_sent, whatsapp_sent, created_at, updated_at
) VALUES (
    'ord_1790306329244_2244',
    'AQ-20260925-2244',
    NULL,
    'Karthik Raja',
    'Plot 45, Sothupakkam Main Road',
    'Sothupakkam',
    'Chengalpattu',
    'Tamil Nadu',
    '603319',
    '+919876543210',
    '[{"productId":"gf-oranda-red-cap","productName":"Red Cap Oranda Goldfish","variety":"Red Cap","size":"3.5 inch","quantity":2,"unitPrice":900,"subtotal":1800,"image":"https://lh3.googleusercontent.com/aida-public/AB6AXuCe6ajzYgPnKEeMg6lfYrC_4AcF7eKah27k-HVdru1NNy-53eUgKBY6z-81QDjo40OuztuQ_9QvErDgpYIigHMtmcesxajymUhWYjkN4_-U1ah6l-GQIgnUN6PWCB18hwKdoIDCB9rXJJICJxkyy3IrwuNA0O0FiRGtPL0Y-NDh5e1OVoTyNA9PuHMAsP-X7HN6X7fqbg9z8ZXhVF45wM2u-jnQCD_TMNAkXDF4r13lSn-YrqWb7ZeJBg"}]'::jsonb,
    1800,
    0,
    1800,
    1800,
    'Cancelled',
    'Pending',
    NULL,
    TRUE,
    TRUE,
    '2026-09-25T03:18:49.244Z',
    '2026-09-25T13:26:06.612Z'
)
ON CONFLICT (id) DO UPDATE SET
    order_number = EXCLUDED.order_number,
    customer_name = EXCLUDED.customer_name,
    house = EXCLUDED.house,
    city = EXCLUDED.city,
    district = EXCLUDED.district,
    state = EXCLUDED.state,
    pin_code = EXCLUDED.pin_code,
    phone_number = EXCLUDED.phone_number,
    items = EXCLUDED.items,
    subtotal = EXCLUDED.subtotal,
    delivery_charge = EXCLUDED.delivery_charge,
    total = EXCLUDED.total,
    grand_total = EXCLUDED.grand_total,
    status = EXCLUDED.status,
    payment_status = EXCLUDED.payment_status,
    notes = EXCLUDED.notes,
    email_sent = EXCLUDED.email_sent,
    whatsapp_sent = EXCLUDED.whatsapp_sent,
    updated_at = EXCLUDED.updated_at;

-- ==============================================================================
-- 10. SEED DATA: PRICE HISTORY (27 items)
-- ==============================================================================
INSERT INTO public.price_history (id, product_id, old_price, new_price, changed_at, admin_id)
VALUES (
    'ph_1790306329236_3z3m8',
    'gf-oranda-red-cap',
    850,
    900,
    '2026-09-25T03:18:49.236Z',
    '+917845637566'
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    old_price = EXCLUDED.old_price,
    new_price = EXCLUDED.new_price,
    changed_at = EXCLUDED.changed_at,
    admin_id = EXCLUDED.admin_id;

INSERT INTO public.price_history (id, product_id, old_price, new_price, changed_at, admin_id)
VALUES (
    'ph_1790306329250_ujde5',
    'gf-oranda-red-cap',
    900,
    950,
    '2026-09-25T03:18:49.250Z',
    '+917845637566'
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    old_price = EXCLUDED.old_price,
    new_price = EXCLUDED.new_price,
    changed_at = EXCLUDED.changed_at,
    admin_id = EXCLUDED.admin_id;

INSERT INTO public.price_history (id, product_id, old_price, new_price, changed_at, admin_id)
VALUES (
    'ph_1790306547915_fn0dv',
    'gf-oranda-red-cap',
    950,
    123,
    '2026-09-25T03:22:27.914Z',
    '+917845637566'
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    old_price = EXCLUDED.old_price,
    new_price = EXCLUDED.new_price,
    changed_at = EXCLUDED.changed_at,
    admin_id = EXCLUDED.admin_id;

INSERT INTO public.price_history (id, product_id, old_price, new_price, changed_at, admin_id)
VALUES (
    'ph_1790314692699_57vdk',
    'prod-full-spectrum-wrgb-led-light-60cm-1790314692689',
    2450,
    2850,
    '2026-09-25T05:38:12.699Z',
    '+917845637566'
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    old_price = EXCLUDED.old_price,
    new_price = EXCLUDED.new_price,
    changed_at = EXCLUDED.changed_at,
    admin_id = EXCLUDED.admin_id;

INSERT INTO public.price_history (id, product_id, old_price, new_price, changed_at, admin_id)
VALUES (
    'ph_1790314692707_xho1p',
    'prod-full-spectrum-wrgb-led-light-60cm-1790314692689',
    2850,
    3500,
    '2026-09-25T05:38:12.707Z',
    '+917845637566'
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    old_price = EXCLUDED.old_price,
    new_price = EXCLUDED.new_price,
    changed_at = EXCLUDED.changed_at,
    admin_id = EXCLUDED.admin_id;

INSERT INTO public.price_history (id, product_id, old_price, new_price, changed_at, admin_id)
VALUES (
    'ph_1790314726571_09i7n',
    'prod-full-spectrum-wrgb-led-light-60cm-1790314726564',
    2450,
    2850,
    '2026-09-25T05:38:46.571Z',
    '+917845637566'
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    old_price = EXCLUDED.old_price,
    new_price = EXCLUDED.new_price,
    changed_at = EXCLUDED.changed_at,
    admin_id = EXCLUDED.admin_id;

INSERT INTO public.price_history (id, product_id, old_price, new_price, changed_at, admin_id)
VALUES (
    'ph_1790314726589_5ja1n',
    'prod-full-spectrum-wrgb-led-light-60cm-1790314726564',
    2850,
    3500,
    '2026-09-25T05:38:46.589Z',
    '+917845637566'
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    old_price = EXCLUDED.old_price,
    new_price = EXCLUDED.new_price,
    changed_at = EXCLUDED.changed_at,
    admin_id = EXCLUDED.admin_id;

INSERT INTO public.price_history (id, product_id, old_price, new_price, changed_at, admin_id)
VALUES (
    'ph_1790314849744_e590h',
    'prod-pro-canister-filter-1500l-h-1790314849731-1790314849737',
    4500,
    4800,
    '2026-09-25T05:40:49.744Z',
    '+917845637566'
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    old_price = EXCLUDED.old_price,
    new_price = EXCLUDED.new_price,
    changed_at = EXCLUDED.changed_at,
    admin_id = EXCLUDED.admin_id;

INSERT INTO public.price_history (id, product_id, old_price, new_price, changed_at, admin_id)
VALUES (
    'ph_1790314849762_1w1wj',
    'prod-pro-canister-filter-1500l-h-1790314849731-1790314849737',
    4800,
    6000,
    '2026-09-25T05:40:49.762Z',
    '+917845637566'
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    old_price = EXCLUDED.old_price,
    new_price = EXCLUDED.new_price,
    changed_at = EXCLUDED.changed_at,
    admin_id = EXCLUDED.admin_id;

INSERT INTO public.price_history (id, product_id, old_price, new_price, changed_at, admin_id)
VALUES (
    'ph_1790317798500_q9h5j',
    'gf-oranda-red-cap',
    850,
    120,
    '2026-09-25T06:29:58.499Z',
    '+917845637566'
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    old_price = EXCLUDED.old_price,
    new_price = EXCLUDED.new_price,
    changed_at = EXCLUDED.changed_at,
    admin_id = EXCLUDED.admin_id;

INSERT INTO public.price_history (id, product_id, old_price, new_price, changed_at, admin_id)
VALUES (
    'ph_1790317821124_n3ff4',
    'eq-silent-air-pump',
    340,
    130,
    '2026-09-25T06:30:21.122Z',
    '+917845637566'
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    old_price = EXCLUDED.old_price,
    new_price = EXCLUDED.new_price,
    changed_at = EXCLUDED.changed_at,
    admin_id = EXCLUDED.admin_id;

INSERT INTO public.price_history (id, product_id, old_price, new_price, changed_at, admin_id)
VALUES (
    'ph_1790342626135_rjmfs',
    'gf-oranda-red-cap',
    120,
    20,
    '2026-09-25T13:23:46.135Z',
    '+917845637566'
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    old_price = EXCLUDED.old_price,
    new_price = EXCLUDED.new_price,
    changed_at = EXCLUDED.changed_at,
    admin_id = EXCLUDED.admin_id;

INSERT INTO public.price_history (id, product_id, old_price, new_price, changed_at, admin_id)
VALUES (
    'ph_1790342648989_vasrt',
    'gf-oranda-red-cap',
    20,
    100000,
    '2026-09-25T13:24:08.989Z',
    '+917845637566'
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    old_price = EXCLUDED.old_price,
    new_price = EXCLUDED.new_price,
    changed_at = EXCLUDED.changed_at,
    admin_id = EXCLUDED.admin_id;

INSERT INTO public.price_history (id, product_id, old_price, new_price, changed_at, admin_id)
VALUES (
    'ph_1790342666107_fvwxv',
    'gf-oranda-red-cap',
    100000,
    100,
    '2026-09-25T13:24:26.107Z',
    '+917845637566'
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    old_price = EXCLUDED.old_price,
    new_price = EXCLUDED.new_price,
    changed_at = EXCLUDED.changed_at,
    admin_id = EXCLUDED.admin_id;

INSERT INTO public.price_history (id, product_id, old_price, new_price, changed_at, admin_id)
VALUES (
    'ph_1791701360823_0xmq8',
    'gf-oranda-red-cap',
    100,
    1,
    '2026-10-11T06:49:20.823Z',
    '+917845637566'
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    old_price = EXCLUDED.old_price,
    new_price = EXCLUDED.new_price,
    changed_at = EXCLUDED.changed_at,
    admin_id = EXCLUDED.admin_id;

INSERT INTO public.price_history (id, product_id, old_price, new_price, changed_at, admin_id)
VALUES (
    'ph_1791701396532_cwpbv',
    'gf-ryukin-calico',
    750,
    100000000000000000000,
    '2026-10-11T06:49:56.532Z',
    '+917845637566'
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    old_price = EXCLUDED.old_price,
    new_price = EXCLUDED.new_price,
    changed_at = EXCLUDED.changed_at,
    admin_id = EXCLUDED.admin_id;

INSERT INTO public.price_history (id, product_id, old_price, new_price, changed_at, admin_id)
VALUES (
    'ph_1791701419654_sz5zs',
    'gf-ryukin-calico',
    100000000000000000000,
    100,
    '2026-10-11T06:50:19.654Z',
    '+917845637566'
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    old_price = EXCLUDED.old_price,
    new_price = EXCLUDED.new_price,
    changed_at = EXCLUDED.changed_at,
    admin_id = EXCLUDED.admin_id;

INSERT INTO public.price_history (id, product_id, old_price, new_price, changed_at, admin_id)
VALUES (
    'ph_1792292910019_whh65',
    'gf-oranda-red-cap',
    1,
    850,
    '2026-10-18T03:08:30.019Z',
    '+917845637566'
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    old_price = EXCLUDED.old_price,
    new_price = EXCLUDED.new_price,
    changed_at = EXCLUDED.changed_at,
    admin_id = EXCLUDED.admin_id;

INSERT INTO public.price_history (id, product_id, old_price, new_price, changed_at, admin_id)
VALUES (
    'ph_1792293457777_jd41o',
    'gf-oranda-red-cap',
    850,
    80,
    '2026-10-18T03:17:37.777Z',
    '+917845637566'
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    old_price = EXCLUDED.old_price,
    new_price = EXCLUDED.new_price,
    changed_at = EXCLUDED.changed_at,
    admin_id = EXCLUDED.admin_id;

INSERT INTO public.price_history (id, product_id, old_price, new_price, changed_at, admin_id)
VALUES (
    'ph_1792293732221_b7r5g',
    'gf-oranda-red-cap',
    80,
    799,
    '2026-10-18T03:22:12.221Z',
    '+917845637566'
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    old_price = EXCLUDED.old_price,
    new_price = EXCLUDED.new_price,
    changed_at = EXCLUDED.changed_at,
    admin_id = EXCLUDED.admin_id;

INSERT INTO public.price_history (id, product_id, old_price, new_price, changed_at, admin_id)
VALUES (
    'ph_1792293732722_kz9bj',
    'gf-oranda-red-cap',
    799,
    850,
    '2026-10-18T03:22:12.721Z',
    '+917845637566'
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    old_price = EXCLUDED.old_price,
    new_price = EXCLUDED.new_price,
    changed_at = EXCLUDED.changed_at,
    admin_id = EXCLUDED.admin_id;

INSERT INTO public.price_history (id, product_id, old_price, new_price, changed_at, admin_id)
VALUES (
    'ph_1792295805807_sha2m',
    'gf-oranda-red-cap',
    850,
    920,
    '2026-10-18T03:56:45.807Z',
    '+917845637566'
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    old_price = EXCLUDED.old_price,
    new_price = EXCLUDED.new_price,
    changed_at = EXCLUDED.changed_at,
    admin_id = EXCLUDED.admin_id;

INSERT INTO public.price_history (id, product_id, old_price, new_price, changed_at, admin_id)
VALUES (
    'ph_1792295947771_mj4tk',
    'gf-oranda-red-cap',
    920,
    80,
    '2026-10-18T03:59:07.771Z',
    '+917845637566'
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    old_price = EXCLUDED.old_price,
    new_price = EXCLUDED.new_price,
    changed_at = EXCLUDED.changed_at,
    admin_id = EXCLUDED.admin_id;

INSERT INTO public.price_history (id, product_id, old_price, new_price, changed_at, admin_id)
VALUES (
    'ph_1792297086442_9p1uz',
    'gf-oranda-red-cap',
    80,
    890,
    '2026-10-18T04:18:06.442Z',
    '+917845637566'
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    old_price = EXCLUDED.old_price,
    new_price = EXCLUDED.new_price,
    changed_at = EXCLUDED.changed_at,
    admin_id = EXCLUDED.admin_id;

INSERT INTO public.price_history (id, product_id, old_price, new_price, changed_at, admin_id)
VALUES (
    'ph_1792297087029_xzwhp',
    'gf-oranda-red-cap',
    890,
    850,
    '2026-10-18T04:18:07.029Z',
    '+917845637566'
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    old_price = EXCLUDED.old_price,
    new_price = EXCLUDED.new_price,
    changed_at = EXCLUDED.changed_at,
    admin_id = EXCLUDED.admin_id;

INSERT INTO public.price_history (id, product_id, old_price, new_price, changed_at, admin_id)
VALUES (
    'ph_1792307434574_ymwwi',
    'gf-oranda-red-cap',
    850,
    80,
    '2026-10-18T07:10:34.574Z',
    '+917845637566'
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    old_price = EXCLUDED.old_price,
    new_price = EXCLUDED.new_price,
    changed_at = EXCLUDED.changed_at,
    admin_id = EXCLUDED.admin_id;

INSERT INTO public.price_history (id, product_id, old_price, new_price, changed_at, admin_id)
VALUES (
    'ph_1792307517713_nl4k1',
    'gf-ranchu-lionhead',
    1100,
    1250,
    '2026-10-18T07:11:57.712Z',
    '+917845637566'
)
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    old_price = EXCLUDED.old_price,
    new_price = EXCLUDED.new_price,
    changed_at = EXCLUDED.changed_at,
    admin_id = EXCLUDED.admin_id;

-- ==============================================================================
-- 11. SEED DATA: SITE SETTINGS
-- ==============================================================================
INSERT INTO public.settings (id, settings, updated_at)
VALUES (
    'default',
    '{"adminPassword":"bestfish","theme":{"preset":"ocean-teal","primaryColor":"#006572","accentColor":"#cc4729","darkMode":false},"customerInterface":{"storeName":"Dolphin Aquarium","tagline":"Freshwater Specialist & Custom Rimless Tanks","announcement":{"enabled":true,"text":"🌊 Direct live fish transit & delivery across Sothupakkam & Chengalpattu region. Free delivery on orders over ₹1,500!","linkText":"Shop Fish Now","linkUrl":"/fish"},"hero":{"headline":"Dolphin Aquarium","subtitle":"Freshwater Livestock, Custom Rimless Tanks & Aquatic Equipment","bannerImage":"https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=1600&q=80","quarantineBadgeText":"Quarantine Certified","ratingBadgeText":"4.9 (Live Stock)","highlightNotice":"100% Healthy Quarantine Assured. Direct Tank Delivery across Sothupakkam & Chengalpattu region."},"contact":{"address":"No. 5 Monasakthi Valagam, Cheyur - Vandavasi Rd, Sothupakkam, Tamil Nadu 603319","phoneDisplay":"07845637566","phoneDial":"tel:07845637566","whatsappNumber":"917845637566","openHours":"Open 7 days a week: 9:00 AM – 9:00 PM"}}}'::jsonb,
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    settings = EXCLUDED.settings,
    updated_at = EXCLUDED.updated_at;

COMMIT;

-- ==============================================================================
-- VERIFICATION
-- ==============================================================================
SELECT
    (SELECT count(*) FROM public.catalogs) AS total_catalogs,
    (SELECT count(*) FROM public.products) AS total_products,
    (SELECT count(*) FROM public.orders) AS total_orders,
    (SELECT count(*) FROM public.price_history) AS total_price_history,
    (SELECT count(*) FROM public.settings) AS total_settings;