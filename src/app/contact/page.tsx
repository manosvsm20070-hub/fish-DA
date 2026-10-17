import React from 'react';
import { SHOP_INFO } from '@/data/products';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Contact Dolphin Aquarium | Sothupakkam Tamil Nadu',
  description: 'Visit Dolphin Aquarium at No. 5 Monasakthi Valagam, Cheyur - Vandavasi Rd, Sothupakkam, Tamil Nadu 603319. Phone: 07845637566.',
};

export default function ContactPage() {
  return (
    <main className="flex-1 flex flex-col w-full px-4 md:px-8 max-w-7xl mx-auto">
      <div className="w-full py-2 mb-2 flex items-center justify-between">
        <h1 className="font-headline-lg-mobile text-on-surface font-bold">Store & Contact Info</h1>
        <span className="font-label-sm text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
          Open Daily (9 AM – 9 PM)
        </span>
      </div>

      <div className="flex flex-col gap-6">
        {/* Contact Info Card */}
        <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col gap-4">
            <div>
              <span className="font-label-sm uppercase tracking-wider text-primary font-bold">
                Visit Our Physical Store
              </span>
              <h2 className="font-headline-lg font-bold text-on-surface mt-1">
                Dolphin Aquarium
              </h2>
              <p className="font-body-md text-on-surface-variant text-sm mt-1">
                Your local destination for healthy freshwater fish, live plants, custom rimless glass tanks, and premium aquatic equipment.
              </p>
            </div>

            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[20px]">location_on</span>
                </div>
                <div>
                  <span className="font-label-md font-bold text-on-surface block">Address:</span>
                  <p className="text-on-surface-variant leading-relaxed">
                    {SHOP_INFO.address}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[20px]">call</span>
                </div>
                <div>
                  <span className="font-label-md font-bold text-on-surface block">Phone:</span>
                  <a href={SHOP_INFO.phoneDial} className="text-primary font-bold hover:underline">
                    {SHOP_INFO.phoneDisplay}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[20px]">schedule</span>
                </div>
                <div>
                  <span className="font-label-md font-bold text-on-surface block">Business Hours:</span>
                  <span className="text-on-surface-variant">{SHOP_INFO.openHours}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <a
                href={SHOP_INFO.phoneDial}
                className="w-full sm:w-auto h-12 px-6 rounded-xl bg-primary text-on-primary font-label-md font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-primary-container transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">call</span>
                <span>Call Store ({SHOP_INFO.phoneDisplay})</span>
              </a>

              <a
                href={`${SHOP_INFO.whatsappDirect}?text=Hello%20Dolphin%20Aquarium,%20I%20have%20an%20inquiry`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto h-12 px-6 rounded-xl bg-[#25D366] text-white font-label-md font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-[#1ebd59] transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
                <span>WhatsApp Store</span>
              </a>
            </div>
          </div>

          {/* Location & Directions Map Representation */}
          <div className="rounded-2xl overflow-hidden bg-surface-container border border-surface-container shadow-inner p-6 flex flex-col justify-between gap-6 min-h-[300px]">
            <div className="flex flex-col gap-2">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[26px]">map</span>
              </div>
              <h3 className="font-headline-sm font-bold text-on-surface">Directions to Sothupakkam Store</h3>
              <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                Located conveniently on Cheyur - Vandavasi Road at No. 5 Monasakthi Valagam in Sothupakkam. Easy landmark access with dedicated customer parking.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-lowest/80 border border-surface-container-high flex flex-col gap-2">
              <span className="font-label-sm text-xs font-semibold text-secondary">Google Maps Navigation:</span>
              <a
                href={SHOP_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 rounded-xl bg-surface-container-highest text-primary font-label-md font-bold flex items-center justify-center gap-2 hover:bg-surface-container transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">near_me</span>
                <span>Open in Google Maps App</span>
              </a>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
