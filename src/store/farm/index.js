/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import state from './state'
import * as getters from './getters'
import * as mutations from './mutations'
import * as actions from './actions'

const farmModule = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

export default farmModule;