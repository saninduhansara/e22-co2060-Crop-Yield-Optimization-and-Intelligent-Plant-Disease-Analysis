// shared number formatting utilities

/**
 * Compactly formats large numbers for summary cards.
 * - <10k: shows full value (one decimal if needed)
 * - 10k–1M: shows value in K (rounded to nearest 0.1K)
 * - >=1M: shows value in M (rounded to nearest 0.1M)
 */
export function formatNumber(num: number): string {
  if (isNaN(num) || num === null) return '0';
  if (num < 10000) {
    return num % 1 === 0 ? num.toString() : num.toFixed(1);
  } else if (num < 1000000) {
    const rounded = Math.round(num / 100) * 100; // nearest hundred
    const inK = rounded / 1000;
    return inK % 1 === 0 ? `${inK}K` : `${inK.toFixed(1)}K`;
  } else {
    const rounded = Math.round(num / 100000) * 100000; // nearest lakh
    const inM = rounded / 1000000;
    return inM % 1 === 0 ? `${inM}M` : `${inM.toFixed(1)}M`;
  }
}
