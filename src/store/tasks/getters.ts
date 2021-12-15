import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import { TaskStateInterface } from './state';

const getters: GetterTree<TaskStateInterface, StateInterface> = {
  someGetter (/* context */) {
    // your code
  }
};

export default getters;
