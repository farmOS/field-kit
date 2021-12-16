export interface AuthStateInterface {
  prop: boolean;
}

function state(): AuthStateInterface {
  return {
    prop: false,
  };
}

export default state;
