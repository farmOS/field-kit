import loader from './spa/loader';
import data from '@/data';
import login from '@/login';

//this jQuery import will NOT be needed when the app runs on the server, as jQuery is already installed.
import jQuery from './jQuery';

const app = loader(data, login);
