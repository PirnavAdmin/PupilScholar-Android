import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../constants/spacing';
import { AppText } from '../typography/AppText';

/**
 * Universal Alert Banner Component
 * 
 * @param {'info'|'warning'|'danger'|'success'} type
 * @param {string} title
 * @param {string} message
 * @param {Function} onDismiss
 */
export const AlertBanner = ({
  type = 'info',
  title = null,
  message,
  onDismiss = null,
  style,
}) => {
  const { bg, border, textColor, icon } = getAlertStyles(type);

  return (
    <View style={[styles.container, { backgroundColor: bg, borderColor: border }, style]}>
      <View style={styles.iconCol}>
        <AppText style={styles.iconText}>{icon}</AppText>
      </View>

      <View style={styles.textCol}>
        {title ? (
          <AppText variant="bodyBold" style={{ color: textColor, marginBottom: 2 }}>
            {title}
          </AppText>
        ) : null}
        <AppText variant="caption" style={{ color: textColor }}>
          {message}
        </AppText>
      </View>

      {onDismiss ? (
        <Pressable onPress={onDismiss} style={styles.closeBtn} hitSlop={10}>
          <AppText style={{ color: textColor, fontSize: 16 }}>×</AppText>
        </Pressable>
      ) : null}
    </View>
  );
};

const getAlertStyles = (type) => {
  switch (type) {
    case 'success':
      return {
        bg: COLORS.status.successBg,
        border: COLORS.status.success,
        textColor: '#065F46',
        icon: '✓',
      };
    case 'warning':
      return {
        bg: COLORS.status.warningBg,
        border: COLORS.status.warning,
        textColor: '#92400E',
        icon: '⚠️',
      };
    case 'danger':
      return {
        bg: COLORS.status.dangerBg,
        border: COLORS.status.danger,
        textColor: '#991B1B',
        icon: '⚠️',
      };
    case 'info':
    default:
      return {
        bg: COLORS.status.infoBg,
        border: COLORS.status.info,
        textColor: '#1E40AF',
        icon: 'ℹ️',
      };
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginVertical: SPACING.xs,
  },
  iconCol: {
    marginRight: SPACING.sm,
  },
  iconText: {
    fontSize: 16,
  },
  textCol: {
    flex: 1,
  },
  closeBtn: {
    paddingLeft: SPACING.sm,
  },
});

export default AlertBanner;
