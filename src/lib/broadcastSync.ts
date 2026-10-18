/**
 * Broadcast admin changes to customer-facing tabs in real-time.
 * Uses BroadcastChannel (0ms delay) + localStorage event fallback.
 */

export function broadcastAdminUpdate(
  type: 'SETTINGS_UPDATED' | 'PRODUCTS_UPDATED' | 'ALL',
  payload?: Record<string, unknown>
) {
  if (typeof window === 'undefined') return;

  // 1. BroadcastChannel: instant cross-tab message
  try {
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('dolphin_site_sync');
      channel.postMessage({ type, ...payload, timestamp: Date.now() });
      channel.close();
    }
  } catch (e) {
    console.warn('BroadcastChannel error:', e);
  }

  // 2. LocalStorage event: cross-tab fallback
  try {
    localStorage.setItem(
      'dolphin_site_sync',
      JSON.stringify({ type, ...payload, timestamp: Date.now() })
    );
  } catch {}
}
