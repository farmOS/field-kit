import app from './core/app';
import logs from './field-modules/my-logs/module';

app('#app', [
  logs,
]);

const onUpdateFound = registration => () => {
  registration.installing.addEventListener('statechange', (e) => {
    const msg = 'A new version of Field Kit is available. '
    + 'Click OK to load it now, or Cancel to go back to the app.';
    // eslint-disable-next-line no-alert
    if (e.target.state === 'installed' && window.confirm(msg)) {
      navigator.serviceWorker.ready
        .then(reg => reg.active.postMessage({ type: 'SKIP_WAITING' }));
    }
  });
};

// Check that service workers are registered (for production environment only)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  // Use the window load event to keep the page load performant
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        registration.addEventListener('updatefound', onUpdateFound(registration));
      });
  });
}
