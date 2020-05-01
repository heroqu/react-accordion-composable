/**
 * timestamp with random part
 */
export function timestamp() {
  const t = `${+new Date()}`;
  const r = `00000000000${Math.floor(Math.random() * 1000000000000)}`.slice(
    -12,
  );
  return `${t}-${r}`;
}

export function toArray(x) {
  return Array.isArray(x) ? x : [x];
}
