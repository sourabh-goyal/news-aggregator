const CACHE_NAME = 'news-aggregator-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});

let lastArticleCount = 0;

async function checkForNewArticles() {
  try {
    const response = await fetch('/api/articles/count');
    const data = await response.json();
    const currentCount = data.count;

    if (lastArticleCount === 0) {
      lastArticleCount = currentCount;
      return;
    }

    if (currentCount > lastArticleCount) {
      const articlesResponse = await fetch('/api/articles/recent');
      const articles = await articlesResponse.json();

      await self.registration.showNotification('Latest News Update', {
        body: `Here are the latest ${articles.length} articles:\n\n${articles
          .map(article => `• ${article.title}`)
          .join('\n')}`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        timestamp: Date.now(),
        tag: 'news-update',
        renotify: true,
        requireInteraction: true,
        data: { url: '/' },
        actions: [
          { action: 'open', title: 'View Articles' },
          { action: 'close', title: 'Close' }
        ]
      });
    }

    lastArticleCount = currentCount;
  } catch (error) {
    console.error('Error checking for new articles:', error);
  }
}

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      checkForNewArticles(),
      setInterval(checkForNewArticles, 30 * 60 * 1000)
    ])
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      timestamp: data.timestamp ? new Date(data.timestamp).getTime() : Date.now(),
      tag: 'news-update', // Group notifications
      renotify: true, // Show new notifications even if they have the same tag
      requireInteraction: true, // Keep notification visible until user interacts
      data: {
        url: data.url
      },
      actions: [
        {
          action: 'open',
          title: 'View Articles'
        },
        {
          action: 'close',
          title: 'Close'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
}); 