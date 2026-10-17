import React from 'react';
import { notFound } from 'next/navigation';
import { getProductById, getProducts } from '@/lib/storage';
import ProductDetailClient from '@/components/ProductDetailClient';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const allProducts = await getProducts();
  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <main className="flex-1 flex flex-col w-full px-4 md:px-8 max-w-7xl mx-auto">
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
      <Footer />
    </main>
  );
}
