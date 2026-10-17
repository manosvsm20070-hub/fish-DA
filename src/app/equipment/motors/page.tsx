import React from 'react';
import CategoryCatalogPage from '@/components/CategoryCatalogPage';

export const revalidate = 0;

export default function MotorsPage() {
  return (
    <CategoryCatalogPage
      title="Motors & Pumps"
      subtitle="Dual outlet silent air pumps, high-power submersible motors, and wavemakers"
      categoryFilter={['motor', 'pump']}
    />
  );
}
