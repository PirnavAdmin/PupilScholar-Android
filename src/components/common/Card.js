import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS, SHADOWS } from '../../constants/spacing';

/**
 * Universal Card Component
 * 
 * @param {'elevated'|'outlined'|'flat'} variant
 * @param {'none'|'sm'|'md'|'lg'} padding
 * @param {'teacher'|'student'|'parent'|null} roleAccent
 * @param {Function} onPress
 */
export const Card = ({
  children,
  variant = 'elevated',
  padding = 'md',
  roleAccent = null,
  onPress = null,
  style,
  ...rest
}) => {
  const isPressable = typeof onPress === 'function';

  const paddingValue =
    padding === 'none'
      ? 0
      : padding === 'sm'
      ? SPACING.sm
      : padding === 'lg'
      ? SPACING.xl
      : SPACING.lg;

  const roleAccentColor =
    roleAccent && COLORS.roles[roleAccent] ? COLORS.roles[roleAccent].primary : null;

  const cardContent = (
    <View
      style={[
        styles.base,
        variant === 'elevated' && [styles.elevated, SHADOWS.small],
        variant === 'outlined' && styles.outlined,
        variant === 'flat' && styles.flat,
        { padding: paddingValue },
        roleAccentColor && { borderLeftWidth: 4, borderLeftColor: roleAccentColor },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );

  if (isPressable) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.pressableContainer,
          { opacity: pressed ? 0.92 : 1 },
        ]}
      >
        {cardContent}
      </Pressable>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  pressableContainer: {
    width: '100%',
  },
  base: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  elevated: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
  },
  outlined: {
    borderWidth: 1.5,
    borderColor: COLORS.border.default,
  },
  flat: {
    backgroundColor: COLORS.surfaceVariant,
  },
});

export default Card;
