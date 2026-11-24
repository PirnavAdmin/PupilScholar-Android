import React from 'react';
import { Pressable, StyleSheet, View, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS, SHADOWS } from '../../constants/spacing';
import { AppText } from '../typography/AppText';

/**
 * Universal Button Component
 * 
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'|'soft'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {'teacher'|'student'|'parent'|null} role
 * @param {boolean} loading
 * @param {boolean} disabled
 * @param {boolean} fullWidth
 * @param {React.ReactNode} leftIcon
 * @param {React.ReactNode} rightIcon
 */
export const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  role = null,
  loading = false,
  disabled = false,
  fullWidth = true,
  leftIcon = null,
  rightIcon = null,
  style,
  textStyle,
  ...rest
}) => {
  const isInteractive = !disabled && !loading;

  // Resolve base colors depending on variant and role
  const { bg, border, textColor, indicatorColor } = getButtonColors(variant, role, disabled);
  const sizeStyles = SIZE_STYLES[size] || SIZE_STYLES.md;

  return (
    <Pressable
      onPress={isInteractive ? onPress : null}
      disabled={!isInteractive}
      style={({ pressed }) => [
        styles.base,
        sizeStyles.container,
        {
          backgroundColor: bg,
          borderColor: border || 'transparent',
          borderWidth: border ? 1.5 : 0,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          width: fullWidth ? '100%' : 'auto',
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        variant === 'primary' && !disabled && SHADOWS.small,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      {...rest}
    >
      {loading ? (
        <View style={styles.contentRow}>
          <ActivityIndicator size="small" color={indicatorColor} />
          {title ? (
            <AppText
              variant={sizeStyles.textVariant}
              style={[styles.textWithLoader, { color: textColor }, textStyle]}
            >
              Please wait...
            </AppText>
          ) : null}
        </View>
      ) : (
        <View style={styles.contentRow}>
          {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
          <AppText
            variant={sizeStyles.textVariant}
            style={[{ color: textColor, fontWeight: '600' }, textStyle]}
          >
            {title}
          </AppText>
          {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
        </View>
      )}
    </Pressable>
  );
};

const getButtonColors = (variant, role, disabled) => {
  // If role specific
  const roleColor = role && COLORS.roles[role] ? COLORS.roles[role].primary : null;
  const roleLight = role && COLORS.roles[role] ? COLORS.roles[role].light : null;
  const roleText = role && COLORS.roles[role] ? COLORS.roles[role].text : null;

  switch (variant) {
    case 'primary': {
      const bg = roleColor || COLORS.primary;
      return {
        bg,
        border: null,
        textColor: COLORS.text.inverse,
        indicatorColor: COLORS.text.inverse,
      };
    }
    case 'secondary':
      return {
        bg: COLORS.primarySurface,
        border: null,
        textColor: COLORS.primary,
        indicatorColor: COLORS.primary,
      };
    case 'outline': {
      const color = roleColor || COLORS.primary;
      return {
        bg: 'transparent',
        border: color,
        textColor: color,
        indicatorColor: color,
      };
    }
    case 'ghost': {
      const color = roleColor || COLORS.primary;
      return {
        bg: 'transparent',
        border: null,
        textColor: color,
        indicatorColor: color,
      };
    }
    case 'soft': {
      return {
        bg: roleLight || COLORS.surfaceVariant,
        border: null,
        textColor: roleText || COLORS.text.primary,
        indicatorColor: roleColor || COLORS.primary,
      };
    }
    case 'danger':
      return {
        bg: COLORS.status.danger,
        border: null,
        textColor: COLORS.text.inverse,
        indicatorColor: COLORS.text.inverse,
      };
    default:
      return {
        bg: COLORS.primary,
        border: null,
        textColor: COLORS.text.inverse,
        indicatorColor: COLORS.text.inverse,
      };
  }
};

const SIZE_STYLES = {
  sm: {
    container: {
      paddingVertical: SPACING.xs + 2,
      paddingHorizontal: SPACING.md,
      borderRadius: RADIUS.sm,
      minHeight: 34,
    },
    textVariant: 'caption',
  },
  md: {
    container: {
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      borderRadius: RADIUS.md,
      minHeight: 46,
    },
    textVariant: 'bodyBold',
  },
  lg: {
    container: {
      paddingVertical: SPACING.lg - 2,
      paddingHorizontal: SPACING.xl,
      borderRadius: RADIUS.lg,
      minHeight: 52,
    },
    textVariant: 'subtitle',
  },
};

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWithLoader: {
    marginLeft: SPACING.sm,
  },
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
  },
});

export default Button;
