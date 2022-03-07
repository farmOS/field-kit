// Strictly for preventing circular dependencies with the store
function closeOverRouter() {
  let router;
  return {
    getRouter() {
      return router;
    },
    setRouter(r) {
      router = r;
    },
  };
}

const closure = closeOverRouter();
export const { getRouter, setRouter } = closure;

export { getRouter as default };
