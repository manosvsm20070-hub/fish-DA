import React from 'react';
import CategoryCatalogPage from '@/components/CategoryCatalogPage';

export const revalidate = 0;

export default function DecorationsPage() {
  return (
    <CategoryCatalogPage
      title="Aquarium Decorations & Driftwood"
      subtitle="Cured bogwood, natural caves, fish hiding ornaments, and sunken ships"
      categoryFilter={['decor', 'driftwood', 'ornament']}
    />
  );
}
