/**
 * Compute binomial coefficient C(n, k).
 * Returns 0 for invalid inputs (k < 0, k > n, n < 0).
 */
export function comb(n, k) {
  if (k < 0 || k > n || n < 0) return 0
  if (k === 0 || k === n) return 1
  if (k > n - k) k = n - k
  let result = 1
  for (let i = 0; i < k; i++) {
    result = (result * (n - i)) / (i + 1)
  }
  return Math.round(result)
}
