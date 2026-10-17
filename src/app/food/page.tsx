import React from 'react';
import CategoryCatalogPage from '@/components/CategoryCatalogPage';

export const revalidate = 0;

export default function FoodPage() {
  return (
    <CategoryCatalogPage
      title="Fish Food & Nutrition"
      subtitle="High-protein pellets, spirulina flakes, and freeze-dried bloodworms"
      categoryFilter={['food', 'pellet', 'flake']}
    />
  );
}
