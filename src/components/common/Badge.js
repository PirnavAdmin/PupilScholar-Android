import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../constants/spacing';
import { AppText } from '../typography/AppText';

/**
 * Universal Badge / Chip Component
 * 
 * @param {'success'|'warning'|'danger'|'info'|'neutral'|'teacher'|'student'|'parent'} variant
 * @param {'sm'|'md'} size
 * @param {boolean} showDot
 */
export const Badge = ({
  label,
  variant = 'neutral',
  size = 'md',
  showDot = false,
  style,
  textStyle,
}) => {
  const { bg, text, dot } = getBadgeColors(variant);
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.base,
        isSmall ? styles.smallContainer : styles.mediumContainer,
        { backgroundColor: bg },
        style,
      ]}
    >
      {showDot ? (
        <View style={[styles.dot, { backgroundColor: dot || text }]} />
      ) : null}
      <AppText
        variant={isSmall ? 'caption' : 'bodyBold'}
        style={[
          styles.text,
          isSmall && styles.smallText,
          { color: text },
          textStyle,
        ]}
      >
        {label}
      </AppText>
    </View>
  );
};

const getBadgeColors = (variant) => {
  switch (variant) {
    case 'success':
      return {
        bg: COLORS.status.successBg,
        text: COLORS.status.success,
        dot: COLORS.status.success,
      };
    case 'warning':
      return {
        bg: COLORS.status.warningBg,
        text: COLORS.status.warning,
        dot: COLORS.status.warning,
      };
    case 'danger':
      return {
        bg: COLORS.status.dangerBg,
        text: COLORS.status.danger,
        dot: COLORS.status.danger,
      };
    case 'info':
      return {
        bg: COLORS.status.infoBg,
        text: COLORS.status.info,
        dot: COLORS.status.info,
      };
    case 'teacher':
      return {
        bg: COLORS.roles.teacher.light,
        text: COLORS.roles.teacher.text,
        dot: COLORS.roles.teacher.primary,
      };
    case 'student':
      return {
        bg: COLORS.roles.student.light,
        text: COLORS.roles.student.text,
        dot: COLORS.roles.student.primary,
      };
    case 'parent':
      return {
        bg: COLORS.roles.parent.light,
        text: COLORS.roles.parent.text,
        dot: COLORS.roles.parent.primary,
      };
    case 'neutral':
    default:
      return {
        bg: COLORS.surfaceVariant,
        text: COLORS.text.secondary,
        dot: COLORS.text.muted,
      };
  }
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
  },
  smallContainer: {
    paddingVertical: 2,
    paddingHorizontal: SPACING.sm,
  },
  mediumContainer: {
    paddingVertical: 4,
    paddingHorizontal: SPACING.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  smallText: {
    fontSize: 11,
    lineHeight: 14,
  },
});

export default Badge;
