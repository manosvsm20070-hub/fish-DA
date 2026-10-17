import React from 'react';
import { getProducts } from '@/lib/storage';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Footer';

interface CategoryCatalogPageProps {
  title: string;
  subtitle: string;
  categoryFilter: string | string[];
}

export default async function CategoryCatalogPage({
  title,
  subtitle,
  categoryFilter,
}: CategoryCatalogPageProps) {
  const allProducts = await getProducts();

  const filterList = Array.isArray(categoryFilter)
    ? categoryFilter.map((c) => c.toLowerCase())
    : [categoryFilter.toLowerCase()];

  const products = allProducts.filter((p) => {
    const cat = p.category.toLowerCase();
    const sub = p.subCategory?.toLowerCase() || '';
    const variety = p.variety.toLowerCase();
    return filterList.some(
      (f) => cat.includes(f) || sub.includes(f) || variety.includes(f)
    );
  });

  return (
    <main className="flex-1 flex flex-col w-full px-4 md:px-8 max-w-7xl mx-auto">
      <div className="w-full py-2 mb-2 flex items-center justify-between">
        <div>
          <h1 className="font-headline-lg-mobile text-on-surface font-bold">{title}</h1>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">{subtitle}</p>
        </div>
        <span className="font-label-sm text-xs px-3 py-1 rounded-full bg-surface-container text-primary font-semibold">
          {products.length} Products
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} aspectRatio="4/5" />
        ))}
      </div>

      <Footer />
    </main>
  );
}
