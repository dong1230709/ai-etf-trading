export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        type: 'classic'
      });
      
      console.log('ServiceWorker 注册成功:', registration.scope);

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('有新版本可用');
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('ServiceWorker 注册失败:', error);
      return null;
    }
  }
  return null;
}

export async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
  }
}

export function showUpdateNotification() {
  if (confirm('有新版本可用，是否更新？')) {
    window.location.reload();
  }
}
