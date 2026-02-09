import type { Branding } from '../types';

/**
 * Apply restaurant branding as CSS custom properties on :root.
 */
export function applyBranding(branding: Branding): void {
  const root = document.documentElement;

  if (branding.primary_color) {
    root.style.setProperty('--brand-primary', branding.primary_color);
  }
  if (branding.secondary_color) {
    root.style.setProperty('--brand-secondary', branding.secondary_color);
  }
  if (branding.accent_color) {
    root.style.setProperty('--brand-accent', branding.accent_color);
  }
  if (branding.font_family) {
    root.style.setProperty('--brand-font', `'${branding.font_family}', sans-serif`);
  }
}
