import app from '@/core/app';
import weather from '@/field-modules/weather';
import logs from '@/field-modules/my-logs';

app('#app', [
  logs,
  weather,
]);

// Check that service workers are registered (for production environment only)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  // Use the window load event to keep the page load performant
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}
