import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPublishedProducts as getProducts, getSettings } from '@/lib/storage';
import { SHOP_INFO } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import LiveHeroBanner from '@/components/LiveHeroBanner';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Ensure live fresh product prices and pictures are fetched

export default async function HomePage() {
  const [products, settings] = await Promise.all([
    getProducts(),
    getSettings(),
  ]);

  const ci = settings.customerInterface;
  const featuredFish = products.filter((p) => p.isLiveFish && p.featured).slice(0, 4);
  const gearEssentials = products.filter((p) => !p.isLiveFish).slice(0, 4);

  return (
    <main className="flex-1 flex flex-col w-full px-4 md:px-8 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Specialist Badge */}
      <div className="w-full py-2 mb-2 flex items-center justify-between">
        <span className="font-headline-lg-mobile text-on-surface font-bold">Home</span>
        <span className="font-label-sm text-xs px-3 py-1 rounded-full bg-surface-container text-primary font-semibold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          Freshwater Specialist
        </span>
      </div>

      <div className="flex flex-col w-full gap-6 md:gap-8">
        {/* Shop Spotlight & Trust Hero Banner with Real-time Live Updates */}
        <LiveHeroBanner initialInterface={ci} />

        {/* Interactive Category Chips Scroll */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-sm font-bold text-on-surface">Explore Livestock & Gear</h2>
            <Link href="/fish" className="font-label-sm text-xs text-primary font-bold hover:underline">
              View All →
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
            <Link
              href="/fish"
              className="shrink-0 px-4 py-2 rounded-full bg-primary text-on-primary font-label-md shadow-sm transition-all text-xs sm:text-sm"
            >
              All Stock
            </Link>
            <Link
              href="/fish/goldfish"
              className="shrink-0 px-4 py-2 rounded-full bg-surface-container text-on-surface-variant font-label-md hover:bg-surface-container-high transition-all text-xs sm:text-sm"
            >
              Fancy Goldfish
            </Link>
            <Link
              href="/fish/betta"
              className="shrink-0 px-4 py-2 rounded-full bg-surface-container text-on-surface-variant font-label-md hover:bg-surface-container-high transition-all text-xs sm:text-sm"
            >
              Show Bettas
            </Link>
            <Link
              href="/fish/flowerhorn"
              className="shrink-0 px-4 py-2 rounded-full bg-surface-container text-on-surface-variant font-label-md hover:bg-surface-container-high transition-all text-xs sm:text-sm"
            >
              Flowerhorn
            </Link>
            <Link
              href="/fish/guppy"
              className="shrink-0 px-4 py-2 rounded-full bg-surface-container text-on-surface-variant font-label-md hover:bg-surface-container-high transition-all text-xs sm:text-sm"
            >
              Guppies & Mollies
            </Link>
            <Link
              href="/tanks"
              className="shrink-0 px-4 py-2 rounded-full bg-surface-container text-on-surface-variant font-label-md hover:bg-surface-container-high transition-all text-xs sm:text-sm"
            >
              Rimless Tanks
            </Link>
            <Link
              href="/medicines"
              className="shrink-0 px-4 py-2 rounded-full bg-surface-container text-on-surface-variant font-label-md hover:bg-surface-container-high transition-all text-xs sm:text-sm"
            >
              Food & Medicines
            </Link>
          </div>
        </section>

        {/* Live Showcase Grid — Curated Exotic Arrivals */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
              <h2 className="font-headline-sm font-bold text-on-surface">Curated Exotic Arrivals</h2>
            </div>
            <Link href="/fish" className="font-label-sm text-primary font-bold text-xs">
              Live in Sothupakkam
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredFish.map((fish) => (
              <ProductCard key={fish.id} product={fish} aspectRatio="4/5" />
            ))}
          </div>
        </section>

        {/* Tanks, Filters & Care Essentials Strip */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-sm font-bold text-on-surface">Tanks, Filters & Care Essentials</h2>
            <Link href="/tanks" className="font-label-sm text-secondary text-xs hover:text-primary">
              View Store Supplies →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {gearEssentials.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container/60 hover:shadow-md transition-all"
              >
                <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-surface-container">
                  <Image
                    src={item.primaryImage}
                    alt={item.name}
                    fill
                    unoptimized={Boolean(item.primaryImage?.startsWith('data:') || item.primaryImage?.startsWith('/api/uploads/') || item.primaryImage?.startsWith('/uploads/'))}
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-label-sm text-[10px] px-1.5 py-0.2 rounded bg-surface-container text-primary font-bold">
                      {item.category}
                    </span>
                    <span className="font-label-sm text-[10px] text-secondary">
                      {item.variety}
                    </span>
                  </div>
                  <h3 className="font-label-lg font-bold text-on-surface truncate mt-0.5">
                    {item.name}
                  </h3>
                  <p className="font-body-sm text-xs text-on-surface-variant line-clamp-1">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-surface-container/50">
                    <span className="font-headline-sm text-sm font-bold text-primary">
                      ₹{item.price.toLocaleString('en-IN')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/product/${item.id}`}
                        className="px-2.5 py-1 rounded-lg bg-surface-container-high text-primary font-label-sm text-xs font-semibold hover:bg-surface-container"
                      >
                        Details
                      </Link>
                      <Link
                        href="/cart"
                        className="px-2.5 py-1 rounded-lg bg-[#cc4729] text-white font-label-sm text-xs font-bold hover:bg-[#b03b20]"
                      >
                        Order
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Custom Rimless Aquariums Banner */}
        <section className="rounded-2xl p-6 bg-gradient-to-r from-[#004e59] to-[#028090] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="flex flex-col gap-2 max-w-xl text-center md:text-left">
            <span className="font-label-sm uppercase tracking-widest text-[#9eefff] font-bold">
              Custom Aquaria Fabrication
            </span>
            <h2 className="font-headline-lg font-bold leading-tight">
              Request a Custom Made-to-Size Aquarium
            </h2>
            <p className="font-body-md text-white/90 text-sm">
              We build custom low-iron rimless glass tanks, bottom-drainage sumps, and hardwood cabinet setups tailored to your room dimensions.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              href="/custom-tanks"
              className="h-12 px-6 rounded-xl bg-white text-[#006572] font-label-md font-bold flex items-center justify-center hover:bg-surface-container transition-all active:scale-95 shadow-sm"
            >
              Request Custom Tank
            </Link>
            <a
              href={`${SHOP_INFO.whatsappDirect}?text=Hello%20Dolphin%20Aquarium,%20I%20want%20a%20quotation%20for%20a%20custom%20size%20aquarium`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 px-6 rounded-xl bg-[#25D366] text-white font-label-md font-bold flex items-center justify-center gap-1.5 hover:bg-[#1ebd59] transition-all active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">chat</span>
              <span>WhatsApp Quote</span>
            </a>
          </div>
        </section>

        {/* Interactive Water Compatibility Guide (From Stitch Screen 4) */}
        <section className="rounded-2xl bg-surface-container p-5 flex flex-col gap-4 border border-surface-container-high/60">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[26px]">science</span>
            <div>
              <h3 className="font-headline-sm font-bold text-on-surface">Freshwater Quality Quick Check</h3>
              <p className="font-body-sm text-xs text-on-surface-variant">Recommended water balance for Sothupakkam tap water</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-3 rounded-xl bg-surface-container-lowest shadow-xs">
              <span className="font-label-sm text-secondary text-xs block">Avg Temp</span>
              <p className="font-headline-sm text-primary font-bold">25-28°C</p>
              <span className="font-label-sm text-[11px] text-on-surface-variant">Tropical Range</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-lowest shadow-xs">
              <span className="font-label-sm text-secondary text-xs block">Safe pH</span>
              <p className="font-headline-sm text-primary font-bold">6.8 - 7.5</p>
              <span className="font-label-sm text-[11px] text-on-surface-variant">Neutral Zone</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-lowest shadow-xs">
              <span className="font-label-sm text-secondary text-xs block">Dechlorinate</span>
              <p className="font-headline-sm text-primary font-bold">100%</p>
              <span className="font-label-sm text-[11px] text-on-surface-variant">Every Water Refill</span>
            </div>
          </div>
          <p className="font-body-sm text-xs text-on-surface-variant bg-surface-container-lowest/70 p-3 rounded-xl">
            💡 <strong>Pro Tip:</strong> Bringing home new fish? Always float the transport bag in your tank water for 15-20 minutes before releasing to prevent sudden temperature shock.
          </p>
        </section>

        {/* Dolphin Aquarium Assurance Pillars */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container/60 flex flex-col gap-2">
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">verified_user</span>
            </div>
            <h4 className="font-label-lg font-bold text-on-surface">Transit Guarantee</h4>
            <p className="font-body-sm text-xs text-on-surface-variant">
              Oxygen-injected medical grade bags ensuring 100% safe live arrival on local deliveries.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container/60 flex flex-col gap-2">
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">handshake</span>
            </div>
            <h4 className="font-label-lg font-bold text-on-surface">Store Consultation</h4>
            <p className="font-body-sm text-xs text-on-surface-variant">
              Personalized guidance on fish compatibility, biological cycling, feeding, and disease diagnosis.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container/60 flex flex-col gap-2">
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">build</span>
            </div>
            <h4 className="font-label-lg font-bold text-on-surface">Custom Aquascaping</h4>
            <p className="font-body-sm text-xs text-on-surface-variant">
              Complete planted nano setups, predator monster fish setups, and community biotope installations.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container/60 flex flex-col gap-2">
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">schedule</span>
            </div>
            <h4 className="font-label-lg font-bold text-on-surface">Daily Open Hours</h4>
            <p className="font-body-sm text-xs text-on-surface-variant">
              Open 7 days a week from 9:00 AM to 9:00 PM for all livestock, tank accessories, and food supplies.
            </p>
          </div>
        </section>

        {/* Visit Our Sothupakkam Store Module */}
        <section className="rounded-2xl overflow-hidden bg-surface-container-lowest shadow-sm border border-surface-container flex flex-col">
          <div className="p-5 sm:p-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm font-bold text-on-surface">Visit Our Sothupakkam Store</h3>
              <span className="font-label-sm text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                Open Daily (9 AM – 9 PM)
              </span>
            </div>
            <p className="font-body-sm text-on-surface-variant text-sm">
              {SHOP_INFO.address}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <a
                className="w-full sm:w-auto flex-1 h-11 rounded-xl bg-surface-container-highest text-primary font-label-md font-bold flex items-center justify-center gap-2 hover:bg-surface-container transition-all active:scale-95"
                href={SHOP_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="material-symbols-outlined text-[18px]">directions</span>
                <span>Get Directions on Google Maps</span>
              </a>
              <a
                aria-label="Call Store Directly"
                className="w-full sm:w-auto h-11 px-5 rounded-xl bg-primary text-on-primary flex items-center justify-center gap-2 font-label-md font-bold hover:bg-primary-container transition-all active:scale-95"
                href={SHOP_INFO.phoneDial}
              >
                <span className="material-symbols-outlined text-[20px]">call</span>
                <span>Call {SHOP_INFO.phoneDisplay}</span>
              </a>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
