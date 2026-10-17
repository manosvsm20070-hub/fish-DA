import React from 'react';
import CategoryCatalogPage from '@/components/CategoryCatalogPage';

export const revalidate = 0;

export default function PlantsPage() {
  return (
    <CategoryCatalogPage
      title="Aquarium Plants"
      subtitle="Live low-tech plants, Anubias rooted on lava stone, and artificial aquascape greens"
      categoryFilter={['plant']}
    />
  );
}
