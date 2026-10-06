
// Module singleton (performance.md §4b-1: kill per-row CPU) — allocating
// Intl.NumberFormat per product row wastes ~1ms/row over home rails.
let phpFormatter: Intl.NumberFormat | null = null;

function getPhpFormatter(): Intl.NumberFormat | null {
  if (phpFormatter) return phpFormatter;
  try {
    phpFormatter = new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    });
    return phpFormatter;
  } catch {
    return null;
  }
}

export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'Price varies';
  // Use en-PH for Philippine Peso
  // Note: Intl.NumberFormat might not be fully supported on all Android versions without polyfill,
  // but usually works on modern RN. If issues arise, a simple replacement can be used.
  const formatter = getPhpFormatter();
  if (formatter) {
    try {
      return formatter.format(value);
    } catch {
      // Fall through to manual fallback below
    }
  }
  // Fallback for older environments
  return `₱${value.toFixed(2)}`;
};
