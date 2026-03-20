export const Colors = {
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    tertiary: '#E8E8E8',
  },
  accent: {
    primary: '#000000',
    secondary: '#333333',
    tertiary: '#666666',
  },
  text: {
    primary: '#000000',
    secondary: '#666666',
    muted: '#999999',
  },
  status: {
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#FF5252',
  },
  border: '#E0E0E0',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FontSizes = {
  h1: 32,
  h2: 24,
  h3: 20,
  body: 16,
  caption: 14,
  small: 12,
} as const;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;