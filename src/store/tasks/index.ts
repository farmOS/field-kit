import { Module } from 'vuex';
import { StateInterface } from '../index';
import state, { TaskStateInterface } from './state';
import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const taskModule: Module<TaskStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  getters,
  mutations,
  state
};

export default taskModule;
