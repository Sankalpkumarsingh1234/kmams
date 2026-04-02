// src/utils/responsive.js
// Mobile-first responsive utilities for GigShield

/**
 * Responsive breakpoints (in pixels)
 */
export const breakpoints = {
  mobile: 320,      // Small phones
  tablet: 640,      // Portrait tablets
  desktop: 1024,    // Desktops
};

/**
 * Get responsive font size
 */
export function getResponsiveFontSize(mobileSize, tabletSize, desktopSize) {
  if (typeof window === 'undefined') return mobileSize;
  
  const width = window.innerWidth;
  if (width < breakpoints.tablet) return mobileSize;
  if (width < breakpoints.desktop) return tabletSize || mobileSize;
  return desktopSize || tabletSize || mobileSize;
}

/**
 * Get responsive padding
 */
export function getResponsivePadding(mobile, tablet, desktop) {
  if (typeof window === 'undefined') return mobile;
  
  const width = window.innerWidth;
  if (width < breakpoints.tablet) return mobile;
  if (width < breakpoints.desktop) return tablet || mobile;
  return desktop || tablet || mobile;
}

/**
 * Mobile-first responsive styles
 */
export const responsiveMobileStyles = {
  // Card styles
  cardMobile: {
    padding: 16,
    borderRadius: 16,
    background: '#fff',
  },
  cardTablet: {
    padding: 20,
    borderRadius: 20,
    background: '#fff',
  },
  cardDesktop: {
    padding: 24,
    borderRadius: 24,
    background: '#fff',
  },

  // Button styles
  buttonMobile: {
    padding: '12px 16px',
    fontSize: 14,
    borderRadius: 10,
  },
  buttonTablet: {
    padding: '14px 20px',
    fontSize: 15,
    borderRadius: 12,
  },
  buttonDesktop: {
    padding: '16px 24px',
    fontSize: 16,
    borderRadius: 14,
  },

  // Input styles
  inputMobile: {
    padding: '10px 12px',
    fontSize: 14,
    borderRadius: 8,
  },
  inputTablet: {
    padding: '12px 14px',
    fontSize: 15,
    borderRadius: 10,
  },
  inputDesktop: {
    padding: '14px 16px',
    fontSize: 16,
    borderRadius: 12,
  },

  // Heading styles
  h1Mobile: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1.2,
  },
  h1Tablet: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1.2,
  },
  h1Desktop: {
    fontSize: 32,
    fontWeight: 700,
    lineHeight: 1.2,
  },

  // Body text
  bodyMobile: {
    fontSize: 13,
    lineHeight: 1.5,
  },
  bodyTablet: {
    fontSize: 14,
    lineHeight: 1.5,
  },
  bodyDesktop: {
    fontSize: 15,
    lineHeight: 1.6,
  },
};

/**
 * CSS Media Queries
 */
export const mediaQueries = {
  mobile: 'only screen and (max-width: 639px)',
  tablet: 'only screen and (min-width: 640px) and (max-width: 1023px)',
  desktop: 'only screen and (min-width: 1024px)',
  smallPhone: 'only screen and (max-width: 374px)',
  largePhone: 'only screen and (min-width: 412px)',
};

/**
 * Responsive container max-width
 */
export function getContainerMaxWidth() {
  if (typeof window === 'undefined') return '440px';
  
  const width = window.innerWidth;
  if (width < breakpoints.tablet) return '100%';
  if (width < breakpoints.desktop) return '90%';
  return '440px';
}

/**
 * Mobile-friendly spacing scale
 */
export const spacing = {
  xs: 4,     // 4px
  sm: 8,     // 8px
  md: 12,    // 12px
  lg: 16,    // 16px
  xl: 20,    // 20px
  xxl: 24,   // 24px
};

/**
 * Check if device is small phone (under 375px)
 */
export function isSmallPhone() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 375;
}

/**
 * Check if device is mobile
 */
export function isMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < breakpoints.tablet;
}

/**
 * Check if device is tablet
 */
export function isTablet() {
  if (typeof window === 'undefined') return false;
  const width = window.innerWidth;
  return width >= breakpoints.tablet && width < breakpoints.desktop;
}

/**
 * Check if device is desktop
 */
export function isDesktop() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= breakpoints.desktop;
}

/**
 * Get viewport width (with SSR safety)
 */
export function getViewportWidth() {
  if (typeof window === 'undefined') return 0;
  return window.innerWidth;
}
