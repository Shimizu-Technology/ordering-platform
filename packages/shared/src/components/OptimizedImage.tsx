import { memo } from 'react';
import type { ImgixImageOptions, ImageContext } from '../utils/image';
import { getImgixImageUrl, getSizesForContext, getWidthsForContext } from '../utils/image';

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** Source URL of the image */
  src: string | undefined | null;
  /** Imgix transformation options */
  imgixOptions?: ImgixImageOptions;
  /** Predefined context for responsive sizing */
  context?: ImageContext;
  /** Custom widths for srcset (overrides context) */
  widths?: number[];
  /** Custom sizes attribute (overrides context) */
  sizes?: string;
  /** Fallback image if src is missing */
  fallbackSrc?: string;
  /** Load with high priority (eager loading) */
  priority?: boolean;
  /** Fetch priority hint */
  fetchPriority?: 'high' | 'low' | 'auto';
  /** Imgix domain (from env) */
  imgixDomain?: string;
}

/**
 * Optimized image component with Imgix CDN support
 * Generates responsive srcset for different screen sizes
 */
const OptimizedImage = memo(({
  src,
  imgixOptions,
  context,
  widths,
  sizes,
  fallbackSrc,
  priority = false,
  fetchPriority,
  imgixDomain,
  alt = '',
  onError,
  ...imgProps
}: OptimizedImageProps) => {
  const resolvedSrc = src || fallbackSrc;
  if (!resolvedSrc) return null;

  const resolvedWidths = widths || getWidthsForContext(context);
  const resolvedSizes = sizes || getSizesForContext(context);

  const baseOptions: ImgixImageOptions = {
    auto: 'format,compress',
    ...imgixOptions,
  };

  // Build srcset with multiple widths
  const srcSet = resolvedWidths
    .map((width) => {
      const url = getImgixImageUrl(resolvedSrc, { ...baseOptions, width }, imgixDomain);
      return url ? `${url} ${width}w` : null;
    })
    .filter(Boolean)
    .join(', ');

  // Default src uses first (smallest) width
  const defaultSrc = getImgixImageUrl(resolvedSrc, { ...baseOptions, width: resolvedWidths[0] }, imgixDomain) || resolvedSrc;

  const loading = priority ? 'eager' : 'lazy';

  return (
    <img
      src={defaultSrc}
      srcSet={srcSet || undefined}
      sizes={srcSet ? resolvedSizes : undefined}
      alt={alt}
      loading={loading}
      decoding="async"
      {...(fetchPriority ? { fetchpriority: fetchPriority } : {})}
      onError={(event) => {
        // On error, try fallback if different from current src
        if (fallbackSrc && (event.currentTarget.src || '') !== fallbackSrc) {
          event.currentTarget.src = fallbackSrc;
        }
        onError?.(event);
      }}
      {...imgProps}
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
