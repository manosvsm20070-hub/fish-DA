-- ==============================================================================
-- Dolphin Aquarium - Complete Supabase Database Schema & Data Migration
-- Generated: 2026-10-18T07:19:25.077Z
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
-- 8. SEED DATA: PRODUCTS (39 items)
-- ==============================================================================
INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'prod-desync-test-999',
    'Desync Upsert Test',
    'Monster Fish',
    '',
    '',
    'Unsexed',
    '[]'::jsonb,
    '',
    999,
    NULL,
    '₹',
    '["Standard"]'::jsonb,
    10,
    'in_stock',
    '',
    NULL,
    TRUE,
    FALSE,
    NULL,
    'Archived',
    '[]'::jsonb,
    '2026-10-18T05:36:37.395Z',
    '2026-10-18T05:36:37.407Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'gf-oranda-red-cap',
    'Red Cap Oranda Goldfish',
    'Goldfish',
    'Oranda',
    'Red Cap',
    'Unsexed',
    '["https://lh3.googleusercontent.com/aida-public/AB6AXuCe6ajzYgPnKEeMg6lfYrC_4AcF7eKah27k-HVdru1NNy-53eUgKBY6z-81QDjo40OuztuQ_9QvErDgpYIigHMtmcesxajymUhWYjkN4_-U1ah6l-GQIgnUN6PWCB18hwKdoIDCB9rXJJICJxkyy3IrwuNA0O0FiRGtPL0Y-NDh5e1OVoTyNA9PuHMAsP-X7HN6X7fqbg9z8ZXhVF45wM2u-jnQCD_TMNAkXDF4r13lSn-YrqWb7ZeJBg","https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCe6ajzYgPnKEeMg6lfYrC_4AcF7eKah27k-HVdru1NNy-53eUgKBY6z-81QDjo40OuztuQ_9QvErDgpYIigHMtmcesxajymUhWYjkN4_-U1ah6l-GQIgnUN6PWCB18hwKdoIDCB9rXJJICJxkyy3IrwuNA0O0FiRGtPL0Y-NDh5e1OVoTyNA9PuHMAsP-X7HN6X7fqbg9z8ZXhVF45wM2u-jnQCD_TMNAkXDF4r13lSn-YrqWb7ZeJBg',
    80,
    100,
    '₹',
    '["3.5 inch","4.5 inch","5.5 inch Jumbo"]'::jsonb,
    14,
    'in_stock',
    'High-grade Fancy Red Cap Oranda with prominent raspberry-textured crimson wen growth and flowing silky white fins. Quarantined for 14 days and conditioned for local tap water.',
    '{"ph":"7.2 - 7.6","temp":"20-24°C","temperament":"Peaceful Community","careLevel":"Beginner","tankMinGallons":30}'::jsonb,
    TRUE,
    TRUE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-10-18T07:10:34.574Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'gf-ryukin-calico',
    'Calico Ryukin Goldfish',
    'Goldfish',
    'Ryukin',
    'Calico',
    'Unsexed',
    '["https://lh3.googleusercontent.com/aida-public/AB6AXuDViXqBf6VmELAJvHhUtBwFzZP03nxnfV5CO_8rNpTmIS6VDVCotPqrlxUUA-fuAFYWKfz_A47GNVWVfkq7Vnmrbk5Q5w25hoFnWkRCYgluBxFDCQZMz3kOmsklYw2XWlweTbbI14YqlULjnloPOdjAL6OMFrZEgIRC214TkDbGFpqZiOBEBH6YyIZGKRl__22nmcukeWK3xN_K8pTE644BwnZPMvPHesR1HZI_InK1Wfpj4Ln5rwEq1g"]'::jsonb,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDViXqBf6VmELAJvHhUtBwFzZP03nxnfV5CO_8rNpTmIS6VDVCotPqrlxUUA-fuAFYWKfz_A47GNVWVfkq7Vnmrbk5Q5w25hoFnWkRCYgluBxFDCQZMz3kOmsklYw2XWlweTbbI14YqlULjnloPOdjAL6OMFrZEgIRC214TkDbGFpqZiOBEBH6YyIZGKRl__22nmcukeWK3xN_K8pTE644BwnZPMvPHesR1HZI_InK1Wfpj4Ln5rwEq1g',
    100,
    850,
    '₹',
    '["3 inch","4 inch","5 inch"]'::jsonb,
    8,
    'in_stock',
    'High arched shoulder hump with magnificent tri-color calico marbling. Energetic swimmer with wide double fantail.',
    '{"ph":"7.2 - 7.6","temp":"18-24°C","temperament":"Peaceful","careLevel":"Intermediate","tankMinGallons":30}'::jsonb,
    TRUE,
    TRUE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-10-11T06:50:19.654Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'gf-black-moor',
    'Black Moor Goldfish',
    'Goldfish',
    'Telescope',
    'Black Moor',
    'Unsexed',
    '["https://lh3.googleusercontent.com/aida-public/AB6AXuBQPq6AFXefOzoyBtBguegYM07bV0ThdsntibX5EehzpljNqf4bBoefhyAVwkNDcl_-IrynMuxMEfnDrqUxQ475kSCsGvGD5IGemHKTAELbJzgXuv6i86iL7-yY-R4TiqfIqeuqNzdPFrNknRY2hYyp-Aerdh81m9VqHpCUxQ43DAbFkrdQF6C9eaKVfvDEoE6M3ZYRLV5NOI2U4AEQtIo1aH2zH0deqpyYkr58HcXFX_RhSHn9jcDLug"]'::jsonb,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBQPq6AFXefOzoyBtBguegYM07bV0ThdsntibX5EehzpljNqf4bBoefhyAVwkNDcl_-IrynMuxMEfnDrqUxQ475kSCsGvGD5IGemHKTAELbJzgXuv6i86iL7-yY-R4TiqfIqeuqNzdPFrNknRY2hYyp-Aerdh81m9VqHpCUxQ43DAbFkrdQF6C9eaKVfvDEoE6M3ZYRLV5NOI2U4AEQtIo1aH2zH0deqpyYkr58HcXFX_RhSHn9jcDLug',
    450,
    NULL,
    '₹',
    '["2.5 inch","3.5 inch"]'::jsonb,
    18,
    'in_stock',
    'Velvety deep matte black scales with protruding telescope eyes and elegant butterfly tail.',
    '{"ph":"7.0 - 7.8","temp":"18-22°C","temperament":"Peaceful","careLevel":"Beginner","tankMinGallons":25}'::jsonb,
    TRUE,
    TRUE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'gf-ranchu-lionhead',
    'aaravana',
    'Monster Fish',
    '',
    'SILVER',
    'Unsexed',
    '["/uploads/img_1792307536894_1jg1bb.webp"]'::jsonb,
    '/uploads/img_1792307536894_1jg1bb.webp',
    1250,
    1500,
    '₹',
    '["5inch"]'::jsonb,
    0,
    'in_stock',
    '',
    '{"ph":"7.2 - 7.6","temp":"20-24°C","temperament":"Calm","careLevel":"Intermediate","tankMinGallons":30}'::jsonb,
    TRUE,
    FALSE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-10-18T07:12:18.105Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'gf-shubunkin-comet',
    'Shubunkin & Sarasa Comet',
    'Goldfish',
    'Single Tail',
    'Shubunkin',
    'Unsexed',
    '["https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=800&q=80',
    180,
    NULL,
    '₹',
    '["3 inch","5 inch Pond Ready"]'::jsonb,
    35,
    'in_stock',
    'Hardy calico single-tail goldfish with blue, red, and black specks. Thrives in indoor aquariums and outdoor garden ponds alike.',
    '{"ph":"6.8 - 8.0","temp":"15-26°C","temperament":"Very Active","careLevel":"Beginner","tankMinGallons":40}'::jsonb,
    TRUE,
    FALSE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'betta-halfmoon-royal-blue',
    'Royal Blue Halfmoon Betta',
    'Betta Fish',
    'Halfmoon',
    'Halfmoon',
    'Male',
    '["https://lh3.googleusercontent.com/aida-public/AB6AXuCLAXDObZy5BCxqWWScFhhJUTlUUOtlct7-sRC8RpkZz4_B-ZwDYLPXdA4ddI6Ehm-pCCM1KPUT0gY_13sC-p00tDf_jb7qzkIpnVXKQP9zuQkeGO6uQIDiOJhnhyhXwJBt0aDOn2QBGfDyvFfSRn4_DS-6EYAnz6rS1ltYyicIppLAPJa_v5gqTUUEP8yUDtfjW2sSJR9rm5n9jRFLxq54l8TeQZzI83FKm2x1Qv7xdCPwPMCvENEYXQ"]'::jsonb,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCLAXDObZy5BCxqWWScFhhJUTlUUOtlct7-sRC8RpkZz4_B-ZwDYLPXdA4ddI6Ehm-pCCM1KPUT0gY_13sC-p00tDf_jb7qzkIpnVXKQP9zuQkeGO6uQIDiOJhnhyhXwJBt0aDOn2QBGfDyvFfSRn4_DS-6EYAnz6rS1ltYyicIppLAPJa_v5gqTUUEP8yUDtfjW2sSJR9rm5n9jRFLxq54l8TeQZzI83FKm2x1Qv7xdCPwPMCvENEYXQ',
    350,
    420,
    '₹',
    '["2.5 inch Show Grade"]'::jsonb,
    12,
    'in_stock',
    'Show-grade Royal Blue Halfmoon Betta displaying a perfect 180° caudal spread. Iridescent shimmering scales of cobalt and indigo.',
    '{"ph":"6.5 - 7.4","temp":"26-28°C","temperament":"Solitary Male / Aggressive to other males","careLevel":"Beginner","tankMinGallons":5}'::jsonb,
    TRUE,
    TRUE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'betta-crowntail-dragon',
    'Red Dragon Crowntail Betta',
    'Betta Fish',
    'Crowntail',
    'Crowntail',
    'Male',
    '["https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    'https://images.unsplash.com/photo-1534043464124-3be32fe000c9?auto=format&fit=crop&w=800&q=80',
    280,
    NULL,
    '₹',
    '["2.5 inch"]'::jsonb,
    9,
    'in_stock',
    'Distinctive crown-like spiked ray finnage with metallic dragon scale coating and fiery red highlights.',
    '{"ph":"6.5 - 7.5","temp":"25-28°C","temperament":"Solitary Male","careLevel":"Beginner","tankMinGallons":5}'::jsonb,
    TRUE,
    FALSE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'betta-dumbo-elephant-ear',
    'Dumbo Ear / Elephant Ear Betta',
    'Betta Fish',
    'Dumbo Ear',
    'Dumbo Ear',
    'Male',
    '["/uploads/img_1792285264807_vxdx8v.png"]'::jsonb,
    '/uploads/img_1792285264807_vxdx8v.png',
    499,
    599,
    '₹',
    '["2.5 inch Specimen"]'::jsonb,
    5,
    'in_stock',
    'Enlarged snow-white pectoral fins that flap gracefully like elephant ears, coupled with platinum pastel body sheen.',
    '{"ph":"6.5 - 7.2","temp":"26-29°C","temperament":"Solitary Male","careLevel":"Intermediate","tankMinGallons":5}'::jsonb,
    TRUE,
    TRUE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-10-18T01:01:06.443Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'fh-king-kamfa',
    'King Kamfa Flowerhorn',
    'Flowerhorn',
    'Kamfa',
    'King Kamfa',
    'Male',
    '["https://lh3.googleusercontent.com/aida-public/AB6AXuDIVnKxsMVYD7RdX8mkD1zasVgLb0erZOPBZg8Wd2YtNgn26Ib9-vP3uHIAwjlVpOYEkQ9nTWVc4xLnq2GHIB_T92Uk24dFB2WvUREh-qmI0NnJKCw1Bq0qSkQdHaHooQqlDIS5gkVUqggePM8lTsFUJA1MR61jmpmYNgAmUlHprQ_hRWl-aAIjXiieyvIs5Bik4cnDak42NADRRlauwZAQCSb0aoxR4x-nIz73LOd_15cNfwfPS125Rg"]'::jsonb,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDIVnKxsMVYD7RdX8mkD1zasVgLb0erZOPBZg8Wd2YtNgn26Ib9-vP3uHIAwjlVpOYEkQ9nTWVc4xLnq2GHIB_T92Uk24dFB2WvUREh-qmI0NnJKCw1Bq0qSkQdHaHooQqlDIS5gkVUqggePM8lTsFUJA1MR61jmpmYNgAmUlHprQ_hRWl-aAIjXiieyvIs5Bik4cnDak42NADRRlauwZAQCSb0aoxR4x-nIz73LOd_15cNfwfPS125Rg',
    3200,
    3800,
    '₹',
    '["4.5 inch Specimen"]'::jsonb,
    3,
    'in_stock',
    'Top-tier King Kamfa with heavy metallic pearl coverage, solid water-head kok development, bold flowerline, and energetic interactive temperament.',
    '{"ph":"7.4 - 8.0","temp":"28-30°C","temperament":"Aggressive / Single Tank Specimen","careLevel":"Intermediate","tankMinGallons":55}'::jsonb,
    TRUE,
    TRUE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'fh-red-dragon',
    'Red Dragon Flowerhorn',
    'Flowerhorn',
    'Zhen Zhu',
    'Red Dragon',
    'Male',
    '["https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=800&q=80',
    1800,
    NULL,
    '₹',
    '["3.5 inch","5 inch"]'::jsonb,
    4,
    'in_stock',
    'Fiery ruby coloration across chest and cheeks, prominent black marking line, and high-intensity sparkle pearls.',
    '{"ph":"7.4 - 8.0","temp":"28-30°C","temperament":"Aggressive","careLevel":"Intermediate","tankMinGallons":50}'::jsonb,
    TRUE,
    FALSE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'guppy-blue-moscow-pair',
    'Blue Moscow Guppy Pair',
    'Guppy',
    'Moscow',
    'Blue Moscow',
    'Pair',
    '["https://lh3.googleusercontent.com/aida-public/AB6AXuA7k0AS3mJNsLm5Imcu4v6oo3Fm6gPEst6ptggHyBOlFxVjhN8KosW-FkczY-unL5fTdbfBsvESEP7oLZ5h1iDXf3pezl_QUNnM4h4VBuYSSp3s7OOFFrCKLRRIv_oJcmi4AUQQ3IY3UdkEGlhDhf-cJcv_OcdES6Lp7veTYW2-zyUWkeFvPG2lA6WNKuZDHKvTVnc5R4QSQDDsKJP0l4maK6oicxHzffReyzB0UcIwY_ll4r-n180apg"]'::jsonb,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA7k0AS3mJNsLm5Imcu4v6oo3Fm6gPEst6ptggHyBOlFxVjhN8KosW-FkczY-unL5fTdbfBsvESEP7oLZ5h1iDXf3pezl_QUNnM4h4VBuYSSp3s7OOFFrCKLRRIv_oJcmi4AUQQ3IY3UdkEGlhDhf-cJcv_OcdES6Lp7veTYW2-zyUWkeFvPG2lA6WNKuZDHKvTVnc5R4QSQDDsKJP0l4maK6oicxHzffReyzB0UcIwY_ll4r-n180apg',
    240,
    300,
    '₹',
    '["1.5 inch Breeding Pair"]'::jsonb,
    22,
    'in_stock',
    'Pure breeding strain of solid blue-black metallic sheen from nose to tail fin. Active shoaling in peaceful planted community setups.',
    '{"ph":"7.0 - 7.8","temp":"24-28°C","temperament":"Peaceful Community","careLevel":"Beginner","tankMinGallons":10}'::jsonb,
    TRUE,
    TRUE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'guppy-koi-dumbo-trio',
    'Koi Guppy Trio Pack',
    'Guppy',
    'Specialty',
    'Koi Guppy',
    'Trio',
    '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    320,
    NULL,
    '₹',
    '["1 Male + 2 Females"]'::jsonb,
    15,
    'in_stock',
    'Exquisite albino red head koi guppy strain with translucent white body and bright crimson head cap. Trio set ready for breeding.',
    '{"ph":"7.0 - 7.5","temp":"24-27°C","temperament":"Peaceful","careLevel":"Beginner","tankMinGallons":10}'::jsonb,
    TRUE,
    FALSE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'molly-black-balloon-pair',
    'Black Balloon Molly Pair',
    'Molly',
    'Balloon',
    'Black Balloon Molly',
    'Pair',
    '["https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=800&q=80',
    140,
    NULL,
    '₹',
    '["1.8 inch Pair"]'::jsonb,
    25,
    'in_stock',
    'Plump, round balloon body morphology with deep velvet black coloration. Excellent algae grazer in community tanks.',
    '{"ph":"7.5 - 8.2","temp":"24-28°C","temperament":"Peaceful","careLevel":"Beginner","tankMinGallons":15}'::jsonb,
    TRUE,
    FALSE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'shark-bala-shark',
    'Bala Shark (Silver Shark)',
    'Aquarium Sharks',
    'Cyprinid',
    'Bala Shark',
    'Unsexed',
    '["https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=800&q=80',
    190,
    NULL,
    '₹',
    '["3 inch","4.5 inch"]'::jsonb,
    20,
    'in_stock',
    'Freshwater schooling fish with sleek torpedo body, reflective silver scales, and black-edged dorsal fins. Peaceful community giant.',
    '{"ph":"6.5 - 7.5","temp":"23-28°C","temperament":"Peaceful / Needs Swimming Space","careLevel":"Intermediate","tankMinGallons":75}'::jsonb,
    TRUE,
    FALSE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'shark-red-tail-black',
    'Red Tail Black Shark',
    'Aquarium Sharks',
    'Labeo',
    'Red Tail Black Shark',
    'Unsexed',
    '["https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80',
    220,
    NULL,
    '₹',
    '["2.5 inch","3.5 inch"]'::jsonb,
    11,
    'in_stock',
    'Dramatic contrast of jet black body with bright vermillion red tail fin. Territorial bottom grazer optimal for semi-aggressive tanks.',
    '{"ph":"6.8 - 7.6","temp":"24-27°C","temperament":"Semi-Aggressive / Territorial","careLevel":"Intermediate","tankMinGallons":40}'::jsonb,
    TRUE,
    FALSE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'prod-aaravna-silver',
    'aaravna',
    'Monster Fish',
    'Arowana',
    'Silver',
    'Unsexed',
    '["https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=800&q=80',
    1200,
    1500,
    '₹',
    '["5 inch"]'::jsonb,
    3,
    'in_stock',
    'High-grade Silver Arowana juvenile with luminous platinum sheen and magnificent flowing barbels. Highly active surface swimmer.',
    '{"ph":"6.5 - 7.5","temp":"24-28°C","temperament":"Predatory Monster Fish","careLevel":"Intermediate","tankMinGallons":100}'::jsonb,
    TRUE,
    TRUE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-10-18T00:00:00.000Z',
    '2026-10-18T05:36:37.386Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'monster-alligator-gar',
    'Alligator Gar (Freshwater Gar)',
    'Monster Fish',
    'Gars',
    'Alligator Gar',
    'Unsexed',
    '["https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=800&q=80',
    950,
    NULL,
    '₹',
    '["6 inch Juvenile","10 inch"]'::jsonb,
    5,
    'in_stock',
    'Prehistoric apex predator with armored ganoid scales and alligator-like snout. Requires massive aquarium setup or custom pond.',
    '{"ph":"6.8 - 7.8","temp":"22-28°C","temperament":"Predatory Monster Fish","careLevel":"Expert","tankMinGallons":150}'::jsonb,
    TRUE,
    TRUE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'catfish-redtail',
    'Redtail Catfish (RTC)',
    'Catfish',
    'Monster Catfish',
    'Redtail Catfish',
    'Unsexed',
    '["https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=800&q=80',
    800,
    NULL,
    '₹',
    '["4 inch Juvenile","7 inch"]'::jsonb,
    7,
    'in_stock',
    'Iconic Amazonian bottom titan with wide whiskers, dark charcoal dorsal, ivory white belly, and brilliant orange-red tail.',
    '{"ph":"6.5 - 7.5","temp":"24-28°C","temperament":"Peaceful with same-size giants / Predatory","careLevel":"Expert","tankMinGallons":200}'::jsonb,
    TRUE,
    FALSE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'danio-glofish-pack',
    'GloFish & Zebra Danio School',
    'Zebra Danio',
    'Danio',
    'GloFish Zebra Danio',
    'Unsexed',
    '["https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80',
    250,
    NULL,
    '₹',
    '["Pack of 6 Assorted"]'::jsonb,
    40,
    'in_stock',
    'Hyper-active fluorescent colors (Electric Green, Sunburst Orange, Cosmic Blue) shoaling tightly under aquarium LED lights.',
    '{"ph":"6.8 - 7.5","temp":"22-26°C","temperament":"Peaceful Schooling","careLevel":"Beginner","tankMinGallons":10}'::jsonb,
    TRUE,
    FALSE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'tank-rimless-ultra-clear',
    'Ultra-Clear Rimless Glass Tank',
    'Aquarium Tanks',
    'Rimless',
    'Low-Iron Glass',
    'Unsexed',
    '["https://lh3.googleusercontent.com/aida-public/AB6AXuDGJ5M5Rp1MoTTdC7hdXt-Qr1JBMEbakdFoPayZUxOBsQTCN7g4gi7xALAJoW8vTCqnsdrxtFbsfO_JVwKynfrcniSq2dQ87ZfN1nAaqMdY7T4AFI8uNk10z8cHMV7i8io7NYcTklH7thRrORC_xnIoB_RhowVUWIExAxuDnc8_Vor5uG_KjhqGzW_rMta-QZXysEuKL6WWsEH-MmWhAliyKstzU7Dffy7Hl7w-JDxY5dEuGP1P7JGk1A","https://lh3.googleusercontent.com/aida-public/AB6AXuBq7Ze_43gk2q0UeKCJO8P_bHvlZD4wuqXvwJjBICmJ3mzcFm-b2GViIlNHL08E__oLGZS136TrjON2Ntzj7vZaqiEvvWvO1QILqcluAjh5jvPsBPMfJwFszcxhoPW7-_W0EQGVIS2TzDUmT_rkPfYOB7BR4_0jvs--kl7SS5qifL1eAhapC6AGo2clX10Y32gR7mAoXeqTismOhDi8dHMGNXWiNkGJr80G3lpUL0W4lySdAASTdCkjCQ"]'::jsonb,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDGJ5M5Rp1MoTTdC7hdXt-Qr1JBMEbakdFoPayZUxOBsQTCN7g4gi7xALAJoW8vTCqnsdrxtFbsfO_JVwKynfrcniSq2dQ87ZfN1nAaqMdY7T4AFI8uNk10z8cHMV7i8io7NYcTklH7thRrORC_xnIoB_RhowVUWIExAxuDnc8_Vor5uG_KjhqGzW_rMta-QZXysEuKL6WWsEH-MmWhAliyKstzU7Dffy7Hl7w-JDxY5dEuGP1P7JGk1A',
    2450,
    2800,
    '₹',
    '["1.0 ft (30cm)","1.5 ft (45cm)","2.0 ft (60cm)","3.0 ft (90cm)"]'::jsonb,
    10,
    'in_stock',
    'High-transparency low-iron glass for distortion-free aquascaping and vivid natural biotope displays. 45° miter edge with premium German clear silicone.',
    NULL,
    FALSE,
    TRUE,
    '{"Glass":"Low-Iron Crystal Clear (91% light transmittance)","Bevel":"45-Degree Miter Joint","Silicone":"Wacker High-Tensile Clear","Mat":"High-density leveling mat included"}'::jsonb,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'tank-custom-made-to-size',
    'Custom Made-to-Size Aquarium Tank',
    'Custom Tanks',
    'Custom Built',
    'Custom Spec',
    'Unsexed',
    '["https://lh3.googleusercontent.com/aida-public/AB6AXuBq7Ze_43gk2q0UeKCJO8P_bHvlZD4wuqXvwJjBICmJ3mzcFm-b2GViIlNHL08E__oLGZS136TrjON2Ntzj7vZaqiEvvWvO1QILqcluAjh5jvPsBPMfJwFszcxhoPW7-_W0EQGVIS2TzDUmT_rkPfYOB7BR4_0jvs--kl7SS5qifL1eAhapC6AGo2clX10Y32gR7mAoXeqTismOhDi8dHMGNXWiNkGJr80G3lpUL0W4lySdAASTdCkjCQ"]'::jsonb,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBq7Ze_43gk2q0UeKCJO8P_bHvlZD4wuqXvwJjBICmJ3mzcFm-b2GViIlNHL08E__oLGZS136TrjON2Ntzj7vZaqiEvvWvO1QILqcluAjh5jvPsBPMfJwFszcxhoPW7-_W0EQGVIS2TzDUmT_rkPfYOB7BR4_0jvs--kl7SS5qifL1eAhapC6AGo2clX10Y32gR7mAoXeqTismOhDi8dHMGNXWiNkGJr80G3lpUL0W4lySdAASTdCkjCQ',
    4999,
    NULL,
    '₹',
    '["Custom 3ft-6ft","Cabinet Set","In-Wall Sump Setup"]'::jsonb,
    20,
    'in_stock',
    'Engineered bespoke aquariums built to your exact wall or cabinet dimensions. 8mm to 19mm toughened or low-iron glass with bottom drainage sumps.',
    NULL,
    FALSE,
    TRUE,
    '{"Dimensions":"Bespoke to Client Request","GlassOptions":"Toughened / Low-Iron Float Glass","Delivery":"Direct store delivery across Sothupakkam & Chengalpattu region"}'::jsonb,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'bowl-high-clarity-glass',
    'High-Clarity Round Fish Bowl',
    'Aquarium Bowls',
    'Glass Bowls',
    'Heavy Cast Bubble',
    'Unsexed',
    '["https://lh3.googleusercontent.com/aida-public/AB6AXuCQBhOPQIUrDTTnHcT8vSB7YeWKDSFrQ08V35U8qZU1pTLLOanb2nuBQP283d62dlRNezVLOjipoxwrHH1nPQlYB0nk9R09PD0fUzheK6wXpCCwA11TAkVj1JFA7JUXjGUJe7mCWi4IoQsjvJtFJnn9AhL-v7CXxS0dxY1DAgrASGW6vcdD9EpgYPRYNdHZ0n3T8nYL6XFjiW_5d1LRiotLDvihTOrla9aABqBn8QuEPmm3Jjw9gwD6Eg"]'::jsonb,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCQBhOPQIUrDTTnHcT8vSB7YeWKDSFrQ08V35U8qZU1pTLLOanb2nuBQP283d62dlRNezVLOjipoxwrHH1nPQlYB0nk9R09PD0fUzheK6wXpCCwA11TAkVj1JFA7JUXjGUJe7mCWi4IoQsjvJtFJnn9AhL-v7CXxS0dxY1DAgrASGW6vcdD9EpgYPRYNdHZ0n3T8nYL6XFjiW_5d1LRiotLDvihTOrla9aABqBn8QuEPmm3Jjw9gwD6Eg',
    380,
    450,
    '₹',
    '["Mini (6\")","Small (8\")","Medium (10\")","Large (12\")","Extra Large (14\")"]'::jsonb,
    30,
    'in_stock',
    'Seamless crystal bubble bowl optimal for Betta splendens, aquatic moss spheres, and desk aquascapes. Thick weighted base prevents tipping.',
    NULL,
    FALSE,
    FALSE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'eq-silent-air-pump',
    'Dual Outlet Silent Air Pump',
    'Motors & Pumps',
    'Air Pumps',
    'Dual Outlet',
    'Unsexed',
    '["https://lh3.googleusercontent.com/aida-public/AB6AXuBx2NGC_44n_qdxhaH3YhU3_gcKpZSXPcgWn6l_BZjJo8nMaXEiqQnDLzRGPviOi6gq1PrXUTLT0y81Qbqj9y-pXRb1dEskvtXs5G4b1wKcKtqk-0doQLQClnzPZlUH79NIW6SgeCMrSlJ6sOiZuk5XwcUJK2I1Vv-uG5EHfaAr0C3wkKBu5sJVeITlAQFvjvE8zGH59Q_IAL4IovbfYno7br4sfIMnfbTvyOX3Sq1TZVQazN3Cg4bsDQ"]'::jsonb,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBx2NGC_44n_qdxhaH3YhU3_gcKpZSXPcgWn6l_BZjJo8nMaXEiqQnDLzRGPviOi6gq1PrXUTLT0y81Qbqj9y-pXRb1dEskvtXs5G4b1wKcKtqk-0doQLQClnzPZlUH79NIW6SgeCMrSlJ6sOiZuk5XwcUJK2I1Vv-uG5EHfaAr0C3wkKBu5sJVeITlAQFvjvE8zGH59Q_IAL4IovbfYno7br4sfIMnfbTvyOX3Sq1TZVQazN3Cg4bsDQ',
    130,
    420,
    '₹',
    '["Single Outlet (2.5W)","Dual Outlet (5W)","High-Power (8W)"]'::jsonb,
    25,
    'in_stock',
    'Ultra-quiet magnetic compression diaphragm air pump with dual adjustable outlets for air stones and sponge filtration.',
    NULL,
    FALSE,
    TRUE,
    '{"Power":"5 Watts","Noise":"< 30 dB","Airflow":"2 x 3.5 L/min","Voltage":"220V - 240V 50Hz"}'::jsonb,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-25T06:30:21.122Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'eq-sponge-filter-bio',
    'Biochemical Sponge Filter Set',
    'Filters',
    'Biological Filtration',
    'Bio-Sponge',
    'Unsexed',
    '["https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    'https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=800&q=80',
    160,
    NULL,
    '₹',
    '["Single Bio-Foam","Double Bio-Foam with Media Chamber"]'::jsonb,
    35,
    'in_stock',
    'Essential biological filter safe for baby fry, shrimp, and delicate goldfish. Cultivates massive beneficial nitrifying bacteria colonies.',
    NULL,
    FALSE,
    FALSE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'eq-submersible-pump',
    'Submersible Powerhead Water Pump',
    'Motors & Pumps',
    'Water Pumps',
    'Internal Submersible',
    'Unsexed',
    '["https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=800&q=80',
    480,
    550,
    '₹',
    '["800 L/H","1200 L/H","2500 L/H Wavemaker"]'::jsonb,
    14,
    'in_stock',
    'Fully submersible, energy-efficient motor for top filter boxes, fountain heads, and sump circulations.',
    NULL,
    FALSE,
    FALSE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'med-general-fish-cure',
    'General Fish Care Medicine (200ml)',
    'Fish Medicines',
    'General Care',
    'Broad Spectrum',
    'Unsexed',
    '["https://lh3.googleusercontent.com/aida-public/AB6AXuDnOs-S2KcpBg6cKwVHiPleCgJJ-W4xvqjENeqnj2KvDMvS2f0SW2XZO9WO2D0OIhKYDJXKHPetyRbTkuLtiH2PPA7eo8wUYr6TlpAnYVczPHiYFbqEE9l6jclimg2qanvFA7Fp9Ac-m1OCWZpjJ3_C8mikKXhHtyJo4pFRuOjb9puXE3qV7JroUmAqlKpOS2OcWgVICUUHFT3vm461pmx6DaC9Wo6MIPh2AYTHIpoADX4kllnWorhpxw"]'::jsonb,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDnOs-S2KcpBg6cKwVHiPleCgJJ-W4xvqjENeqnj2KvDMvS2f0SW2XZO9WO2D0OIhKYDJXKHPetyRbTkuLtiH2PPA7eo8wUYr6TlpAnYVczPHiYFbqEE9l6jclimg2qanvFA7Fp9Ac-m1OCWZpjJ3_C8mikKXhHtyJo4pFRuOjb9puXE3qV7JroUmAqlKpOS2OcWgVICUUHFT3vm461pmx6DaC9Wo6MIPh2AYTHIpoADX4kllnWorhpxw',
    160,
    NULL,
    '₹',
    '["100 ml Bottle","200 ml Bottle with Dosage Cap"]'::jsonb,
    45,
    'in_stock',
    'Broad-spectrum general wellness solution for quarantine tanks and routine water balancing. Product details available in store.',
    NULL,
    FALSE,
    TRUE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'med-anti-fungal-bacterial',
    'Anti-Fungal & Anti-Bacterial Treatment',
    'Fish Medicines',
    'Pathogen Control',
    'Anti-Fungal',
    'Unsexed',
    '["https://lh3.googleusercontent.com/aida-public/AB6AXuDOk94jw-fQUCwa_UDYKBt_VaUW0I58287ovu9ms-ZZQyJAE9SAmFiHEskJ2H_2iVhR4ZOAo0TzYXRd1swco33b-fHPnFb0yDr-PY6vPNwGmYONsQEmMHYcPZROxuF8hwUPN77vqV8gTRvkFlq65mUaYLUHi1BjgxWLp3GnCh57KcwNwevcFhBDcqIVQfXKawRzk1-qydMunWCUEujr9_8ciGegtLL5ygW3SRf7XjAtlz8X95pHLp8LTw"]'::jsonb,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDOk94jw-fQUCwa_UDYKBt_VaUW0I58287ovu9ms-ZZQyJAE9SAmFiHEskJ2H_2iVhR4ZOAo0TzYXRd1swco33b-fHPnFb0yDr-PY6vPNwGmYONsQEmMHYcPZROxuF8hwUPN77vqV8gTRvkFlq65mUaYLUHi1BjgxWLp3GnCh57KcwNwevcFhBDcqIVQfXKawRzk1-qydMunWCUEujr9_8ciGegtLL5ygW3SRf7XjAtlz8X95pHLp8LTw',
    220,
    NULL,
    '₹',
    '["150 ml"]'::jsonb,
    28,
    'in_stock',
    'Specialized aquarium care treatment for fin rot, white spots, and fuzzy growth. Product details available in store.',
    NULL,
    FALSE,
    FALSE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'med-water-conditioner-instant',
    'Instant Water Conditioner & Dechlorinator',
    'Fish Medicines',
    'Water Prep',
    'Anti-Chlorine',
    'Unsexed',
    '["https://lh3.googleusercontent.com/aida-public/AB6AXuDmbi-5FMeRwwgCtWCSUdaXe4ZsJThKmRmF6PsubIxVim3buPe49VggMulw5740aGu5FC_JTSjuBAhgIxiEp4gX-jdCIsOk92VNvJHYBsw1fp7T0KTX4AOIiABOn7Sb4f36Gq31GedoP2cDXSdT5Swa0aydTHb-7Lsn0AmcXfxHMNs3NStw7VwCptPTXkKccBq1TH7gEg1X3i-KRYI99wnLQImMcDX-JViOTT6ez-E3k7XI4o2Jd4Zk1g"]'::jsonb,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDmbi-5FMeRwwgCtWCSUdaXe4ZsJThKmRmF6PsubIxVim3buPe49VggMulw5740aGu5FC_JTSjuBAhgIxiEp4gX-jdCIsOk92VNvJHYBsw1fp7T0KTX4AOIiABOn7Sb4f36Gq31GedoP2cDXSdT5Swa0aydTHb-7Lsn0AmcXfxHMNs3NStw7VwCptPTXkKccBq1TH7gEg1X3i-KRYI99wnLQImMcDX-JViOTT6ez-E3k7XI4o2Jd4Zk1g',
    180,
    NULL,
    '₹',
    '["250 ml (Treats 2500 Liters)"]'::jsonb,
    50,
    'in_stock',
    'Instantly removes harmful chlorine and binds heavy metals from fresh tap water. Adds protective slime coat aloe barrier.',
    NULL,
    FALSE,
    TRUE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'med-aquarium-salt-1kg',
    'Pure Aquarium Mineral Salt (1kg)',
    'Fish Medicines',
    'Salts & Minerals',
    'Aquarium Salt',
    'Unsexed',
    '["https://lh3.googleusercontent.com/aida-public/AB6AXuAhTN9w6BbuR1j0Qw0wgIzWGyE4atuIleEzZS_uDrtUGqFL27BuIVp9yZWC6R90A_crw92byq8SPBTmpy3xd1Gr5Djc896vCyLAqC9AzqNy2cPLsBO3QxeaTyg-zd8-w8Xu4sPkGVgxTL8aENnYj4TykdcwuDqeCId59vbMApZzmo9nS0yBeXq_8zDkaDrTcPdxWkTjod5r56ktyYX4S38hsos3uQZt9ib8dRPDrXctV1jEXAFRVnlVyg"]'::jsonb,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAhTN9w6BbuR1j0Qw0wgIzWGyE4atuIleEzZS_uDrtUGqFL27BuIVp9yZWC6R90A_crw92byq8SPBTmpy3xd1Gr5Djc896vCyLAqC9AzqNy2cPLsBO3QxeaTyg-zd8-w8Xu4sPkGVgxTL8aENnYj4TykdcwuDqeCId59vbMApZzmo9nS0yBeXq_8zDkaDrTcPdxWkTjod5r56ktyYX4S38hsos3uQZt9ib8dRPDrXctV1jEXAFRVnlVyg',
    120,
    NULL,
    '₹',
    '["1 kg Tub"]'::jsonb,
    60,
    'in_stock',
    'Non-iodized pure minerals for freshwater gill aeration and osmotic regulation during water changes or recovery.',
    NULL,
    FALSE,
    FALSE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'food-goldfish-pellets',
    'Goldfish Color Enhancing Pellets',
    'Fish Food',
    'Pellets',
    'Goldfish Food',
    'Unsexed',
    '["https://lh3.googleusercontent.com/aida-public/AB6AXuAZSHHhemWL0UObS4S3FVwkgMINj0Wj20qnQRtZGdbaF8aZaPbNp83NhAL6A_la3Am_8505qZ-M1YFRyL_huur9Zqp01AFHO-soWAbPiR1kg-0q0cpLHnVO73yM3cQ2oMgyYKg4PksGl_tFNIHoLYzWOmqeZQSZRDHJ7wwClqRqxrAr0Vih7Q5efcWYuSv6QYXwS_MFzIW2KXmaJCPKUWzMSjVBzKAzDCYuRgnR1dZUrLLSXOXUjwMn7Q"]'::jsonb,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAZSHHhemWL0UObS4S3FVwkgMINj0Wj20qnQRtZGdbaF8aZaPbNp83NhAL6A_la3Am_8505qZ-M1YFRyL_huur9Zqp01AFHO-soWAbPiR1kg-0q0cpLHnVO73yM3cQ2oMgyYKg4PksGl_tFNIHoLYzWOmqeZQSZRDHJ7wwClqRqxrAr0Vih7Q5efcWYuSv6QYXwS_MFzIW2KXmaJCPKUWzMSjVBzKAzDCYuRgnR1dZUrLLSXOXUjwMn7Q',
    150,
    190,
    '₹',
    '["100g Pouch","250g Pouch","500g Economy Tub"]'::jsonb,
    40,
    'in_stock',
    'Natural astaxanthin and 12% spirulina to enhance vivid red and golden hues without clouding water. Floating slow-sinking mini pellets.',
    NULL,
    FALSE,
    TRUE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'food-betta-bloodworms',
    'Betta Micro & Freeze-Dried Bloodworms',
    'Fish Food',
    'Specialty Food',
    'Betta Food',
    'Unsexed',
    '["https://lh3.googleusercontent.com/aida-public/AB6AXuDB3s2Rp54RtjJGmy_4uOcySXsoNZY_DCs5J8b5J8wITLrKhuv7KAX-RaIYAAmochvyRQEIAQZnLHoOn3ZQS3tugKlRDsIeCxcjzUiSR9JGr1VZ5VPXlqgc_nQ0xfYtII0t8cEFeicvHowb_aq1cbvYOOALFBZ8ZUnHtWoozUmllT0pVJb2Hh5RNKjHRLawmqyG7PK2RICmmQEovvl5CXJX3wmGw0AG52ilyX6rSaA6u1A9vJkDg38ksw"]'::jsonb,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDB3s2Rp54RtjJGmy_4uOcySXsoNZY_DCs5J8b5J8wITLrKhuv7KAX-RaIYAAmochvyRQEIAQZnLHoOn3ZQS3tugKlRDsIeCxcjzUiSR9JGr1VZ5VPXlqgc_nQ0xfYtII0t8cEFeicvHowb_aq1cbvYOOALFBZ8ZUnHtWoozUmllT0pVJb2Hh5RNKjHRLawmqyG7PK2RICmmQEovvl5CXJX3wmGw0AG52ilyX6rSaA6u1A9vJkDg38ksw',
    130,
    NULL,
    '₹',
    '["40g Micro Pellets","20g Freeze Dried Worm Cubes"]'::jsonb,
    35,
    'in_stock',
    'High protein insect-based micro pellets sized perfectly for the upturned mouth of Betta fish. Promotes fin growth and intense coloration.',
    NULL,
    FALSE,
    FALSE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'hardscape-dragon-stone',
    'Natural Dragon Stone (Ohko Stone)',
    'Aquarium Stones',
    'Aquascaping Rock',
    'Dragon Stone',
    'Unsexed',
    '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    320,
    NULL,
    '₹',
    '["1 kg Pack","3 kg Pack","5 kg Aquascaper Box"]'::jsonb,
    30,
    'in_stock',
    'Clay-like cratered textures with dramatic holes for planting aquatic mosses and creating miniature mountain scapes. 100% inert and water safe.',
    NULL,
    FALSE,
    TRUE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'hardscape-colored-gravel-blue',
    'Premium Aquascape Colored Gravel',
    'Colored Gravel',
    'Substrate',
    'Blue Gravel',
    'Unsexed',
    '["https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80',
    90,
    NULL,
    '₹',
    '["1 kg Bag","2 kg Bag","5 kg Bag (Multi-Color / Black / White / Blue)"]'::jsonb,
    50,
    'in_stock',
    'Smooth polymer-coated aquarium gravel with zero sharp edges. Non-toxic color fast coating that will not alter water pH or hardness.',
    NULL,
    FALSE,
    FALSE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'gear-aquarium-nets',
    'Fine Mesh Aquarium Fish Catch Net',
    'Aquarium Nets',
    'Tools',
    'Fish Net',
    'Unsexed',
    '["https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=800&q=80',
    60,
    NULL,
    '₹',
    '["3\" Betta Net","5\" Medium Net","8\" Large Net","12\" Monster Fish Net"]'::jsonb,
    40,
    'in_stock',
    'Soft nylon mesh woven tightly to prevent snagging delicate fish fins. Sturdy vinyl-wrapped steel wire handle for easy reach.',
    NULL,
    FALSE,
    FALSE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'decor-driftwood-aquascaping',
    'Natural Bogwood & Driftwood Roots',
    'Decorations',
    'Hardscape',
    'Driftwood',
    'Unsexed',
    '["https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    450,
    NULL,
    '₹',
    '["Small (6-8\")","Medium (10-14\")","Large Centerpiece Branch"]'::jsonb,
    12,
    'in_stock',
    'Pre-cured natural hardwood branches providing beneficial natural tannins and hideouts for plecos, catfish, and dwarf cichlids.',
    NULL,
    FALSE,
    FALSE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'plant-live-anubias-moss',
    'Live Anubias Barteri on Lava Rock',
    'Aquarium Plants',
    'Live Plants',
    'Anubias',
    'Unsexed',
    '["https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80',
    250,
    NULL,
    '₹',
    '["Attached to Red Lava Stone"]'::jsonb,
    18,
    'in_stock',
    'Hardy low-tech aquatic plant that does not require CO2 or high lighting. Rooted firmly onto porous lava stone ready to place in tank.',
    NULL,
    FALSE,
    FALSE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'acc-full-spectrum-led-light',
    'Full Spectrum Aquascaping LED Clip Light',
    'Accessories',
    'Lighting',
    'LED Lighting',
    'Unsexed',
    '["https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    550,
    650,
    '₹',
    '["Nano (10W)","Mid Tank 1.5ft (18W)","Extendable 2ft-3ft (24W)"]'::jsonb,
    16,
    'in_stock',
    'High PAR output daylight LEDs with dedicated RGB diodes to illuminate live fish scales and promote aquatic plant photosynthesis.',
    NULL,
    FALSE,
    FALSE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z'
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

INSERT INTO public.products (
    id, name, category, sub_category, variety, gender, images, primary_image,
    price, original_price, currency, sizes, stock, availability, description,
    water_params, is_live_fish, featured, specs, status, tags, created_at, updated_at
) VALUES (
    'acc-submersible-heater-100w',
    'Auto-Thermostat Submersible Aquarium Heater',
    'Accessories',
    'Heating',
    'Heater',
    'Unsexed',
    '["https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=800&q=80"]'::jsonb,
    'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=800&q=80',
    390,
    NULL,
    '₹',
    '["50W (For bowls/small tanks)","100W","200W (Large aquariums)"]'::jsonb,
    22,
    'in_stock',
    'Shock-resistant quartz glass tube with calibrated temperature dial (20°C to 34°C) and automatic shut-off safety sensor.',
    NULL,
    FALSE,
    FALSE,
    NULL,
    'Published',
    '[]'::jsonb,
    '2026-09-01T00:00:00.000Z',
    '2026-09-24T00:00:00.000Z'
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