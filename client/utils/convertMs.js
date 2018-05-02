export default (ms) => {
  const rounded = 1000 * Math.round(ms / 1000);
  const d = new Date(rounded);
  const s = d.getUTCSeconds();
  return `${d.getUTCMinutes()}:${s >= 10 ? '' : '0'}${s}`;
};
