import { MutationTree } from 'vuex';
import { AuthStateInterface } from './state';

const mutation: MutationTree<AuthStateInterface> = {
  someMutation (/* state: AuthStateInterface */) {
    // your code
  }
};

export default mutation;
