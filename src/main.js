import app from '@/client/app';
import camera from '@/vue-plugins/camera-cordova';
import db from '@/vue-plugins/websql';
import http from '@/vue-plugins/http';
import login from '@/vue-plugins/login';

app('#app', [
  camera,
  db,
  http,
  login,
]);
