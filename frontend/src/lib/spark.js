export function sparkSeed(seed = 1, n = 24, dir = 1) {
  const a = []
  let v = 50
  for (let i = 0; i < n; i++) {
    v += (Math.sin((i + seed) / 3) * 4 + (Math.random() - 0.5) * 5) * dir
    a.push(v)
  }
  return a
}
