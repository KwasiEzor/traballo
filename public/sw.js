// Traballo dashboard service worker — Web Push only (TRB-115).
// No offline caching: the PWA manifest covers "add to home screen", this
// worker exists solely to receive and display push notifications.

self.addEventListener("push", (event) => {
  let payload = { title: "Traballo" };
  try {
    if (event.data) payload = event.data.json();
  } catch {
    payload = { title: "Traballo", body: event.data && event.data.text() };
  }

  const title = payload.title || "Traballo";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: payload.url || "/dashboard" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
