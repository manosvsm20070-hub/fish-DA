import React from 'react';
import { getPublishedProducts as getProducts } from '@/lib/storage';
import TanksEquipmentClient from '@/components/TanksEquipmentClient';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TanksPage() {
  const products = await getProducts();
  const gear = products.filter((p) => !p.isLiveFish);

  return (
    <main className="flex-1 flex flex-col w-full px-4 md:px-8 max-w-7xl mx-auto">
      <div className="w-full py-2 mb-2 flex items-center justify-between">
        <h1 className="font-headline-lg-mobile text-on-surface font-bold">Equipment And Tanks</h1>
        <span className="font-label-sm text-xs px-3 py-1 rounded-full bg-surface-container text-primary font-semibold">
          Freshwater Specialist
        </span>
      </div>

      <TanksEquipmentClient products={gear} initialFilter="tanks" />

      <Footer />
    </main>
  );
}
