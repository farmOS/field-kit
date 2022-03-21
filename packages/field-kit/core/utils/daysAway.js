export default (t, x) => {
  const ms = new Date(t).valueOf() + (1000 * 60 * 60 * 24 * x);
  const iso = new Date(ms).toISOString();
  return iso;
};
