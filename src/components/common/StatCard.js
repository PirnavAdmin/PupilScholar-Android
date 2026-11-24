import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS, SHADOWS } from '../../constants/spacing';
import { AppText } from '../typography/AppText';

/**
 * StatCard for Dashboard Analytics & KPI display
 * 
 * @param {string} title
 * @param {string|number} value
 * @param {string} subtitle
 * @param {string} iconText - Emoji or symbol (e.g. 📊, 📅, 🎓)
 * @param {'teacher'|'student'|'parent'|null} role
 * @param {string} accentColor
 */
export const StatCard = ({
  title,
  value,
  subtitle,
  iconText = '📌',
  role = null,
  accentColor = null,
  style,
}) => {
  const roleColor = role && COLORS.roles[role] ? COLORS.roles[role].primary : COLORS.primary;
  const roleBg = role && COLORS.roles[role] ? COLORS.roles[role].light : COLORS.primarySurface;
  const resolvedAccent = accentColor || roleColor;

  return (
    <View style={[styles.container, SHADOWS.small, style]}>
      <View style={styles.topRow}>
        <View style={[styles.iconWrapper, { backgroundColor: roleBg }]}>
          <AppText style={styles.icon}>{iconText}</AppText>
        </View>
        <AppText variant="h2" style={[styles.valueText, { color: resolvedAccent }]}>
          {value}
        </AppText>
      </View>

      <AppText variant="bodyBold" color="primary" numberOfLines={1} style={styles.titleText}>
        {title}
      </AppText>

      {subtitle ? (
        <AppText variant="caption" color="muted" numberOfLines={1} style={styles.subtitleText}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md + 2,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.7)',
    minWidth: 140,
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
  },
  valueText: {
    fontWeight: '800',
    fontSize: 22,
  },
  titleText: {
    marginTop: 2,
  },
  subtitleText: {
    marginTop: 2,
  },
});

export default StatCard;
