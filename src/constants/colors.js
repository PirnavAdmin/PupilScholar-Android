/**
 * Global Color Palette for PupilScholar School Management System
 * Designed for high readability, contrast, and cross-platform consistency.
 */

export const COLORS = {
  // Brand Colors
  primary: '#1E40AF',       // Deep Royal Blue
  primaryLight: '#3B82F6',  // Vibrant Blue
  primaryDark: '#1E3A8A',   // Navy Blue
  primarySurface: '#EFF6FF', // Soft Blue Background

  // Role Accent Colors
  roles: {
    teacher: {
      primary: '#7C3AED',
      light: '#EDE9FE',
      text: '#5B21B6',
      badge: '#DDD6FE',
    },
    student: {
      primary: '#059669',
      light: '#ECFDF5',
      text: '#065F46',
      badge: '#A7F3D0',
    },
    parent: {
      primary: '#D97706',
      light: '#FFFBEB',
      text: '#92400E',
      badge: '#FDE68A',
    },
  },

  // UI Surfaces & Backgrounds
  background: '#F8FAFC',    // Soft Slate
  surface: '#FFFFFF',       // Card & Sheet Pure White
  surfaceVariant: '#F1F5F9', // Subtle Gray Surface
  surfaceElevated: '#FFFFFF',

  // Text Colors
  text: {
    primary: '#0F172A',     // Slate 900
    secondary: '#475569',   // Slate 600
    muted: '#94A3B8',       // Slate 400
    inverse: '#FFFFFF',
    link: '#2563EB',
  },

  // Borders & Dividers
  border: {
    default: '#E2E8F0',     // Slate 200
    focused: '#3B82F6',     // Blue 500
    subtle: '#F1F5F9',      // Slate 100
  },

  // Semantic Status Colors
  status: {
    success: '#10B981',
    successBg: '#D1FAE5',
    warning: '#F59E0B',
    warningBg: '#FEF3C7',
    danger: '#EF4444',
    dangerBg: '#FEE2E2',
    info: '#3B82F6',
    infoBg: '#DBEAFE',
  },

  // Shadows (RGBA values for custom shadows)
  shadow: 'rgba(15, 23, 42, 0.08)',
  shadowDark: 'rgba(15, 23, 42, 0.16)',
};

export default COLORS;
