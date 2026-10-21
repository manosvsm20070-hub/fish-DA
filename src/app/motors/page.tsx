import React from 'react';
import CategoryCatalogPage from '@/components/CategoryCatalogPage';

export const revalidate = 0;

export default function MotorsPage() {
  return (
    <CategoryCatalogPage
      title="Motors, Pumps & Aerators"
      subtitle="Submersible powerheads, whisper-quiet air pumps, and aquarium circulation wavemakers"
      categoryFilter={['motor', 'pump', 'powerhead', 'wavemaker', 'aerator']}
    />
  );
}
