import React from 'react';
import CategoryCatalogPage from '@/components/CategoryCatalogPage';

export const revalidate = 0;

export default function AccessoriesPage() {
  return (
    <CategoryCatalogPage
      title="Aquarium Accessories"
      subtitle="Full-spectrum LED lighting, auto-thermostat heaters, thermometers, and airline valves"
      categoryFilter={['accessories', 'light', 'heater']}
    />
  );
}
