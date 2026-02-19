/**
 * I-CAMS Typography System
 * Clean, readable fonts for medical interface
 */

export const typography = {
  fontFamily: {
    primary: "'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
    monospace: "'Courier New', 'Courier', monospace",
  },

  fontSize: {
    // Headings
    h1: '2.5rem',    // 40px
    h2: '2rem',      // 32px
    h3: '1.75rem',   // 28px
    h4: '1.5rem',    // 24px
    h5: '1.25rem',   // 20px
    h6: '1rem',      // 16px

    // Body
    body: '1rem',        // 16px
    bodyLarge: '1.125rem', // 18px
    bodySmall: '0.875rem', // 14px

    // UI
    button: '1rem',      // 16px
    label: '0.875rem',   // 14px
    caption: '0.75rem',  // 12px
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.2,
    base: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  // Predefined text styles
  styles: {
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.5px',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.3px',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    button: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.4,
    },
  },
};

export default typography;
