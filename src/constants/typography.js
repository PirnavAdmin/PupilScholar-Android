/**
 * Global Typography Definitions
 */

import { Platform } from 'react-native';

const FONT_FAMILY = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'sans-serif',
});

export const TYPOGRAPHY = {
  h1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    fontFamily: FONT_FAMILY,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    fontFamily: FONT_FAMILY,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    fontFamily: FONT_FAMILY,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    fontFamily: FONT_FAMILY,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    fontFamily: FONT_FAMILY,
  },
  bodyBold: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    fontFamily: FONT_FAMILY,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    fontFamily: FONT_FAMILY,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: FONT_FAMILY,
  },
};

export default TYPOGRAPHY;
