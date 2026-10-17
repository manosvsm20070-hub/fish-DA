import React from 'react';
import { notFound } from 'next/navigation';
import { getPublishedProducts as getProducts } from '@/lib/storage';
import FishCatalogClient from '@/components/FishCatalogClient';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CATEGORY_TITLES: Record<string, string> = {
  goldfish: 'Fancy Goldfish Collection',
  betta: 'Show Betta Fish',
  guppy: 'Breeder Guppies & Endlers',
  molly: 'Mollies & Livebearers',
  sharks: 'Aquarium Sharks (Freshwater)',
  flowerhorn: 'King Kamfa & Flowerhorns',
  'zebra-danio': 'Zebra Danio & GloFish',
  'monster-fish': 'Monster Fish Collection',
  gars: 'Freshwater Gars',
  catfish: 'Monster Catfish',
};

export default async function CategoryFishPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const normalizedCategory = category.toLowerCase();

  const title = CATEGORY_TITLES[normalizedCategory] || 'Fish Catalog';

  const allProducts = await getProducts();
  const liveFish = allProducts.filter((p) => p.isLiveFish);

  return (
    <main className="flex-1 flex flex-col w-full px-4 md:px-8 max-w-7xl mx-auto">
      <div className="w-full py-2 mb-2 flex items-center justify-between">
        <h1 className="font-headline-lg-mobile text-on-surface font-bold">{title}</h1>
        <span className="font-label-sm text-xs px-3 py-1 rounded-full bg-surface-container text-primary font-semibold">
          Quarantine Certified
        </span>
      </div>

      <FishCatalogClient initialProducts={liveFish} initialCategory={normalizedCategory} />

      <Footer />
    </main>
  );
}
