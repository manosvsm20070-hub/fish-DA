/**
 * Broadcast admin changes to customer-facing tabs in real-time.
 * Uses persistent BroadcastChannel (0ms delay) + localStorage fallback + local window event.
 */

let sharedChannel: BroadcastChannel | null = null;

function getSharedChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  if (!('BroadcastChannel' in window)) return null;
  if (!sharedChannel) {
    try {
      sharedChannel = new BroadcastChannel('dolphin_site_sync');
    } catch {}
  }
  return sharedChannel;
}

export function broadcastAdminUpdate(
  type: 'SETTINGS_UPDATED' | 'PRODUCTS_UPDATED' | 'ALL',
  payload?: Record<string, unknown>
) {
  if (typeof window === 'undefined') return;

  const msg = { type, ...payload, timestamp: Date.now() };

  // 1. Dispatch event to current tab immediately
  if (type === 'PRODUCTS_UPDATED' || type === 'ALL') {
    window.dispatchEvent(new CustomEvent('dolphin_products_updated'));
  }

  // 2. BroadcastChannel: instant cross-tab message without premature closure
  try {
    const channel = getSharedChannel();
    if (channel) {
      channel.postMessage(msg);
    }
  } catch (e) {
    console.warn('BroadcastChannel error:', e);
  }

  // 3. LocalStorage event: cross-tab fallback
  try {
    localStorage.setItem('dolphin_site_sync', JSON.stringify(msg));
  } catch {}
}
