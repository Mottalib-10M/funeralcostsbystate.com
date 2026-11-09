import { formatPercent } from './format';
/** Percentage: two decimals under 1 %, one under 10 %, none above. */
export const pct = (x: number, d?: number) => formatPercent(x, d ?? (x < 0.01 ? 2 : x < 0.1 ? 1 : 0));
