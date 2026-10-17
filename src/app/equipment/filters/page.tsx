import React from 'react';
import CategoryCatalogPage from '@/components/CategoryCatalogPage';

export const revalidate = 0;

export default function FiltersPage() {
  return (
    <CategoryCatalogPage
      title="Aquarium Filters & Media"
      subtitle="Biochemical sponge filters, top filter setups, and beneficial nitrifying media"
      categoryFilter={['filter']}
    />
  );
}
