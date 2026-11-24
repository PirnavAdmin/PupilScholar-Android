import React from 'react';
import { View, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../constants/spacing';
import { AppText } from '../typography/AppText';

/**
 * Universal Loading Component
 * Supports inline, centered, fullScreen, and modal overlay modes.
 * 
 * @param {'inline'|'centered'|'fullscreen'|'overlay'} mode
 * @param {'small'|'large'} size
 * @param {string} message
 * @param {string} color
 */
export const Loading = ({
  mode = 'centered',
  size = 'large',
  message = null,
  color = COLORS.primary,
  visible = true,
}) => {
  if (!visible) return null;

  if (mode === 'overlay') {
    return (
      <Modal transparent animationType="fade" visible={visible}>
        <View style={styles.overlayBackdrop}>
          <View style={styles.overlayCard}>
            <ActivityIndicator size={size} color={color} />
            {message ? (
              <AppText variant="subtitle" color="secondary" style={styles.messageText}>
                {message}
              </AppText>
            ) : null}
          </View>
        </View>
      </Modal>
    );
  }

  if (mode === 'fullscreen') {
    return (
      <View style={styles.fullscreenContainer}>
        <ActivityIndicator size={size} color={color} />
        {message ? (
          <AppText variant="subtitle" color="secondary" style={styles.messageText}>
            {message}
          </AppText>
        ) : null}
      </View>
    );
  }

  if (mode === 'inline') {
    return (
      <View style={styles.inlineContainer}>
        <ActivityIndicator size={size} color={color} />
        {message ? (
          <AppText variant="body" color="secondary" style={styles.inlineMessage}>
            {message}
          </AppText>
        ) : null}
      </View>
    );
  }

  // Default: centered in its container
  return (
    <View style={styles.centeredContainer}>
      <ActivityIndicator size={size} color={color} />
      {message ? (
        <AppText variant="body" color="secondary" style={styles.messageText}>
          {message}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  centeredContainer: {
    padding: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
  },
  inlineMessage: {
    marginLeft: SPACING.sm,
  },
  fullscreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.xxl,
  },
  overlayBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  overlayCard: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.xxl,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 160,
  },
  messageText: {
    marginTop: SPACING.md,
    textAlign: 'center',
  },
});

export default Loading;
