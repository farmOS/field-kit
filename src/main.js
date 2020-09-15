import app from './core/app';
import tasks from './field-modules/tasks/module';
import onupdatefound from './onupdatefound';

app('#app', [
  tasks,
]);

// Check that service workers are registered (for production environment only)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  // Use the window load event to keep the page load performant
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        registration.addEventListener('updatefound', onupdatefound(registration));
      });
  });
}
