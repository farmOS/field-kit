import app from 'farmos-client';
import data from '@/data';
import login from '@/login';
// TODO: remove jQuery or pull it in via npm
import jQuery from './jquery'; // eslint-disable-line no-unused-vars

app(data, login);
