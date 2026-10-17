import React from 'react';
import CategoryCatalogPage from '@/components/CategoryCatalogPage';

export const revalidate = 0;

export default function GravelPage() {
  return (
    <CategoryCatalogPage
      title="Colored Gravel & Substrates"
      subtitle="Color-fast smooth gravel in blue, black, white, and multi-color blends"
      categoryFilter={['gravel', 'substrate']}
    />
  );
}
