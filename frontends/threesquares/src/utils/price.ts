/**
 * Format a number as USD currency string.
 */
export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Format a price adjustment with +/- prefix.
 */
export function formatPriceAdjustment(amount: number): string {
  if (amount === 0) return 'Included';
  const sign = amount > 0 ? '+' : '-';
  return `${sign}$${Math.abs(amount).toFixed(2)}`;
}

/**
 * Calculate total price for a cart item including modifiers.
 */
export function calculateItemTotal(
  basePrice: number,
  modifiers: { price_adjustment: number }[],
  quantity: number
): number {
  const modifierTotal = modifiers.reduce((sum, m) => sum + m.price_adjustment, 0);
  return (basePrice + modifierTotal) * quantity;
}

/**
 * Calculate unit price (base + modifiers) without quantity.
 */
export function calculateUnitPrice(
  basePrice: number,
  modifiers: { price_adjustment: number }[]
): number {
  return basePrice + modifiers.reduce((sum, m) => sum + m.price_adjustment, 0);
}
