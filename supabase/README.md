# Dolphin Aquarium - Supabase Database Setup & Migration

This directory contains the SQL migration and schema scripts to power the **Dolphin Aquarium** database on Supabase.

---

## 📁 Files Included

- **[`schema.sql`](./schema.sql)** & **[`schema_and_data.sql`](./schema_and_data.sql)**:
  Complete, production-ready SQL script that creates all tables, indexes, Row Level Security (RLS) policies, and seeds all live data:
  - **Catalogs** (25 categories: Goldfish, Betta, Guppy, Monster Fish, Tanks, Filters, Accessories, etc.)
  - **Products** (39 items with full descriptions, high-res photos, specs, water parameters, and `aaravna`)
  - **Orders** (7 customer orders with line items, addresses, statuses, and payment tracking)
  - **Price History** (25 historical price change audit log records)
  - **Settings** (Store address, announcement banner, contact numbers, and theme config)

---

## 🚀 How to Run the Migration in Supabase (3 Simple Steps)

### Step 1: Open Supabase SQL Editor
1. Log into your Supabase Dashboard:
   **[https://supabase.com/dashboard/project/msurviccmuyruckyjbwf](https://supabase.com/dashboard/project/msurviccmuyruckyjbwf)**
2. In the left navigation menu, click on **SQL Editor** (icon `>_`).
3. Click on **+ New query**.

### Step 2: Paste the SQL
1. Open the [`supabase/schema.sql`](./schema.sql) file.
2. Copy the entire contents.
3. Paste into the Supabase SQL Editor window.

### Step 3: Run the Query
1. Click the green **Run** button (or press `Cmd + Enter` on Mac / `Ctrl + Enter` on Windows).
2. The query will execute inside an atomic transaction (`BEGIN; ... COMMIT;`).
3. At the bottom, you will see the verification result:
   ```json
   {
     "total_catalogs": 25,
     "total_products": 39,
     "total_orders": 7,
     "total_price_history": 25,
     "total_settings": 1
   }
   ```

---

## 🛡️ Row Level Security (RLS) & Access Rules

All tables are protected with PostgreSQL Row Level Security:

| Table | Public Access | Admin / Service Role Access |
|---|---|---|
| `catalogs` | `SELECT` (Read active categories) | `ALL` (Insert, Update, Delete) |
| `products` | `SELECT` (Read published products) | `ALL` (Insert, Update, Delete) |
| `orders` | `INSERT`, `SELECT` (Create orders & view) | `ALL` (Manage orders) |
| `price_history` | - | `ALL` (Full audit access) |
| `settings` | `SELECT` (Read store info & theme) | `ALL` (Update store config) |

---

## ⚡ Re-generating the SQL Script

If you add new products or update catalogs locally, you can regenerate this SQL file anytime:

```bash
npm run supabase:generate
```
This runs `scripts/generate-supabase-sql.js` and updates both `supabase/schema.sql` and `supabase/schema_and_data.sql`.
