# 🐬 Dolphin Aquarium

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Turbopack](https://img.shields.io/badge/Turbopack-Enabled-brightgreen?style=for-the-badge)

**A modern, full-featured e-commerce and catalog platform for Dolphin Aquarium — specializing in freshwater fish, custom rimless tanks, filtration systems, and aquatic accessories.**

[Live Demo](#) · [Key Features](#-key-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started)

</div>

---

## 📖 Overview

**Dolphin Aquarium** is a fast, responsive e-commerce web application built for an aquarium business in Sothupakkam, Tamil Nadu. It provides customers with a rich browsing experience across livestock (fancy goldfish, betta fish, flowerhorns, monster fish) and supplies (tanks, filters, lights, foods, medicines, gravel, plants, and accessories), paired with seamless checkout and WhatsApp order placement.

---

## ✨ Key Features

- 🐠 **Comprehensive Livestock & Supplies Catalog:** Filterable categories covering Freshwater Fish, Rimless Tanks, Bowls, Filtration & Pumps, Nutrition & Fish Food, Medication, Aquarium Plants, and Decor.
- 📐 **Custom Rimless Tank Showcase:** Dedicated pages and quotation inquiries for custom-sized rimless glass aquariums.
- 🛒 **Shopping Cart & Checkout:** Real-time cart state management with persistent storage, item count updates, and quantity controls.
- 💬 **WhatsApp Order Routing & Floating Chat:** Direct-to-WhatsApp one-click order confirmation pre-populated with cart details and customer shipping info.
- 🔐 **Admin Dashboard & Catalog Management:**
  - Secure phone & password authentication.
  - Catalog and price history tracking.
  - Order viewing and status updates.
- 📱 **Mobile-First & App-Like UX:** Smooth bottom navigation bar on mobile devices, modern glassmorphism UI touches, and sticky search & category filters.
- ⚡ **Turbopack Powered:** Lightning-fast HMR and build performance with Next.js 16 and React 19.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| **Library** | [React 19](https://react.dev) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) + PostCSS |
| **Icons** | [Lucide React](https://lucide.dev) |
| **Fonts** | Google Fonts (`Plus Jakarta Sans`, `Inter`) |
| **Data Storage** | Local JSON data store (`data/products.json`, `data/orders.json`, `data/catalogs.json`) |

---

## 📁 Directory Structure

```text
├── data/                  # Local JSON data store (products, orders, catalogs, price history)
├── public/                # Static assets, icons, product images
├── src/
│   ├── app/               # Next.js App Router (pages & API routes)
│   │   ├── (categories)/  # fish, tanks, equipment, food, medicines, etc.
│   │   ├── admin/         # Admin management interface
│   │   ├── api/           # Backend API routes (admin, catalog, orders)
│   │   ├── cart/          # Cart page
│   │   ├── checkout/      # Checkout flow
│   │   └── product/       # Dynamic product detail pages
│   ├── components/        # Reusable UI components (ProductCard, Header, BottomNav, etc.)
│   ├── context/           # React Context providers (CartContext)
│   ├── lib/               # Utility functions & storage helpers
│   └── types/             # TypeScript definitions & schemas
├── .env.example           # Template for environment variables
├── next.config.ts         # Next.js configuration
├── package.json           # Project dependencies and scripts
└── tsconfig.json          # TypeScript compiler configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or higher
- **npm**, **yarn**, or **pnpm**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/manosvsm20070-hub/fish-DA.git
   cd fish-DA
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env.local` and set your credentials:
   ```bash
   cp .env.example .env.local
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the application:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Variables

See [`.env.example`](.env.example) for all available options:

```ini
# Shop Details
NEXT_PUBLIC_SHOP_NAME="Dolphin Aquarium"
NEXT_PUBLIC_SHOP_PHONE="07845637566"
NEXT_PUBLIC_SHOP_ADDRESS="No. 5 Monasakthi Valagam, Cheyur - Vandavasi Rd, Sothupakkam, Tamil Nadu 603319"
NEXT_PUBLIC_WHATSAPP_NUMBER="917845637566"

# Admin Authentication
ADMIN_PHONE_NUMBER="+917845637566"
ADMIN_PASSWORD="your-admin-password"
JWT_SECRET="your-secure-jwt-secret"
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs the Next.js development server with Turbopack |
| `npm run build` | Builds the production bundle |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs ESLint for code analysis |

---

## 📄 License

This project is created for Dolphin Aquarium. All rights reserved.
