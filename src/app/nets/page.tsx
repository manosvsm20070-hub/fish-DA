import React from 'react';
import CategoryCatalogPage from '@/components/CategoryCatalogPage';

export const revalidate = 0;

export default function NetsPage() {
  return (
    <CategoryCatalogPage
      title="Aquarium Fish Nets"
      subtitle="Fine nylon mesh nets safe for delicate fins and heavy predator fish"
      categoryFilter={['net']}
    />
  );
}
