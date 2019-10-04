import 'farmOS-map/src/main';
import app from '@/client/app';
import camera from '@/vue-plugins/camera-cordova';
import idb from '@/vue-plugins/idb';
import http from '@/vue-plugins/http';
import login from '@/vue-plugins/login';
import weather from '@/vue-plugins/weather';

app('#app', [
  camera,
  idb,
  http,
  login,
  weather,
]);

// Check that service workers are registered (for production environment only)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  // Use the window load event to keep the page load performant
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}
