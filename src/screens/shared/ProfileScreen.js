import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { AppText } from '../../components/typography/AppText';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useTheme, THEME_MODES } from '../../context/ThemeContext';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../constants/spacing';

/**
 * Modern Profile Screen with Dark/Light Theme Switcher & Logout
 */
export const ProfileScreen = ({ onBack = null }) => {
  const { user, role, logout } = useAuth();
  const { isDark, colors, themeMode, setThemeMode } = useTheme();

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of PupilScholar?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const roleColor = role && COLORS.roles[role] ? COLORS.roles[role].primary : '#2563EB';

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* User Identity Card */}
      <View
        style={[
          styles.glassProfileCard,
          {
            backgroundColor: colors.cardBg,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <View style={styles.avatarSection}>
          <View style={[styles.avatarGlow, { borderColor: roleColor }]}>
            <Avatar
              source={user?.avatar}
              name={user?.name || 'User'}
              size="xl"
              role={role}
              showOnline
            />
          </View>
          <AppText
            variant="h2"
            style={[styles.userName, { color: colors.text.primary }]}
          >
            {user?.name || 'User Profile'}
          </AppText>
          <View style={styles.badgeRow}>
            <Badge label={(role || 'Member').toUpperCase()} variant={role || 'neutral'} size="md" />
            <AppText
              variant="caption"
              style={[styles.userIdTag, { color: colors.text.secondary }]}
            >
              {user?.employeeId || user?.studentId || 'ID: PS-2024'}
            </AppText>
          </View>
          <AppText
            variant="body"
            style={[styles.userEmail, { color: colors.text.secondary }]}
          >
            {user?.email || 'user@school.com'}
          </AppText>
        </View>

        {/* Details Grid */}
        <View
          style={[
            styles.infoGrid,
            { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' },
          ]}
        >
          {user?.designation && (
            <View style={styles.infoRow}>
              <AppText variant="caption" style={{ color: colors.text.muted }}>
                Designation
              </AppText>
              <AppText variant="bodyBold" style={{ color: colors.text.primary }}>
                {user.designation}
              </AppText>
            </View>
          )}

          {user?.grade && (
            <View style={styles.infoRow}>
              <AppText variant="caption" style={{ color: colors.text.muted }}>
                Grade & Section
              </AppText>
              <AppText variant="bodyBold" style={{ color: colors.text.primary }}>
                {user.grade}
              </AppText>
            </View>
          )}

          {user?.department && (
            <View style={styles.infoRow}>
              <AppText variant="caption" style={{ color: colors.text.muted }}>
                Department
              </AppText>
              <AppText variant="bodyBold" style={{ color: colors.text.primary }}>
                {user.department}
              </AppText>
            </View>
          )}

          {user?.phone && (
            <View style={styles.infoRow}>
              <AppText variant="caption" style={{ color: colors.text.muted }}>
                Contact Phone
              </AppText>
              <AppText variant="bodyBold" style={{ color: colors.text.primary }}>
                {user.phone}
              </AppText>
            </View>
          )}

          {user?.children && (
            <View style={styles.infoRow}>
              <AppText variant="caption" style={{ color: colors.text.muted }}>
                Enrolled Children
              </AppText>
              <AppText variant="bodyBold" style={{ color: colors.text.primary }}>
                {user.children.map((c) => c.name).join(', ')}
              </AppText>
            </View>
          )}
        </View>
      </View>

      {/* Theme Appearance Mode Picker */}
      <View style={styles.sectionTitleRow}>
        <AppText variant="bodyBold" style={{ color: colors.text.muted, fontSize: 11 }}>
          APPEARANCE & THEME
        </AppText>
      </View>

      <View
        style={[
          styles.themeModeContainer,
          {
            backgroundColor: colors.cardBg,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => setThemeMode(THEME_MODES.DARK)}
          style={[
            styles.themeOption,
            themeMode === THEME_MODES.DARK && [
              styles.themeOptionActive,
              { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF', borderColor: '#3B82F6' },
            ],
          ]}
        >
          <AppText style={styles.themeOptionIcon}>🌙</AppText>
          <AppText
            variant="caption"
            style={[
              styles.themeOptionLabel,
              { color: themeMode === THEME_MODES.DARK ? '#3B82F6' : colors.text.secondary },
            ]}
          >
            Dark Mode
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setThemeMode(THEME_MODES.LIGHT)}
          style={[
            styles.themeOption,
            themeMode === THEME_MODES.LIGHT && [
              styles.themeOptionActive,
              { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF', borderColor: '#3B82F6' },
            ],
          ]}
        >
          <AppText style={styles.themeOptionIcon}>☀️</AppText>
          <AppText
            variant="caption"
            style={[
              styles.themeOptionLabel,
              { color: themeMode === THEME_MODES.LIGHT ? '#3B82F6' : colors.text.secondary },
            ]}
          >
            Light Mode
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setThemeMode(THEME_MODES.SYSTEM)}
          style={[
            styles.themeOption,
            themeMode === THEME_MODES.SYSTEM && [
              styles.themeOptionActive,
              { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF', borderColor: '#3B82F6' },
            ],
          ]}
        >
          <AppText style={styles.themeOptionIcon}>📱</AppText>
          <AppText
            variant="caption"
            style={[
              styles.themeOptionLabel,
              { color: themeMode === THEME_MODES.SYSTEM ? '#3B82F6' : colors.text.secondary },
            ]}
          >
            System
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Security & Sessions */}
      <View style={styles.sectionTitleRow}>
        <AppText variant="bodyBold" style={{ color: colors.text.muted, fontSize: 11 }}>
          SECURITY & SESSION
        </AppText>
      </View>

      <View
        style={[
          styles.optionsCard,
          {
            backgroundColor: colors.cardBg,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        <View style={styles.optionItem}>
          <AppText style={styles.optionIcon}>🛡️</AppText>
          <View style={styles.optionTextCol}>
            <AppText variant="bodyBold" style={{ color: colors.text.primary }}>
              Enterprise Encryption
            </AppText>
            <AppText variant="caption" style={{ color: colors.text.secondary }}>
              Protected with 256-bit institutional SSL
            </AppText>
          </View>
          <Badge label="Active" variant="success" size="sm" />
        </View>

        <View
          style={[
            styles.divider,
            { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' },
          ]}
        />

        <View style={styles.optionItem}>
          <AppText style={styles.optionIcon}>🔔</AppText>
          <View style={styles.optionTextCol}>
            <AppText variant="bodyBold" style={{ color: colors.text.primary }}>
              Push Notifications
            </AppText>
            <AppText variant="caption" style={{ color: colors.text.secondary }}>
              Urgent school notices & updates
            </AppText>
          </View>
          <Badge label="Enabled" variant="info" size="sm" />
        </View>
      </View>

      {/* Logout Action Button */}
      <View style={styles.logoutWrapper}>
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.8}
          style={styles.logoutButton}
        >
          <AppText style={styles.logoutBtnIcon}>🚪</AppText>
          <AppText variant="bodyBold" style={styles.logoutBtnText}>
            Log Out of PupilScholar
          </AppText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    padding: SPACING.lg,
    paddingBottom: 120,
  },
  glassProfileCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatarGlow: {
    padding: 3,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    marginBottom: SPACING.md,
  },
  userName: {
    fontWeight: '800',
    fontSize: 22,
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  userIdTag: {
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 14,
  },
  infoGrid: {
    width: '100%',
    borderTopWidth: 1,
    paddingTop: SPACING.md,
    gap: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  sectionTitleRow: {
    marginBottom: SPACING.sm,
    paddingHorizontal: 4,
  },
  themeModeContainer: {
    flexDirection: 'row',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: 6,
    marginBottom: SPACING.xl,
    gap: 6,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  themeOptionActive: {},
  themeOptionIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  themeOptionLabel: {
    fontWeight: '700',
    fontSize: 12,
  },
  optionsCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  optionIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
  },
  optionTextCol: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: SPACING.sm,
  },
  logoutWrapper: {
    width: '100%',
    marginTop: SPACING.sm,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1.2,
    borderColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 14,
  },
  logoutBtnIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  logoutBtnText: {
    color: '#EF4444',
    fontWeight: '800',
    fontSize: 15,
  },
});

export default ProfileScreen;
