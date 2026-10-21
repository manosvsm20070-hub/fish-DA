'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { SHOP_INFO } from '@/data/products';
import Footer from '@/components/Footer';

export default function MedicinesAndCarePage() {
  const [tankLiters, setTankLiters] = useState(50);
  const { addToCart } = useCart();

  // Dosage rule: 5ml per 50 Liters of fresh tap water
  const doseMl = Math.round((tankLiters / 50) * 5 * 10) / 10;

  const careProducts = [
    {
      id: 'med-paracidol-fw-60ml',
      name: 'Paracidol - FW (60ml)',
      tag: 'Parasite Cure',
      cap: 'Sleeping Disease & Flukes',
      desc: 'Liquid medicine for sleeping disease, skin flukes, velvet, anchor worms, and gill parasites.',
      description: 'Liquid medicine for sleeping disease, skin flukes, velvet, anchor worms, and gill parasites.',
      price: 120,
      image: '/uploads/paracidol-fw-60ml.png',
      category: 'Fish Medicines',
      variety: 'Liquid Remedy',
      sizes: ['60ml Bottle'],
      isLiveFish: false,
      stock: 50,
      availability: 'in_stock' as const,
      currency: '₹',
      images: ['/uploads/paracidol-fw-60ml.png'],
      primaryImage: '/uploads/paracidol-fw-60ml.png',
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'med-bactonil-fw-60ml',
      name: 'Bactonil - FW (60ml)',
      tag: 'Anti-Bacterial',
      cap: 'Fin Rot & Pop Eye',
      desc: 'Internal & external treatment for fin rot, cloudy eye, pop eye, mouth fungus, ulcers, and bites.',
      description: 'Internal & external treatment for fin rot, cloudy eye, pop eye, mouth fungus, ulcers, and bites.',
      price: 120,
      image: '/uploads/bactonil-fw-60ml.png',
      category: 'Fish Medicines',
      variety: 'Anti-Bacterial',
      sizes: ['60ml Bottle'],
      isLiveFish: false,
      stock: 50,
      availability: 'in_stock' as const,
      currency: '₹',
      images: ['/uploads/bactonil-fw-60ml.png'],
      primaryImage: '/uploads/bactonil-fw-60ml.png',
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'med-stress-heal-50ml',
      name: 'Stress Heal Conditioner (50ml)',
      tag: 'Stress & Aloe Vera',
      cap: 'Emergency Aid',
      desc: 'Natural Aloe Vera stress reducer, slime coat protectant, transport aid, ammonia & chlorine removal.',
      description: 'Natural Aloe Vera stress reducer, slime coat protectant, transport aid, ammonia & chlorine removal.',
      price: 120,
      image: '/uploads/stress-heal-50ml.png',
      category: 'Fish Medicines',
      variety: 'Water Conditioner',
      sizes: ['50ml Bottle'],
      isLiveFish: false,
      stock: 60,
      availability: 'in_stock' as const,
      currency: '₹',
      images: ['/uploads/stress-heal-50ml.png'],
      primaryImage: '/uploads/stress-heal-50ml.png',
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'med-general-fish-cure',
      name: 'General Fish Medicine',
      tag: 'Broad Spectrum',
      cap: '200ml Cap',
      desc: 'Calibrated bottle with measuring cup for rapid parasites and fin wear recovery.',
      description: 'Calibrated bottle with measuring cup for rapid parasites and fin wear recovery.',
      price: 160,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDnOs-S2KcpBg6cKwVHiPleCgJJ-W4xvqjENeqnj2KvDMvS2f0SW2XZO9WO2D0OIhKYDJXKHPetyRbTkuLtiH2PPA7eo8wUYr6TlpAnYVczPHiYFbqEE9l6jclimg2qanvFA7Fp9Ac-m1OCWZpjJ3_C8mikKXhHtyJo4pFRuOjb9puXE3qV7JroUmAqlKpOS2OcWgVICUUHFT3vm461pmx6DaC9Wo6MIPh2AYTHIpoADX4kllnWorhpxw',
      category: 'Fish Medicines',
      variety: 'Broad Spectrum',
      sizes: ['200ml Bottle'],
      isLiveFish: false,
      stock: 45,
      availability: 'in_stock' as const,
      currency: '₹',
      images: [],
      primaryImage:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDnOs-S2KcpBg6cKwVHiPleCgJJ-W4xvqjENeqnj2KvDMvS2f0SW2XZO9WO2D0OIhKYDJXKHPetyRbTkuLtiH2PPA7eo8wUYr6TlpAnYVczPHiYFbqEE9l6jclimg2qanvFA7Fp9Ac-m1OCWZpjJ3_C8mikKXhHtyJo4pFRuOjb9puXE3qV7JroUmAqlKpOS2OcWgVICUUHFT3vm461pmx6DaC9Wo6MIPh2AYTHIpoADX4kllnWorhpxw',
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'med-anti-fungal-bacterial',
      name: 'Anti-Fungal & Anti-Bacterial',
      tag: 'Fast Acting',
      cap: 'Fin Rot & Ich',
      desc: 'Targeted therapy for fungal fuzz, white spot ich, mouth rot, and velvet.',
      description: 'Targeted therapy for fungal fuzz, white spot ich, mouth rot, and velvet.',
      price: 220,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDOk94jw-fQUCwa_UDYKBt_VaUW0I58287ovu9ms-ZZQyJAE9SAmFiHEskJ2H_2iVhR4ZOAo0TzYXRd1swco33b-fHPnFb0yDr-PY6vPNwGmYONsQEmMHYcPZROxuF8hwUPN77vqV8gTRvkFlq65mUaYLUHi1BjgxWLp3GnCh57KcwNwevcFhBDcqIVQfXKawRzk1-qydMunWCUEujr9_8ciGegtLL5ygW3SRf7XjAtlz8X95pHLp8LTw',
      category: 'Fish Medicines',
      variety: 'Anti-Fungal',
      sizes: ['150ml Bottle'],
      isLiveFish: false,
      stock: 28,
      availability: 'in_stock' as const,
      currency: '₹',
      images: [],
      primaryImage:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDOk94jw-fQUCwa_UDYKBt_VaUW0I58287ovu9ms-ZZQyJAE9SAmFiHEskJ2H_2iVhR4ZOAo0TzYXRd1swco33b-fHPnFb0yDr-PY6vPNwGmYONsQEmMHYcPZROxuF8hwUPN77vqV8gTRvkFlq65mUaYLUHi1BjgxWLp3GnCh57KcwNwevcFhBDcqIVQfXKawRzk1-qydMunWCUEujr9_8ciGegtLL5ygW3SRf7XjAtlz8X95pHLp8LTw',
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'med-water-conditioner-instant',
      name: 'Instant Water Conditioner',
      tag: 'Slime Coat Shield',
      cap: 'Anti-Chlorine',
      desc: 'Neutralizes lethal tap chlorine and heavy metals instantly on refill.',
      description: 'Neutralizes lethal tap chlorine and heavy metals instantly on refill.',
      price: 180,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDmbi-5FMeRwwgCtWCSUdaXe4ZsJThKmRmF6PsubIxVim3buPe49VggMulw5740aGu5FC_JTSjuBAhgIxiEp4gX-jdCIsOk92VNvJHYBsw1fp7T0KTX4AOIiABOn7Sb4f36Gq31GedoP2cDXSdT5Swa0aydTHb-7Lsn0AmcXfxHMNs3NStw7VwCptPTXkKccBq1TH7gEg1X3i-KRYI99wnLQImMcDX-JViOTT6ez-E3k7XI4o2Jd4Zk1g',
      category: 'Fish Medicines',
      variety: 'Conditioner',
      sizes: ['250ml'],
      isLiveFish: false,
      stock: 50,
      availability: 'in_stock' as const,
      currency: '₹',
      images: [],
      primaryImage:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDmbi-5FMeRwwgCtWCSUdaXe4ZsJThKmRmF6PsubIxVim3buPe49VggMulw5740aGu5FC_JTSjuBAhgIxiEp4gX-jdCIsOk92VNvJHYBsw1fp7T0KTX4AOIiABOn7Sb4f36Gq31GedoP2cDXSdT5Swa0aydTHb-7Lsn0AmcXfxHMNs3NStw7VwCptPTXkKccBq1TH7gEg1X3i-KRYI99wnLQImMcDX-JViOTT6ez-E3k7XI4o2Jd4Zk1g',
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'med-aquarium-salt-1kg',
      name: 'Pure Aquarium Mineral Salt',
      tag: 'Gill & Osmosis Support',
      cap: '1kg Tub',
      desc: 'Non-iodized pure minerals to assist gill aeration and osmotic barrier balance.',
      description: 'Non-iodized pure minerals to assist gill aeration and osmotic barrier balance.',
      price: 120,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAhTN9w6BbuR1j0Qw0wgIzWGyE4atuIleEzZS_uDrtUGqFL27BuIVp9yZWC6R90A_crw92byq8SPBTmpy3xd1Gr5Djc896vCyLAqC9AzqNy2cPLsBO3QxeaTyg-zd8-w8Xu4sPkGVgxTL8aENnYj4TykdcwuDqeCId59vbMApZzmo9nS0yBeXq_8zDkaDrTcPdxWkTjod5r56ktyYX4S38hsos3uQZt9ib8dRPDrXctV1jEXAFRVnlVyg',
      category: 'Fish Medicines',
      variety: 'Mineral Salt',
      sizes: ['1kg Tub'],
      isLiveFish: false,
      stock: 60,
      availability: 'in_stock' as const,
      currency: '₹',
      images: [],
      primaryImage:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAhTN9w6BbuR1j0Qw0wgIzWGyE4atuIleEzZS_uDrtUGqFL27BuIVp9yZWC6R90A_crw92byq8SPBTmpy3xd1Gr5Djc896vCyLAqC9AzqNy2cPLsBO3QxeaTyg-zd8-w8Xu4sPkGVgxTL8aENnYj4TykdcwuDqeCId59vbMApZzmo9nS0yBeXq_8zDkaDrTcPdxWkTjod5r56ktyYX4S38hsos3uQZt9ib8dRPDrXctV1jEXAFRVnlVyg',
      createdAt: '',
      updatedAt: '',
    },
  ];

  return (
    <main className="flex-1 flex flex-col w-full px-4 md:px-8 max-w-7xl mx-auto">
      <div className="w-full py-2 mb-2 flex items-center justify-between">
        <h1 className="font-headline-lg-mobile text-on-surface font-bold">Fish Care & Medicines</h1>
        <span className="font-label-sm text-xs px-3 py-1 rounded-full bg-surface-container text-primary font-semibold">
          Freshwater Specialist
        </span>
      </div>

      <div className="flex flex-col gap-6">
        {/* Interactive Water Quality Alert & Quick Dose Calculator Widget (Stitch Screen 3) */}
        <section className="w-full bg-surface-container rounded-2xl p-5 shadow-sm relative overflow-hidden border border-surface-container-high/60">
          <div className="flex items-start justify-between gap-3 mb-3 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-xs">
                <span className="material-symbols-outlined text-[22px]">sanitizer</span>
              </div>
              <div>
                <span className="font-headline-sm font-bold text-on-surface block">
                  Aquarium Rx & Dosage Calculator
                </span>
                <span className="font-label-sm text-xs text-primary uppercase font-bold tracking-wider">
                  Fast Water Prep Aid
                </span>
              </div>
            </div>
            <span className="font-label-sm text-xs bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full font-bold">
              100% Fish-Safe
            </span>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-4 flex flex-col gap-2 relative z-10 shadow-xs">
            <div className="flex justify-between items-center text-on-surface">
              <span className="font-label-md text-sm font-semibold">
                Water Conditioner Required Dose:
              </span>
              <span className="font-headline-sm text-primary font-bold text-base">
                {doseMl} ml for {tankLiters} Liters
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="250"
              step="10"
              value={tankLiters}
              onChange={(e) => setTankLiters(parseInt(e.target.value, 10))}
              className="w-full accent-primary h-2 bg-surface-container-high rounded-lg cursor-pointer"
            />
            <div className="flex justify-between font-label-sm text-[11px] text-on-surface-variant font-semibold">
              <span>Nano (10L)</span>
              <span>Mid (100L)</span>
              <span>Monster (250L+)</span>
            </div>
          </div>
        </section>

        {/* SECTION 1: Fish Health & Water Care */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">medical_services</span>
              <h2 className="font-headline-md font-bold text-on-surface">Health & Generic Water Care</h2>
            </div>
            <span className="font-label-sm text-xs bg-surface-container-high text-primary px-3 py-1 rounded-full font-bold">
              In Stock
            </span>
          </div>
          <p className="font-body-sm text-xs text-on-surface-variant">
            Prevent shock, quarantine new arrivals, and keep freshwater pathogens under strict control.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {careProducts.map((med) => (
              <div
                key={med.id}
                className="bg-surface-container-lowest rounded-2xl p-4 flex flex-col justify-between shadow-sm border border-surface-container/70"
              >
                <div>
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-3 bg-surface-container-low">
                    <Image
                      src={med.image}
                      alt={med.name}
                      fill
                      className="object-cover"
                    />
                    <span className="absolute top-2 left-2 font-label-sm text-xs bg-surface-container-lowest/90 backdrop-blur-sm text-primary px-2 py-0.5 rounded-md font-bold shadow-xs">
                      {med.cap}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="font-label-sm text-[10px] text-secondary font-bold uppercase tracking-wider">
                      {med.tag}
                    </span>
                    <h3 className="font-label-lg font-bold text-on-surface line-clamp-1">
                      {med.name}
                    </h3>
                    <p className="font-body-sm text-xs text-on-surface-variant line-clamp-2 mt-1">
                      {med.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between pt-3 border-t border-surface-container">
                  <span className="font-headline-sm font-bold text-on-surface text-lg">
                    ₹{med.price}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => addToCart(med, 1, med.sizes[0])}
                      className="h-9 px-3 rounded-lg bg-[#cc4729] hover:bg-[#b03b20] active:scale-95 text-white font-label-md text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                      <span>Add</span>
                    </button>
                    <a
                      href={`${SHOP_INFO.whatsappDirect}?text=Hi%20Dolphin%20Aquarium,%20I%20need%20${encodeURIComponent(med.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-[#25D366] text-white flex items-center justify-center hover:bg-[#1ebd59] transition-all shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">chat</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: Fish Food & Nutrition */}
        <section className="flex flex-col gap-3 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">restaurant</span>
              <h2 className="font-headline-md font-bold text-on-surface">Fish Feed & Nutrition</h2>
            </div>
            <Link href="/food" className="font-label-sm text-xs text-primary font-bold hover:underline">
              View All Food →
            </Link>
          </div>
          <p className="font-body-sm text-xs text-on-surface-variant">
            Species-specific diets engineered for intense color brilliance, robust humps, and zero tank clouding.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-surface-container-lowest rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm border border-surface-container/70">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-surface-container-low">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZSHHhemWL0UObS4S3FVwkgMINj0Wj20qnQRtZGdbaF8aZaPbNp83NhAL6A_la3Am_8505qZ-M1YFRyL_huur9Zqp01AFHO-soWAbPiR1kg-0q0cpLHnVO73yM3cQ2oMgyYKg4PksGl_tFNIHoLYzWOmqeZQSZRDHJ7wwClqRqxrAr0Vih7Q5efcWYuSv6QYXwS_MFzIW2KXmaJCPKUWzMSjVBzKAzDCYuRgnR1dZUrLLSXOXUjwMn7Q"
                  alt="Goldfish pellets"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-label-sm text-[10px] px-1.5 py-0.2 rounded bg-surface-container text-primary font-bold">
                    Floating
                  </span>
                  <span className="font-label-sm text-[10px] text-secondary">Spirulina 12%</span>
                </div>
                <h3 className="font-label-lg font-bold text-on-surface truncate">
                  Goldfish Color Enhancing Pellets
                </h3>
                <p className="font-body-sm text-xs text-on-surface-variant line-clamp-1">
                  Natural astaxanthin boosts red & golden sheen without water clouding.
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-headline-sm font-bold text-primary text-base">₹150</span>
                  <span className="font-body-sm text-xs text-on-surface-variant line-through">₹190</span>
                </div>
              </div>
              <a
                href={`${SHOP_INFO.whatsappDirect}?text=Hi%20Dolphin%20Aquarium,%20I%20want%20Floating%20Goldfish%20Pellets`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm hover:bg-primary-container"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
              </a>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm border border-surface-container/70">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-surface-container-low">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDB3s2Rp54RtjJGmy_4uOcySXsoNZY_DCs5J8b5J8wITLrKhuv7KAX-RaIYAAmochvyRQEIAQZnLHoOn3ZQS3tugKlRDsIeCxcjzUiSR9JGr1VZ5VPXlqgc_nQ0xfYtII0t8cEFeicvHowb_aq1cbvYOOALFBZ8ZUnHtWoozUmllT0pVJb2Hh5RNKjHRLawmqyG7PK2RICmmQEovvl5CXJX3wmGw0AG52ilyX6rSaA6u1A9vJkDg38ksw"
                  alt="Betta pellets"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-label-sm text-[10px] px-1.5 py-0.2 rounded bg-tertiary-fixed text-on-tertiary-fixed font-bold">
                    High Protein
                  </span>
                  <span className="font-label-sm text-[10px] text-secondary">Betta Special</span>
                </div>
                <h3 className="font-label-lg font-bold text-on-surface truncate">
                  Betta Micro & Bloodworms
                </h3>
                <p className="font-body-sm text-xs text-on-surface-variant line-clamp-1">
                  Twin pack with micro floating pellets and freeze-dried bloodworm cubes.
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-headline-sm font-bold text-primary text-base">₹130</span>
                </div>
              </div>
              <a
                href={`${SHOP_INFO.whatsappDirect}?text=Hi%20Dolphin%20Aquarium,%20I%20want%20Betta%20Pellets%20and%20Bloodworms`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm hover:bg-primary-container"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
              </a>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
