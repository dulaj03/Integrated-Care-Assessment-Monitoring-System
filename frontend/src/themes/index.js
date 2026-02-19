/**
 * I-CAMS Theme System
 * Central theme configuration for consistent UI
 */

import colors from './colors';
import typography from './typography';

const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

const borderRadius = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
};

const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
  focus: '0 0 0 3px rgba(0, 102, 204, 0.1)',
};

const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  xxl: '1536px',
};

// Media query helpers
const media = {
  xs: `(min-width: 320px)`,
  sm: `(min-width: 640px)`,
  md: `(min-width: 768px)`,
  lg: `(min-width: 1024px)`,
  xl: `(min-width: 1280px)`,
  xxl: `(min-width: 1536px)`,
};

const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
  media,

  // Accessibility
  accessibility: {
    highContrastMode: false,
    focusOutlineWidth: '2px',
    focusOutlineColor: colors.primary.main,
    reducedMotion: false,
  },
};

export default theme;
export { colors, typography, spacing, borderRadius, shadows, breakpoints, media };
