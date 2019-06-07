import app from '@/client/app';
import camera from '@/vue-plugins/camera-cordova';
import idb from '@/vue-plugins/idb';
import http from '@/vue-plugins/http';
import login from '@/vue-plugins/login';

app('#app', [
  camera,
  idb,
  http,
  login,
]);
