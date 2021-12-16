import { ActionTree } from 'vuex';
import { StateInterface } from '../index';
import { TaskStateInterface } from './state';

const actions: ActionTree<TaskStateInterface, StateInterface> = {
  someAction (/* context */) {
    // your code
  }
};

export default actions;
