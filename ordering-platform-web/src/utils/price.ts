/**
 * Format a number as USD currency string.
 */
export function formatPrice(cents: number): string {
  return `$${cents.toFixed(2)}`;
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
