/**
 * I-CAMS Medical Color Palette
 * Professional, clean, clinical design for healthcare context
 */

export const colors = {
  // Primary Medical Blues
  primary: {
    main: '#0066CC',
    light: '#5599FF',
    lighter: '#E6F0FF',
    dark: '#004C99',
  },

  // Secondary Accent Blues
  secondary: {
    main: '#0099CC',
    light: '#4DB8E6',
    lighter: '#E6F5FF',
  },

  // Neutral Greys
  neutral: {
    white: '#FFFFFF',
    light: '#F5F5F5',
    lighter: '#FAFAFA',
    medium: '#CCCCCC',
    dark: '#666666',
    darker: '#333333',
    black: '#000000',
  },

  // Status Colors
  status: {
    success: '#28A745', // Green - Healthy
    warning: '#FFC107', // Yellow - Caution
    danger: '#DC3545', // Red - Alert/Critical
    info: '#0099CC',
    light: '#D4EDDA',
  },

  // Semantic Colors
  semantic: {
    healthy: '#22C55E', // Green
    moderate: '#FBBF24', // Amber
    critical: '#EF4444', // Red
  },

  // Text Colors
  text: {
    primary: '#333333',
    secondary: '#666666',
    light: '#999999',
    inverse: '#FFFFFF',
  },

  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    tertiary: '#FAFAFA',
  },

  // Border Colors
  border: {
    light: '#E0E0E0',
    medium: '#CCCCCC',
    dark: '#999999',
  },

  // High Contrast Mode (Accessibility)
  highContrast: {
    text: '#000000',
    background: '#FFFFFF',
    border: '#000000',
    focus: '#0000FF',
  },
};

export default colors;
