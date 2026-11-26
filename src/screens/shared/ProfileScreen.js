import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { AppText } from '../../components/typography/AppText';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useTheme, THEME_MODES } from '../../context/ThemeContext';
import { getTeacherProfile } from '../../api/teacherApi';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS } from '../../constants/spacing';

/**
 * Modern Neatly Designed Profile Screen with Dynamic Faculty Info & Working System Theme
 */
export const ProfileScreen = ({ onBack = null }) => {
  const { user, role, logout } = useAuth();
  const { isDark, colors, themeMode, setThemeMode, systemScheme } = useTheme();

  const [profileDetails, setProfileDetails] = useState({
    qualification: 'M.Sc. Mathematics, B.Ed.',
    department: 'Science & Mathematics',
    joiningDate: 'Aug 15, 2021',
    bloodGroup: 'O+',
    emergencyContact: '+1 (555) 987-6543',
    assignedClasses: ['Grade 10-A', 'Grade 9-B', 'Grade 11-A'],
    assignedSubjects: ['Advanced Mathematics', 'Applied Algebra', 'Calculus'],
  });

  // Fetch dynamic profile details on mount
  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const res = await getTeacherProfile();
        if (isMounted && res?.data) {
          setProfileDetails((prev) => ({
            ...prev,
            ...res.data,
          }));
        }
      } catch {
        // Handled silently
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

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

  const roleColor = role && COLORS.roles[role] ? COLORS.roles[role].primary : '#7C3AED';

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Sleek Glass Profile Identity Card */}
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
              name={user?.name || 'Faculty Member'}
              size="xl"
              role="teacher"
              showOnline
            />
          </View>

          <AppText
            variant="h2"
            style={[styles.userName, { color: colors.text.primary }]}
          >
            {user?.name || 'Faculty Member'}
          </AppText>

          <View style={styles.badgeRow}>
            <Badge label="FACULTY" variant="teacher" size="md" />
            <AppText
              variant="caption"
              style={[styles.userIdTag, { color: colors.text.secondary }]}
            >
              ID: {user?.employeeId || 'EMP-104'}
            </AppText>
          </View>

          <AppText
            variant="body"
            style={[styles.userEmail, { color: colors.text.secondary }]}
          >
            {user?.email || 'teacher@school.com'}
          </AppText>

          <AppText
            variant="caption"
            style={{ color: colors.text.muted, marginTop: 2 }}
          >
            {user?.designation || 'Senior Mathematics Faculty'} • {user?.branch || 'Main Campus'}
          </AppText>
        </View>

        {/* Dynamic Details Grid */}
        <View
          style={[
            styles.infoGrid,
            { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' },
          ]}
        >
          <View style={styles.infoRow}>
            <AppText variant="caption" style={{ color: colors.text.muted }}>
              Department
            </AppText>
            <AppText variant="bodyBold" style={{ color: colors.text.primary }}>
              {profileDetails.department}
            </AppText>
          </View>

          <View style={styles.infoRow}>
            <AppText variant="caption" style={{ color: colors.text.muted }}>
              Qualification
            </AppText>
            <AppText variant="bodyBold" style={{ color: colors.text.primary }}>
              {profileDetails.qualification}
            </AppText>
          </View>

          <View style={styles.infoRow}>
            <AppText variant="caption" style={{ color: colors.text.muted }}>
              Blood Group
            </AppText>
            <AppText variant="bodyBold" style={{ color: colors.text.primary }}>
              {profileDetails.bloodGroup}
            </AppText>
          </View>

          <View style={styles.infoRow}>
            <AppText variant="caption" style={{ color: colors.text.muted }}>
              Emergency Contact
            </AppText>
            <AppText variant="bodyBold" style={{ color: colors.text.primary }}>
              {profileDetails.emergencyContact}
            </AppText>
          </View>
        </View>

        {/* Assigned Classes Chips */}
        <View style={styles.assignedSection}>
          <AppText variant="caption" style={[styles.assignedHeader, { color: colors.text.muted }]}>
            ASSIGNED CLASSES & SECTIONS:
          </AppText>
          <View style={styles.chipsRow}>
            {profileDetails.assignedClasses.map((cls, idx) => (
              <View
                key={idx}
                style={[
                  styles.chip,
                  { backgroundColor: isDark ? 'rgba(124, 58, 237, 0.15)' : '#F5F3FF', borderColor: '#7C3AED' },
                ]}
              >
                <AppText variant="caption" style={{ color: '#7C3AED', fontWeight: '700' }}>
                  {cls}
                </AppText>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* 2. Appearance & Working Theme Mode Selector */}
      <View style={styles.sectionTitleRow}>
        <AppText variant="bodyBold" style={{ color: colors.text.muted, fontSize: 11, letterSpacing: 0.8 }}>
          APPEARANCE & DISPLAY THEME
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
        {/* Dark Mode Option */}
        <TouchableOpacity
          onPress={() => setThemeMode(THEME_MODES.DARK)}
          activeOpacity={0.7}
          style={[
            styles.themeOption,
            themeMode === THEME_MODES.DARK && [
              styles.themeOptionActive,
              { backgroundColor: isDark ? 'rgba(124, 58, 237, 0.2)' : '#F5F3FF', borderColor: '#7C3AED' },
            ],
          ]}
        >
          <AppText style={styles.themeOptionIcon}>🌙</AppText>
          <AppText
            variant="caption"
            style={[
              styles.themeOptionLabel,
              { color: themeMode === THEME_MODES.DARK ? '#7C3AED' : colors.text.secondary },
            ]}
          >
            Dark Mode
          </AppText>
          {themeMode === THEME_MODES.DARK && (
            <View style={styles.activeCheckPill}>
              <AppText style={styles.checkText}>✓</AppText>
            </View>
          )}
        </TouchableOpacity>

        {/* Light Mode Option */}
        <TouchableOpacity
          onPress={() => setThemeMode(THEME_MODES.LIGHT)}
          activeOpacity={0.7}
          style={[
            styles.themeOption,
            themeMode === THEME_MODES.LIGHT && [
              styles.themeOptionActive,
              { backgroundColor: isDark ? 'rgba(124, 58, 237, 0.2)' : '#F5F3FF', borderColor: '#7C3AED' },
            ],
          ]}
        >
          <AppText style={styles.themeOptionIcon}>☀️</AppText>
          <AppText
            variant="caption"
            style={[
              styles.themeOptionLabel,
              { color: themeMode === THEME_MODES.LIGHT ? '#7C3AED' : colors.text.secondary },
            ]}
          >
            Light Mode
          </AppText>
          {themeMode === THEME_MODES.LIGHT && (
            <View style={styles.activeCheckPill}>
              <AppText style={styles.checkText}>✓</AppText>
            </View>
          )}
        </TouchableOpacity>

        {/* System Option with Live Hardware State */}
        <TouchableOpacity
          onPress={() => setThemeMode(THEME_MODES.SYSTEM)}
          activeOpacity={0.7}
          style={[
            styles.themeOption,
            themeMode === THEME_MODES.SYSTEM && [
              styles.themeOptionActive,
              { backgroundColor: isDark ? 'rgba(124, 58, 237, 0.2)' : '#F5F3FF', borderColor: '#7C3AED' },
            ],
          ]}
        >
          <AppText style={styles.themeOptionIcon}>📱</AppText>
          <AppText
            variant="caption"
            style={[
              styles.themeOptionLabel,
              { color: themeMode === THEME_MODES.SYSTEM ? '#7C3AED' : colors.text.secondary },
            ]}
          >
            System
          </AppText>
          {themeMode === THEME_MODES.SYSTEM && (
            <View style={styles.activeCheckPill}>
              <AppText style={styles.checkText}>✓</AppText>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* 3. Security, Session & SIS Information */}
      <View style={styles.sectionTitleRow}>
        <AppText variant="bodyBold" style={{ color: colors.text.muted, fontSize: 11, letterSpacing: 0.8 }}>
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
          <AppText style={styles.optionIcon}>⏳</AppText>
          <View style={styles.optionTextCol}>
            <AppText variant="bodyBold" style={{ color: colors.text.primary }}>
              Session Validity
            </AppText>
            <AppText variant="caption" style={{ color: colors.text.secondary }}>
              24-hour automatic expiration & secure logout
            </AppText>
          </View>
          <Badge label="24h Active" variant="success" size="sm" />
        </View>

        <View
          style={[
            styles.divider,
            { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' },
          ]}
        />

        <View style={styles.optionItem}>
          <AppText style={styles.optionIcon}>🛡️</AppText>
          <View style={styles.optionTextCol}>
            <AppText variant="bodyBold" style={{ color: colors.text.primary }}>
              Institutional SSL
            </AppText>
            <AppText variant="caption" style={{ color: colors.text.secondary }}>
              Encrypted backend tunnel connection
            </AppText>
          </View>
          <Badge label="Active" variant="info" size="sm" />
        </View>
      </View>

      {/* 4. Logout Action Button */}
      <View style={styles.logoutWrapper}>
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.8}
          style={styles.logoutButton}
        >
          <AppText style={styles.logoutBtnIcon}>🚪</AppText>
          <AppText variant="bodyBold" style={styles.logoutBtnText}>
            Sign Out of PupilScholar
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
    paddingBottom: 130,
  },
  glassProfileCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
      default: {
        boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
      },
    }),
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarGlow: {
    padding: 3,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    marginBottom: SPACING.sm,
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
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  assignedSection: {
    width: '100%',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.15)',
  },
  assignedHeader: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    minHeight: 64,
  },
  themeOptionActive: {},
  themeOptionIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  themeOptionLabel: {
    fontWeight: '700',
    fontSize: 11,
  },
  activeCheckPill: {
    marginTop: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
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
