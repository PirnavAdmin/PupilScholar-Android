import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, RADIUS } from '../../constants/spacing';
import { AppText } from '../typography/AppText';
import { Avatar } from '../common/Avatar';

/**
 * Neat Universal App Topbar with Glass Finish, Sidebar Menu & Notification Center
 */
export const Header = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  showMenu = true,
  onMenuPress = null,
  showNotification = true,
  onNotificationPress = null,
  unreadNotificationsCount = 3,
  role = null,
  user = null,
  onProfilePress = null,
  rightAction = null,
  style,
}) => {
  const { isDark, colors } = useTheme();

  return (
    <View
      style={[
        styles.topbarContainer,
        {
          backgroundColor: isDark ? 'rgba(9, 13, 30, 0.85)' : 'rgba(255, 255, 255, 0.88)',
          borderBottomColor: colors.header.border,
        },
        style,
      ]}
    >
      {/* Optional iOS BlurView layer */}
      {Platform.OS === 'ios' && (
        <BlurView
          intensity={isDark ? 60 : 75}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFillObject}
        />
      )}

      <View style={styles.contentRow}>
        {/* Left Section: Back Arrow OR Hamburger Menu + Titles */}
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity
              onPress={onBack}
              style={[
                styles.iconButton,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                  borderColor: colors.cardBorder,
                },
              ]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
              accessibilityLabel="Go Back"
            >
              <AppText style={[styles.backArrow, { color: colors.header.title }]}>
                ‹
              </AppText>
            </TouchableOpacity>
          ) : showMenu && onMenuPress ? (
            <TouchableOpacity
              onPress={onMenuPress}
              style={[
                styles.iconButton,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                  borderColor: colors.cardBorder,
                },
              ]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
              accessibilityLabel="Open Navigation Menu"
            >
              <View style={styles.hamburgerIconBox}>
                <View style={[styles.hamburgerLine, { backgroundColor: colors.header.title, width: 16 }]} />
                <View style={[styles.hamburgerLine, { backgroundColor: colors.header.title, width: 12 }]} />
                <View style={[styles.hamburgerLine, { backgroundColor: colors.header.title, width: 16 }]} />
              </View>
            </TouchableOpacity>
          ) : null}

          <View style={styles.titleWrapper}>
            <AppText
              variant="h3"
              style={[styles.headerTitle, { color: colors.header.title }]}
              numberOfLines={1}
            >
              {title}
            </AppText>
            {subtitle ? (
              <AppText
                variant="caption"
                style={[styles.headerSubtitle, { color: colors.header.subtitle }]}
                numberOfLines={1}
              >
                {subtitle}
              </AppText>
            ) : null}
          </View>
        </View>

        {/* Right Section: Notification Bell + Role Badge + Profile Avatar */}
        <View style={styles.rightSection}>
          {/* Notification Bell Button */}
          {showNotification && onNotificationPress ? (
            <TouchableOpacity
              onPress={onNotificationPress}
              style={[
                styles.iconButton,
                styles.notificationBtn,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                  borderColor: colors.cardBorder,
                },
              ]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
              accessibilityLabel="Open Notifications"
            >
              <AppText style={styles.bellEmoji}>🔔</AppText>
              {unreadNotificationsCount > 0 && (
                <View
                  style={[
                    styles.notificationBadge,
                    { borderColor: isDark ? '#090D1E' : '#FFFFFF' },
                  ]}
                >
                  <AppText style={styles.notificationBadgeText}>
                    {unreadNotificationsCount > 9 ? '9+' : String(unreadNotificationsCount)}
                  </AppText>
                </View>
              )}
            </TouchableOpacity>
          ) : null}

          {rightAction}

          {/* Profile Avatar Button */}
          {onProfilePress ? (
            <TouchableOpacity
              onPress={onProfilePress}
              style={[
                styles.profileButton,
                {
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.15)',
                },
              ]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.75}
              accessibilityLabel="Open Profile"
            >
              <Avatar
                source={user?.avatar}
                name={user?.name || 'User'}
                size="sm"
                role={role}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topbarContainer: {
    borderBottomWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      default: {
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    minHeight: 56,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backArrow: {
    fontSize: 26,
    lineHeight: 28,
    fontWeight: '300',
    marginTop: -2,
  },
  hamburgerIconBox: {
    width: 18,
    height: 14,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  hamburgerLine: {
    height: 2,
    borderRadius: 1,
  },
  titleWrapper: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationBtn: {
    marginRight: 0,
    position: 'relative',
  },
  bellEmoji: {
    fontSize: 15,
  },
  notificationBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#EF4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  profileButton: {
    padding: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
  },
});

export default Header;
