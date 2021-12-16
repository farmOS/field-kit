import { MutationTree } from 'vuex';
import { TaskStateInterface } from './state';

const mutation: MutationTree<TaskStateInterface> = {
  someMutation (/* state: TaskStateInterface */) {
    // your code
  }
};

export default mutation;
