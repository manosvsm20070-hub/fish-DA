import React from 'react';
import { getPublishedProducts as getProducts } from '@/lib/storage';
import FishCatalogClient from '@/components/FishCatalogClient';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function FishCatalogPage() {
  const allProducts = await getProducts();
  const liveFish = allProducts.filter((p) => p.isLiveFish);

  return (
    <main className="flex-1 flex flex-col w-full px-4 md:px-8 max-w-7xl mx-auto">
      {/* Title & Badge */}
      <div className="w-full py-2 mb-2 flex items-center justify-between">
        <h1 className="font-headline-lg-mobile text-on-surface font-bold">Fish Catalog</h1>
        <span className="font-label-sm text-xs px-3 py-1 rounded-full bg-surface-container text-primary font-semibold">
          Freshwater Specialist
        </span>
      </div>

      <FishCatalogClient initialProducts={liveFish} initialCategory="all" />

      <Footer />
    </main>
  );
}
