'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product, Order, Catalog, SiteSettings } from '@/types';
import SettingsManager from '@/components/admin/SettingsManager';
import { compressImage } from '@/lib/imageCompression';
import { broadcastAdminUpdate } from '@/lib/broadcastSync';

// ─────────────────────────────────────────────────────────────
// SECTION TYPES
// ─────────────────────────────────────────────────────────────
type AdminSection = 'dashboard' | 'products' | 'catalogs' | 'orders' | 'settings';

// ─────────────────────────────────────────────────────────────
// HELPER: Admin fetch with error
// ─────────────────────────────────────────────────────────────
async function adminFetch(url: string, opts?: RequestInit) {
  const sep = url.includes('?') ? '&' : '?';
  const res = await fetch(`${url}${sep}_t=${Date.now()}`, {
    cache: 'no-store',
    ...opts,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      ...(opts?.headers || {}),
    },
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

// ─────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 font-label-md text-sm font-bold animate-bounce ${
        type === 'success'
          ? 'bg-emerald-600 text-white'
          : 'bg-red-600 text-white'
      }`}
    >
      <span className="material-symbols-outlined text-[18px]">
        {type === 'success' ? 'check_circle' : 'error'}
      </span>
      {msg}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PRODUCT FORM (used for both Add and Edit)
// ─────────────────────────────────────────────────────────────
interface ProductFormProps {
  initial?: Partial<Product>;
  catalogs: Catalog[];
  onSave: (data: Partial<Product>) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
  mode: 'add' | 'edit';
}

function ProductForm({ initial, catalogs, onSave, onCancel, isSaving, mode }: ProductFormProps) {
  const activeCatalogName = catalogs.find((c) => c.status === 'Active')?.name || catalogs[0]?.name || 'Fish';
  const [form, setForm] = useState({
    name: initial?.name || '',
    category: initial?.category || activeCatalogName,
    subCategory: initial?.subCategory || '',
    variety: initial?.variety || '',
    description: initial?.description || '',
    price: initial?.price?.toString() || '0',
    originalPrice: initial?.originalPrice?.toString() || '',
    stock: initial?.stock?.toString() || '10',
    availability: initial?.availability || 'in_stock',
    sizes: (initial?.sizes || ['Standard']).join(', '),
    isLiveFish: initial?.isLiveFish !== undefined ? initial.isLiveFish : true,
    featured: initial?.featured || false,
    status: initial?.status || 'Published',
    primaryImage: initial?.primaryImage || '',
  });
  const [images, setImages] = useState<string[]>(initial?.images || (initial?.primaryImage ? [initial.primaryImage] : []));
  const [newImgUrl, setNewImgUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const set = (key: string, val: unknown) => setForm((p) => ({ ...p, [key]: val }));

  useEffect(() => {
    if (!form.category && catalogs.length > 0) {
      const activeCat = catalogs.find((c) => c.status === 'Active') || catalogs[0];
      if (activeCat) {
        setForm((prev) => ({ ...prev, category: activeCat.name }));
      }
    }
  }, [catalogs, form.category]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus('Optimizing photo...');

    try {
      // Auto-compress high-resolution camera photos (2MB - 20MB) to fast web-optimized format (~100-250KB)
      const compressed = await compressImage(file, { maxWidth: 1280, maxHeight: 1280, quality: 0.82 });

      setUploadStatus('Uploading...');
      const fd = new FormData();
      fd.append('file', compressed.file);

      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();

      const finalUrl = data.success ? (data.url || data.dataUrl) : compressed.dataUrl;
      if (finalUrl) {
        const next = [...images, finalUrl];
        setImages(next);
        if (!form.primaryImage) set('primaryImage', finalUrl);
      } else {
        // Fallback to data URL so snapped camera photo is not lost
        const next = [...images, compressed.dataUrl];
        setImages(next);
        if (!form.primaryImage) set('primaryImage', compressed.dataUrl);
      }
    } catch (err) {
      console.warn('Compression/upload error, falling back to data URL:', err);
      const reader = new FileReader();
      reader.onload = () => {
        const fallbackUrl = reader.result as string;
        const next = [...images, fallbackUrl];
        setImages(next);
        if (!form.primaryImage) set('primaryImage', fallbackUrl);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
      setUploadStatus('');
      e.target.value = '';
    }
  };

  const addUrlImage = () => {
    const url = newImgUrl.trim();
    if (!url) return;
    if (!images.includes(url)) {
      const next = [...images, url];
      setImages(next);
      if (!form.primaryImage) set('primaryImage', url);
    }
    setNewImgUrl('');
  };

  const removeImage = (url: string) => {
    const next = images.filter((i) => i !== url);
    setImages(next);
    if (form.primaryImage === url) set('primaryImage', next[0] || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const finalCategory =
      form.category.trim() ||
      catalogs.find((c) => c.status === 'Active')?.name ||
      catalogs[0]?.name ||
      'Fish';

    const payload: Partial<Product> = {
      name: form.name.trim(),
      category: finalCategory,
      subCategory: form.subCategory.trim(),
      variety: form.variety.trim(),
      description: form.description.trim(),
      price: form.price.trim() !== '' ? (parseFloat(form.price) || 0) : 0,
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
      stock: form.stock.trim() !== '' ? (parseInt(form.stock) || 0) : 10,
      availability: form.availability as Product['availability'],
      sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      isLiveFish: form.isLiveFish,
      featured: form.featured,
      status: (form.status as Product['status']) || 'Published',
      images,
      primaryImage: form.primaryImage || images[0] || '',
    };
    onSave(payload);
  };

  const inputCls = 'w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none';
  const labelCls = 'font-label-md text-xs font-bold text-on-surface mb-1 block';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto pr-1">
      {/* Name */}
      <div>
        <label className={labelCls}>Product Name *</label>
        <input required type="text" value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} placeholder="e.g. Red Cap Oranda Goldfish" />
      </div>

      {/* Category */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Category / Catalog *</label>
          <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputCls}>
            {catalogs.filter(c => c.status === 'Active').map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
            {!catalogs.length && <option value="">No catalogs yet</option>}
          </select>
        </div>
        <div>
          <label className={labelCls}>Sub-Category</label>
          <input type="text" value={form.subCategory} onChange={(e) => set('subCategory', e.target.value)} className={inputCls} placeholder="e.g. Oranda" />
        </div>
      </div>

      {/* Variety & Description */}
      <div>
        <label className={labelCls}>Variety</label>
        <input type="text" value={form.variety} onChange={(e) => set('variety', e.target.value)} className={inputCls} placeholder="e.g. Red Cap" />
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3}
          className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/60 font-body-md text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none resize-none"
          placeholder="Describe the product..." />
      </div>

      {/* Sizes */}
      <div>
        <label className={labelCls}>Sizes (comma-separated)</label>
        <input type="text" value={form.sizes} onChange={(e) => set('sizes', e.target.value)} className={inputCls} placeholder="e.g. 3 inch, 4 inch, 5 inch" />
      </div>

      {/* Price */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>
            Price (₹) {form.isLiveFish ? <span className="text-amber-600 font-normal text-[11px]">(Optional for live fish · Inquiry only on storefront)</span> : '*'}
          </label>
          <input
            required={!form.isLiveFish}
            type="number"
            min="0"
            step="1"
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
            className={inputCls}
            placeholder={form.isLiveFish ? '0 (Optional for live fish)' : '850'}
          />
        </div>
        <div>
          <label className={labelCls}>Original Price (₹)</label>
          <input type="number" min="0" step="1" value={form.originalPrice} onChange={(e) => set('originalPrice', e.target.value)} className={inputCls} placeholder="950" />
        </div>
      </div>

      {/* Stock & Availability */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Stock Qty</label>
          <input type="number" min="0" value={form.stock} onChange={(e) => set('stock', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Availability</label>
          <select value={form.availability} onChange={(e) => set('availability', e.target.value)} className={inputCls}>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Flags */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 font-label-md text-sm cursor-pointer">
          <input type="checkbox" checked={form.isLiveFish} onChange={(e) => set('isLiveFish', e.target.checked)} className="rounded" />
          Live Fish
        </label>
        <label className="flex items-center gap-2 font-label-md text-sm cursor-pointer">
          <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} className="rounded" />
          Featured
        </label>
      </div>

      {/* Images Section */}
      <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container">
        <label className={labelCls}>Product Images ({images.length})</label>

        {/* Preview grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-3">
            {images.map((img, i) => (
              <div key={i} className={`relative aspect-square rounded-lg overflow-hidden border-2 group ${form.primaryImage === img ? 'border-primary' : 'border-surface-container'}`}>
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-surface-container">
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px]">broken_image</span>
                  </div>
                )}
                {form.primaryImage === img && (
                  <span className="absolute top-0.5 left-0.5 bg-primary text-white text-[8px] px-1 rounded font-bold">PRIMARY</span>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity">
                  {form.primaryImage !== img && (
                    <button type="button" onClick={() => set('primaryImage', img)} className="text-[9px] bg-primary text-white px-1.5 py-0.5 rounded font-bold">Set Primary</button>
                  )}
                  <button type="button" onClick={() => removeImage(img)} className="text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add by URL */}
        <div className="flex gap-2 mb-2">
          <input type="url" value={newImgUrl} onChange={(e) => setNewImgUrl(e.target.value)}
            placeholder="Paste image URL (https://...)"
            className="flex-1 h-9 px-3 rounded-xl bg-surface-container-lowest border border-outline-variant/60 text-xs focus:ring-2 focus:ring-primary/40 focus:outline-none" />
          <button type="button" onClick={addUrlImage} disabled={!newImgUrl.trim()}
            className="px-3 rounded-xl bg-surface-container-highest text-primary text-xs font-bold disabled:opacity-40">+ URL</button>
        </div>

        {/* Upload from device: Camera & Gallery */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          {/* Snap with Camera */}
          <label className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-bold cursor-pointer hover:bg-primary/20 transition-all text-center">
            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            <span>{uploading ? (uploadStatus || 'Processing...') : 'Take Photo (Camera)'}</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>

          {/* Pick from Gallery / Files */}
          <label className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-xs font-bold cursor-pointer hover:bg-surface-container-high transition-all text-center">
            <span className="material-symbols-outlined text-[18px] text-secondary">photo_library</span>
            <span>{uploading ? (uploadStatus || 'Processing...') : 'Photo Gallery'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
        <p className="text-[11px] text-on-surface-variant/70 mt-1.5">
          📸 Works with phone camera and photo library. Large photos (2MB+) are automatically optimized for instant loading.
        </p>
      </div>

      {/* Status */}
      <div>
        <label className={labelCls}>Status</label>
        <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputCls}>
          <option value="Published">Published (visible to customers immediately)</option>
          <option value="Draft">Draft (admin only)</option>
          <option value="Archived">Archived (hidden)</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-surface-container sticky bottom-0 bg-surface-container-lowest pb-1">
        <button type="button" onClick={onCancel}
          className="h-10 px-4 rounded-xl bg-surface-container text-on-surface font-label-md text-sm font-bold hover:bg-surface-container-high">Cancel</button>
        <button type="submit" disabled={isSaving}
          className="h-10 px-5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-sm font-bold flex items-center gap-2 disabled:opacity-50 transition-all">
          <span className="material-symbols-outlined text-[17px]">save</span>
          {isSaving ? 'Saving...' : mode === 'add' ? 'Create Product' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────
// CATALOG FORM
// ─────────────────────────────────────────────────────────────
interface CatalogFormProps {
  initial?: Partial<Catalog>;
  onSave: (data: Partial<Catalog>) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
  mode: 'add' | 'edit';
}

function CatalogForm({ initial, onSave, onCancel, isSaving, mode }: CatalogFormProps) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    description: initial?.description || '',
    displayOrder: initial?.displayOrder?.toString() || '99',
    status: initial?.status || 'Active',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: form.name.trim(),
      description: form.description.trim(),
      displayOrder: parseInt(form.displayOrder) || 99,
      status: form.status as Catalog['status'],
    });
  };

  const inputCls = 'w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/60 text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="font-label-md text-xs font-bold text-on-surface mb-1 block">Catalog Name *</label>
        <input required type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={inputCls} placeholder="e.g. Aquarium Lighting" />
      </div>
      <div>
        <label className="font-label-md text-xs font-bold text-on-surface mb-1 block">Description</label>
        <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2}
          className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/60 text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-label-md text-xs font-bold text-on-surface mb-1 block">Display Order</label>
          <input type="number" value={form.displayOrder} onChange={(e) => setForm((p) => ({ ...p, displayOrder: e.target.value }))} className={inputCls} />
        </div>
        <div>
          <label className="font-label-md text-xs font-bold text-on-surface mb-1 block">Status</label>
          <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as 'Active' | 'Archived' }))} className={inputCls}>
            <option value="Active">Active (visible)</option>
            <option value="Archived">Archived (hidden)</option>
          </select>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-surface-container">
        <button type="button" onClick={onCancel} className="h-10 px-4 rounded-xl bg-surface-container text-on-surface text-sm font-bold">Cancel</button>
        <button type="submit" disabled={isSaving}
          className="h-10 px-5 rounded-xl bg-primary text-on-primary text-sm font-bold flex items-center gap-2 disabled:opacity-50">
          <span className="material-symbols-outlined text-[17px]">save</span>
          {isSaving ? 'Saving...' : mode === 'add' ? 'Create Catalog' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────
// MODAL WRAPPER
// ─────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl border border-surface-container shadow-2xl p-6 my-8 flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-surface-container pb-3">
          <h2 className="font-headline-sm font-bold text-on-surface">{title}</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface p-1 rounded-full">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────────────────────
function StatusBadge({ status = 'Published' }: { status?: string }) {
  const map: Record<string, string> = {
    Published: 'bg-emerald-100 text-emerald-800',
    Draft: 'bg-amber-100 text-amber-800',
    Archived: 'bg-surface-container text-on-surface-variant',
    Active: 'bg-emerald-100 text-emerald-800',
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-label-sm font-bold ${map[status] || 'bg-surface-container text-on-surface-variant'}`}>
      {status}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [adminPhone, setAdminPhone] = useState('');
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(false);

  // Filters
  const [productSearch, setProductSearch] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState('all');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');

  // Modals
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddCatalog, setShowAddCatalog] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState<Catalog | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Quick Inline Price Editing
  const [quickPriceEditingId, setQuickPriceEditingId] = useState<string | null>(null);
  const [quickPriceVal, setQuickPriceVal] = useState<string>('');

  const startQuickPrice = (p: Product) => {
    setQuickPriceEditingId(p.id);
    setQuickPriceVal(p.price.toString());
  };

  const saveQuickPrice = async (p: Product) => {
    const num = parseFloat(quickPriceVal);
    if (isNaN(num) || num < 0) {
      showToast('Please enter a valid price', 'error');
      return;
    }
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, price: num } : item))
    );
    setQuickPriceEditingId(null);

    const { ok, data } = await adminFetch(`/api/admin/products/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: num }),
    });

    if (!ok) {
      showToast(data.error || 'Failed to update price', 'error');
      await loadData();
      return;
    }

    if (data.product) {
      setProducts((prev) =>
        prev.map((item) => (item.id === data.product.id ? data.product : item))
      );
    }
    showToast(`Updated price for "${p.name}" to ₹${num.toLocaleString('en-IN')}`);
    broadcastAdminUpdate('PRODUCTS_UPDATED');
    await loadData();
  };

  // Auth Check
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/check');
        const data = await res.json();
        if (!res.ok || !data.authenticated) { router.replace('/admin'); return; }
        setAuthenticated(true);
        setAdminPhone(data.phone);
      } catch { router.replace('/admin'); }
    })();
  }, [router]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pr, cr, or, sr] = await Promise.all([
        adminFetch('/api/admin/products'),
        adminFetch('/api/admin/catalogs'),
        adminFetch('/api/admin/orders'),
        adminFetch('/api/admin/settings'),
      ]);
      if (pr.ok) setProducts(pr.data.products || []);
      if (cr.ok) setCatalogs(cr.data.catalogs || []);
      if (or.ok) setOrders(or.data.orders || []);
      if (sr.ok) setSettings(sr.data.settings || null);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (authenticated) loadData();
  }, [authenticated, loadData]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin');
  };

  // ── Products ──────────────────────────────────────────────
  const filteredProducts = products.filter((p) => {
    if (productStatusFilter !== 'all' && p.status !== productStatusFilter) return false;
    if (productCategoryFilter !== 'all' && !p.category.toLowerCase().includes(productCategoryFilter.toLowerCase())) return false;
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.variety.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSaveProduct = async (payload: Partial<Product>) => {
    setIsSaving(true);
    try {
      if (editingProduct) {
        // Optimistic update
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? { ...p, ...payload } : p))
        );
        const { ok, data } = await adminFetch(`/api/admin/products/${editingProduct.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!ok) {
          showToast(data.error || 'Update failed', 'error');
          await loadData();
          return;
        }
        if (data.product) {
          setProducts((prev) =>
            prev.map((p) => (p.id === data.product.id ? data.product : p))
          );
        }
        showToast('Product updated successfully!');
        setEditingProduct(null);
      } else {
        const { ok, data } = await adminFetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!ok) {
          showToast(data.error || 'Create failed', 'error');
          return;
        }
        if (data.product) {
          setProducts((prev) => [data.product, ...prev]);
        }
        showToast('Product created & published successfully!');
        setShowAddProduct(false);
        setProductStatusFilter('all');
        setProductCategoryFilter('all');
        setProductSearch('');
      }
      broadcastAdminUpdate('PRODUCTS_UPDATED');
      await loadData();
    } finally { setIsSaving(false); }
  };

  const handleArchiveProduct = async (id: string, name: string) => {
    if (!confirm(`Archive "${name}"? Customers won't see it, but orders are preserved.`)) return;
    const { ok, data } = await adminFetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    if (!ok) { showToast(data.error || 'Archive failed', 'error'); return; }
    showToast('Product archived.');
    broadcastAdminUpdate('PRODUCTS_UPDATED');
    await loadData();
  };

  const handlePublishToggle = async (product: Product) => {
    const newStatus = product.status === 'Published' ? 'Draft' : 'Published';
    const { ok, data } = await adminFetch(`/api/admin/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!ok) { showToast(data.error || 'Update failed', 'error'); return; }
    showToast(`Product ${newStatus === 'Published' ? 'published!' : 'unpublished.'}`);
    broadcastAdminUpdate('PRODUCTS_UPDATED');
    await loadData();
  };

  // ── Catalogs ─────────────────────────────────────────────
  const handleSaveCatalog = async (payload: Partial<Catalog>) => {
    setIsSaving(true);
    try {
      if (editingCatalog) {
        const { ok, data } = await adminFetch(`/api/admin/catalogs/${editingCatalog.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!ok) { showToast(data.error || 'Update failed', 'error'); return; }
        showToast('Catalog updated!');
        setEditingCatalog(null);
      } else {
        const { ok, data } = await adminFetch('/api/admin/catalogs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!ok) { showToast(data.error || 'Create failed', 'error'); return; }
        showToast('Catalog created!');
        setShowAddCatalog(false);
      }
      broadcastAdminUpdate('PRODUCTS_UPDATED');
      await loadData();
    } finally { setIsSaving(false); }
  };

  const handleArchiveCatalog = async (id: string, name: string) => {
    if (!confirm(`Archive catalog "${name}"?`)) return;
    const { ok, data } = await adminFetch(`/api/admin/catalogs/${id}`, { method: 'DELETE' });
    if (!ok) { showToast(data.error || 'Failed', 'error'); return; }
    showToast('Catalog archived.');
    broadcastAdminUpdate('PRODUCTS_UPDATED');
    await loadData();
  };

  // ── Order Status ────────────────────────────────────────
  const handleOrderStatus = async (orderNumber: string, status: string) => {
    // Optimistic update so UI responds immediately
    setOrders((prev) =>
      prev.map((o) => (o.orderNumber === orderNumber ? { ...o, status: status as Order['status'] } : o))
    );

    const { ok, data } = await adminFetch(`/api/admin/orders/${orderNumber}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!ok) {
      showToast(data.error || 'Failed to update order status', 'error');
      await loadData();
      return;
    }
    showToast(`Order ${orderNumber} → ${status}`);
    await loadData();
  };

  if (authenticated === null) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <span className="font-label-md text-primary animate-pulse">Checking authorization...</span>
      </div>
    );
  }

  // ── Stats ────────────────────────────────────────────────
  const stats = {
    total: products.length,
    published: products.filter((p) => p.status === 'Published').length,
    draft: products.filter((p) => p.status === 'Draft').length,
    archived: products.filter((p) => p.status === 'Archived').length,
    orders: orders.length,
    pendingOrders: orders.filter((o) => o.status === 'Pending').length,
    catalogs: catalogs.filter((c) => c.status === 'Active').length,
  };

  const navItems: { id: AdminSection; icon: string; label: string }[] = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { id: 'products', icon: 'inventory_2', label: 'Products' },
    { id: 'catalogs', icon: 'category', label: 'Catalogs' },
    { id: 'orders', icon: 'receipt_long', label: 'Orders' },
    { id: 'settings', icon: 'settings', label: 'Settings' },
  ];

  return (
    <div className="flex-1 flex min-h-screen bg-surface-container-lowest">
      {/* ── SIDEBAR ── */}
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed left-0 top-0 bottom-0 z-50 w-64 bg-surface border-r border-surface-container flex flex-col transition-transform duration-300 pt-20
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="px-4 py-3 border-b border-surface-container">
          <span className="font-label-sm text-[10px] text-secondary font-bold uppercase tracking-widest block mb-0.5">Admin Panel</span>
          <span className="font-label-md text-xs text-on-surface font-bold">{adminPhone}</span>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-label-md text-sm font-bold text-left transition-all ${
                activeSection === item.id
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
              {item.id === 'orders' && stats.pendingOrders > 0 && (
                <span className="ml-auto bg-[#cc4729] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">{stats.pendingOrders}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-surface-container flex flex-col gap-2">
          <Link href="/fish" target="_blank"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-primary hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            View Customer Site
          </Link>
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-700 hover:bg-red-50 transition-colors">
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-surface/90 backdrop-blur border-b border-surface-container h-14 flex items-center px-4 gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container">
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>
          <span className="font-headline-sm font-bold text-on-surface">
            {navItems.find((n) => n.id === activeSection)?.label}
          </span>
          <div className="ml-auto flex items-center gap-2">
            {activeSection === 'products' && (
              <button onClick={() => setShowAddProduct(true)}
                className="h-9 px-4 rounded-xl bg-primary text-on-primary font-label-md text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-primary-container transition-all">
                <span className="material-symbols-outlined text-[16px]">add</span>
                Add Product
              </button>
            )}
            {activeSection === 'catalogs' && (
              <button onClick={() => setShowAddCatalog(true)}
                className="h-9 px-4 rounded-xl bg-primary text-on-primary font-label-md text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-primary-container transition-all">
                <span className="material-symbols-outlined text-[16px]">add</span>
                Add Catalog
              </button>
            )}
            <button onClick={loadData} disabled={loading}
              className="h-9 w-9 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high disabled:opacity-40">
              <span className={`material-symbols-outlined text-[20px] text-primary ${loading ? 'animate-spin' : ''}`}>refresh</span>
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-6 overflow-y-auto">

          {/* ═══════════════ DASHBOARD ═══════════════ */}
          {activeSection === 'dashboard' && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Published Products', value: stats.published, icon: 'storefront', color: 'text-emerald-700 bg-emerald-50' },
                  { label: 'Draft Products', value: stats.draft, icon: 'edit_note', color: 'text-amber-700 bg-amber-50' },
                  { label: 'Active Catalogs', value: stats.catalogs, icon: 'category', color: 'text-primary bg-surface-container' },
                  { label: 'Pending Orders', value: stats.pendingOrders, icon: 'receipt_long', color: 'text-[#cc4729] bg-orange-50' },
                ].map((s) => (
                  <div key={s.label} className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container shadow-xs flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                      <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
                    </div>
                    <div>
                      <p className="font-headline-md font-extrabold text-on-surface text-2xl leading-none">{s.value}</p>
                      <p className="font-label-sm text-[11px] text-on-surface-variant mt-0.5">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button onClick={() => setShowAddProduct(true)}
                  className="p-5 rounded-2xl bg-primary text-on-primary flex flex-col items-start gap-2 text-left hover:bg-primary-container transition-all shadow-sm group">
                  <span className="material-symbols-outlined text-[28px]">add_box</span>
                  <span className="font-headline-sm font-bold">Add New Product</span>
                  <span className="font-body-sm text-xs opacity-80">Create a product and publish it to the catalog</span>
                </button>
                <button onClick={() => setShowAddCatalog(true)}
                  className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container flex flex-col items-start gap-2 text-left hover:border-primary/40 hover:shadow-sm transition-all">
                  <span className="material-symbols-outlined text-[28px] text-primary">create_new_folder</span>
                  <span className="font-headline-sm font-bold text-on-surface">New Catalog</span>
                  <span className="font-body-sm text-xs text-on-surface-variant">Add a new product category</span>
                </button>
                <button onClick={() => setActiveSection('orders')}
                  className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container flex flex-col items-start gap-2 text-left hover:border-primary/40 hover:shadow-sm transition-all">
                  <span className="material-symbols-outlined text-[28px] text-[#cc4729]">local_shipping</span>
                  <span className="font-headline-sm font-bold text-on-surface">Manage Orders</span>
                  <span className="font-body-sm text-xs text-on-surface-variant">{stats.pendingOrders} pending orders</span>
                </button>
              </div>

              {orders.slice(0, 5).length > 0 && (
                <div>
                  <h2 className="font-label-md text-xs font-bold text-secondary uppercase tracking-wider mb-3">Recent Orders</h2>
                  <div className="flex flex-col gap-2">
                    {orders.slice(0, 5).map((o) => (
                      <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest border border-surface-container">
                        <div>
                          <span className="font-bold text-sm text-on-surface">{o.orderNumber}</span>
                          <span className="text-xs text-on-surface-variant ml-2">{o.customerName} · {o.phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary text-sm">₹{o.total.toLocaleString('en-IN')}</span>
                          <StatusBadge status={o.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════ PRODUCTS ═══════════════ */}
          {activeSection === 'products' && (
            <div className="flex flex-col gap-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">search</span>
                  <input type="search" placeholder="Search products..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full h-10 pl-10 pr-3 rounded-xl bg-surface-container-low border border-outline-variant/60 text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none" />
                </div>
                <select value={productStatusFilter} onChange={(e) => setProductStatusFilter(e.target.value)}
                  className="h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/60 text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none">
                  <option value="all">All Status</option>
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
                <select value={productCategoryFilter} onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/60 text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none">
                  <option value="all">All Categories</option>
                  {catalogs.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div className="text-xs text-on-surface-variant font-label-sm">{filteredProducts.length} products</div>

              {loading ? (
                <div className="py-16 text-center text-primary font-label-md animate-pulse">Loading...</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {filteredProducts.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-lowest border border-surface-container hover:border-primary/30 transition-all group">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-surface-container flex items-center justify-center">
                        {p.primaryImage ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={p.primaryImage} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-on-surface-variant text-[24px]">image</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-on-surface truncate">{p.name}</span>
                          <StatusBadge status={p.status} />
                        </div>
                        <div className="text-xs text-on-surface-variant">{p.category}{p.variety ? ` · ${p.variety}` : ''}</div>
                        {quickPriceEditingId === p.id ? (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-primary font-bold text-sm">₹</span>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={quickPriceVal}
                              onChange={(e) => setQuickPriceVal(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveQuickPrice(p);
                                if (e.key === 'Escape') setQuickPriceEditingId(null);
                              }}
                              autoFocus
                              className="w-24 h-7 px-2 rounded-lg bg-surface-container border border-primary font-bold text-sm text-on-surface focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => saveQuickPrice(p)}
                              className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary-container transition-all"
                              title="Save price"
                            >
                              <span className="material-symbols-outlined text-[16px]">check</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setQuickPriceEditingId(null)}
                              className="w-7 h-7 rounded-lg bg-surface-container text-on-surface-variant flex items-center justify-center hover:bg-surface-container-high transition-all"
                              title="Cancel"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mt-0.5 group/price">
                            <div className="font-bold text-primary text-sm">
                              ₹{p.price.toLocaleString('en-IN')}
                            </div>
                            {p.isLiveFish && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                                Storefront: WhatsApp Inquiry Only
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => startQuickPrice(p)}
                              className="opacity-75 hover:opacity-100 transition-opacity px-1.5 py-0.5 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container text-[11px] font-medium flex items-center gap-0.5 cursor-pointer"
                              title="Quick edit price"
                            >
                              <span className="material-symbols-outlined text-[13px]">edit</span>
                              <span>Edit</span>
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => setEditingProduct(p)} title="Edit"
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container text-primary transition-colors">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button onClick={() => handlePublishToggle(p)} title={p.status === 'Published' ? 'Unpublish' : 'Publish'}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${p.status === 'Published' ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-700 hover:bg-emerald-50'}`}>
                          <span className="material-symbols-outlined text-[18px]">{p.status === 'Published' ? 'visibility_off' : 'publish'}</span>
                        </button>
                        <button onClick={() => handleArchiveProduct(p.id, p.name)} title="Archive"
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-600 transition-colors">
                          <span className="material-symbols-outlined text-[18px]">archive</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="py-16 text-center text-on-surface-variant font-body-md">No products match your filters.</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════ CATALOGS ═══════════════ */}
          {activeSection === 'catalogs' && (
            <div className="flex flex-col gap-3">
              {loading ? (
                <div className="py-16 text-center text-primary font-label-md animate-pulse">Loading...</div>
              ) : (
                catalogs.sort((a, b) => a.displayOrder - b.displayOrder).map((c) => (
                  <div key={c.id} className="flex items-center gap-3 p-4 rounded-xl bg-surface-container-lowest border border-surface-container">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-on-surface">{c.name}</span>
                        <StatusBadge status={c.status} />
                        <span className="text-[10px] text-on-surface-variant">Order: {c.displayOrder}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant truncate">{c.description}</p>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">
                        {products.filter((p) => p.category === c.name).length} products
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => setEditingCatalog(c)} title="Edit"
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container text-primary transition-colors">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button onClick={() => handleArchiveCatalog(c.id, c.name)} title="Archive"
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-600 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">archive</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
              {!loading && catalogs.length === 0 && (
                <div className="py-16 text-center text-on-surface-variant">No catalogs. Click &quot;Add Catalog&quot; to create one.</div>
              )}
            </div>
          )}

          {/* ═══════════════ ORDERS ═══════════════ */}
          {activeSection === 'orders' && (
            <div className="flex flex-col gap-4">
              {/* WhatsApp Direct Ordering Notice & Quick Link */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[22px]">chat</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                      Direct WhatsApp Ordering Active
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#25D366]/20 text-[#25D366]">Live</span>
                    </h3>
                    <p className="text-xs text-emerald-800/90 dark:text-emerald-300 mt-0.5">
                      Customer orders are dispatched directly to your WhatsApp (<strong>+91 78456 37566</strong>). Submitted web checkouts are also archived below for your logs.
                    </p>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${(settings?.customerInterface?.contact?.whatsappNumber || '917845637566').replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold transition-all shadow-sm shrink-0"
                >
                  <span className="material-symbols-outlined text-base">chat</span>
                  Open WhatsApp Orders
                </a>
              </div>

              {loading ? (
                <div className="py-16 text-center text-primary font-label-md animate-pulse">Loading...</div>
              ) : orders.length === 0 ? (
                <div className="py-16 text-center text-on-surface-variant">No orders yet.</div>
              ) : (
                orders.map((o) => (
                  <div key={o.id} className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-base text-primary">{o.orderNumber}</span>
                          <StatusBadge status={o.status} />
                        </div>
                        <div className="text-sm font-bold text-on-surface mt-0.5">{o.customerName}</div>
                        <div className="text-xs text-on-surface-variant">{o.phoneNumber}</div>
                        <div className="text-xs text-on-surface-variant mt-0.5">
                          {o.house}, {o.city}, {o.district}, {o.state} – {o.pinCode}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-xl text-on-surface">₹{o.total.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-on-surface-variant">{new Date(o.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="flex flex-col gap-1">
                      {o.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs bg-surface-container rounded-lg px-3 py-1.5">
                          <span className="text-on-surface">{item.productName} ({item.variety}) × {item.quantity}</span>
                          <span className="font-bold text-primary">₹{item.subtotal.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>

                    {/* Order status change */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-on-surface-variant font-bold">Update Status:</span>
                      {(['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'] as const).map((s) => (
                        <button key={s} onClick={() => handleOrderStatus(o.orderNumber, s)}
                          disabled={o.status === s}
                          className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition-all ${
                            o.status === s
                              ? 'bg-primary text-on-primary cursor-default'
                              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                          }`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ═══════════════ SETTINGS ═══════════════ */}
          {activeSection === 'settings' && (
            <SettingsManager
              key={settings ? `${settings.theme?.preset}-${settings.theme?.primaryColor}-${settings.customerInterface?.storeName}` : 'loading'}
              settings={settings}
              onRefresh={loadData}
              showToast={showToast}
            />
          )}
        </div>
      </div>

      {/* ═══════════════ MODALS ═══════════════ */}

      {showAddProduct && (
        <Modal title="Add New Product" onClose={() => setShowAddProduct(false)}>
          <ProductForm catalogs={catalogs} onSave={handleSaveProduct} onCancel={() => setShowAddProduct(false)} isSaving={isSaving} mode="add" />
        </Modal>
      )}

      {editingProduct && (
        <Modal title={`Edit: ${editingProduct.name}`} onClose={() => setEditingProduct(null)}>
          <ProductForm initial={editingProduct} catalogs={catalogs} onSave={handleSaveProduct} onCancel={() => setEditingProduct(null)} isSaving={isSaving} mode="edit" />
        </Modal>
      )}

      {showAddCatalog && (
        <Modal title="Add New Catalog" onClose={() => setShowAddCatalog(false)}>
          <CatalogForm onSave={handleSaveCatalog} onCancel={() => setShowAddCatalog(false)} isSaving={isSaving} mode="add" />
        </Modal>
      )}

      {editingCatalog && (
        <Modal title={`Edit Catalog: ${editingCatalog.name}`} onClose={() => setEditingCatalog(null)}>
          <CatalogForm initial={editingCatalog} onSave={handleSaveCatalog} onCancel={() => setEditingCatalog(null)} isSaving={isSaving} mode="edit" />
        </Modal>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
