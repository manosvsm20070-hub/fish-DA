import React from 'react';
import CategoryCatalogPage from '@/components/CategoryCatalogPage';

export const revalidate = 0;

export default function EquipmentPage() {
  return (
    <CategoryCatalogPage
      title="Aquarium Equipment & Hardware"
      subtitle="Complete filtration, aerators, LED fixtures, and temperature control"
      categoryFilter={['motor', 'pump', 'filter', 'accessories']}
    />
  );
}
