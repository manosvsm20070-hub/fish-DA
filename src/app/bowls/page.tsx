import React from 'react';
import CategoryCatalogPage from '@/components/CategoryCatalogPage';

export const revalidate = 0;

export default function BowlsPage() {
  return (
    <CategoryCatalogPage
      title="Aquarium Bowls & Nano Glass"
      subtitle="High-clarity seamless bubble bowls from Mini (6 inch) to Extra Large (14 inch)"
      categoryFilter={['bowl']}
    />
  );
}
