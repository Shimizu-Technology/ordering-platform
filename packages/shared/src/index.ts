/**
 * @shimizu/shared
 * 
 * Shared components, hooks, stores, and utilities for the ordering platform.
 * 
 * This package will be populated as we extract components from the frontends.
 * For now, it's a placeholder to establish the monorepo structure.
 */

// Components will be exported here as we extract them
// export { MenuGrid } from './components/menu/MenuGrid';
// export { CartDrawer } from './components/cart/CartDrawer';
// etc.

// Placeholder export to make the package valid
export const VERSION = '1.0.0';

// Types
export type { MenuItem, MenuCategory } from './types/menu';
export type { Order, OrderItem, OrderStatus } from './types/order';
export type { Restaurant } from './types/restaurant';

// Utils
export {
  isCurrentlyOpen,
  getTodayHours,
  formatWeeklyHours,
  formatTime,
  type WeekHours,
  type DayHours,
} from './utils/hours';

// Components
export { TipSelector, type TipOption } from './components/TipSelector';
export { default as OptimizedImage } from './components/OptimizedImage';

// Image Utils
export {
  getImgixImageUrl,
  getWidthsForContext,
  getSizesForContext,
  type ImgixImageOptions,
  type ImageContext,
} from './utils/image';
