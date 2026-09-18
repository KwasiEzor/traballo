/**
 * Browser-side push subscription helpers — TRB-115. Only ever called from
 * a client component, after a user opts into push (never on page load —
 * see NOTIFICATIONS_PLAN.md §3.11).
 */

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64Safe);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

export type BrowserPushSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

/**
 * Registers the service worker (idempotent), asks for notification
 * permission, and subscribes. Throws with a user-facing message on any
 * failure — unsupported browser, permission denied, no VAPID key.
 */
export async function subscribeToPush(
  vapidPublicKey: string
): Promise<BrowserPushSubscription> {
  if (!pushSupported()) {
    throw new Error("Les notifications push ne sont pas prises en charge sur ce navigateur.");
  }
  if (!vapidPublicKey) {
    throw new Error("Notifications push non configurées.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Autorisation refusée pour les notifications.");
  }

  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    }));

  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error("Abonnement push invalide.");
  }
  return {
    endpoint: json.endpoint,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
  };
}
