import React from 'react';
import CategoryCatalogPage from '@/components/CategoryCatalogPage';

export const revalidate = 0;

export default function StonesPage() {
  return (
    <CategoryCatalogPage
      title="Aquarium Stones & Rocks"
      subtitle="Dragon stones, black river stones, and aquascaping layout rocks"
      categoryFilter={['stone', 'rock', 'hardscape']}
    />
  );
}
