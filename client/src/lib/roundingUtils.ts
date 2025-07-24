/**
 * Adjusts an array of values (rounded to 1dp) so their sum matches the rounded total,
 * by applying the smallest possible adjustment to the value that requires the least change.
 *
 * @param values - The original (unrounded) values.
 * @param total - The desired total (unrounded or rounded to 1dp).
 * @param decimalPlaces - Number of decimal places to round to (default: 1).
 * @returns An array of values (rounded to decimalPlaces) that sum to total (rounded to decimalPlaces).
 */
export function adjustValuesToTotal(
  values: number[],
  total: number,
  decimalPlaces: number = 1
): number[] {
  const factor = Math.pow(10, decimalPlaces);
  const rounded = values.map(x => Math.round(x * factor) / factor);
  const sum = rounded.reduce((a, b) => a + b, 0);
  const roundedTotal = Math.round(total * factor) / factor;
  const diff = Math.round((roundedTotal - sum) * factor) / factor;
  if (Math.abs(diff) < 1 / factor / 2) return rounded; // Already close enough

  // Find the index where the adjustment is least perceptible
  let minDelta = Infinity;
  let bestIdx = 0;
  for (let i = 0; i < rounded.length; i++) {
    const original = values[i];
    const adjusted = Math.round((rounded[i] + diff) * factor) / factor;
    const delta = Math.abs(adjusted - original);
    if (delta < minDelta) {
      minDelta = delta;
      bestIdx = i;
    }
  }
  // Apply the adjustment
  rounded[bestIdx] = Math.round((rounded[bestIdx] + diff) * factor) / factor;
  return rounded;
} 