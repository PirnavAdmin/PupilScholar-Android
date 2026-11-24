import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ScreenWrapper,
  Header,
  AppText,
  Button,
  Badge,
  Avatar,
  GlassTaskbar,
  NoticesTabContent,
  SidebarDrawer,
  NotificationsModal,
} from '../../components';
import { ProfileScreen } from '../shared/ProfileScreen';
import { TeacherClassesTab } from './TeacherClassesTab';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { MOCK_TEACHER_DATA, MOCK_ROLE_NOTIFICATIONS } from '../../data/mockSchoolData';
import { SPACING, RADIUS } from '../../constants/spacing';

export const TeacherDashboardScreen = () => {
  const { user } = useAuth();
  const { isDark, colors } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_ROLE_NOTIFICATIONS.teacher);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleToggleNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearReadNotifications = () => {
    setNotifications((prev) => prev.filter((n) => !n.read));
  };

  const { stats, todayClasses, pendingTasks, announcements } = MOCK_TEACHER_DATA;

  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'schedule':
        return { title: 'Class Schedule', subtitle: 'Assigned Lectures & Rooms' };
      case 'notices':
        return { title: 'School Notices', subtitle: 'Circulars & Official Bulletins' };
      case 'profile':
        return { title: 'Staff Profile', subtitle: user?.email || 'Faculty Account' };
      default:
        return { title: 'Teacher Portal', subtitle: 'Academic Console' };
    }
  };

  const headerInfo = getHeaderInfo();

  const handleAction = (actionName) => {
    Alert.alert(actionName, `${actionName} module is connected.`);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Background Gradient */}
      <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        <LinearGradient
          colors={colors.gradientColors}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        {isDark && (
          <>
            <View style={styles.glowTop} />
            <View style={styles.glowBottom} />
          </>
        )}
      </View>

      <ScreenWrapper
        scrollable={activeTab !== 'profile'}
        backgroundColor="transparent"
        statusBarStyle={colors.statusBarStyle}
        contentContainerStyle={styles.scrollContent}
        header={
          <Header
            title={headerInfo.title}
            subtitle={headerInfo.subtitle}
            role="teacher"
            user={user}
            onProfilePress={() => setActiveTab('profile')}
            showBack={activeTab !== 'dashboard'}
            onBack={() => setActiveTab('dashboard')}
            showMenu={activeTab === 'dashboard'}
            onMenuPress={() => setIsSidebarOpen(true)}
            onNotificationPress={() => setIsNotificationsOpen(true)}
            unreadNotificationsCount={unreadCount}
          />
        }
      >
        {activeTab === 'profile' ? (
          <ProfileScreen onBack={() => setActiveTab('dashboard')} />
        ) : activeTab === 'schedule' ? (
          <TeacherClassesTab />
        ) : activeTab === 'notices' ? (
          <NoticesTabContent role="teacher" />
        ) : (
          <View style={styles.container}>
            {/* Welcome Glass Banner */}
            <View
              style={[
                styles.profileBanner,
                {
                  backgroundColor: colors.cardBg,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <View style={styles.profileRow}>
                <Avatar
                  source={user?.avatar}
                  name={user?.name || 'Sarah Jenkins'}
                  size="lg"
                  role="teacher"
                  showOnline
                />
                <View style={styles.profileTextCol}>
                  <View style={styles.badgeRow}>
                    <Badge label="Faculty" variant="teacher" size="sm" />
                    <AppText variant="caption" style={{ color: colors.text.muted }}>
                      {user?.employeeId || 'TCH-2024-042'}
                    </AppText>
                  </View>
                  <AppText variant="h2" style={[styles.userName, { color: colors.text.primary }]} numberOfLines={1}>
                    {user?.name || 'Mrs. Sarah Jenkins'}
                  </AppText>
                  <AppText variant="caption" style={{ color: colors.text.secondary }}>
                    {user?.designation || 'Senior Mathematics Faculty'}
                  </AppText>
                </View>
              </View>
            </View>

            {/* Key Metrics / KPI Grid */}
            <View style={styles.sectionHeader}>
              <AppText variant="h3" style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Today's Overview
              </AppText>
              <AppText variant="caption" style={{ color: colors.text.muted }}>
                Tuesday, Nov 24
              </AppText>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statsRow}>
                <View style={[styles.glassStatCard, { backgroundColor: colors.statCardBg, borderColor: colors.cardBorder }]}>
                  <View style={styles.statTop}>
                    <View style={[styles.statIconBox, { backgroundColor: 'rgba(124, 58, 237, 0.15)' }]}>
                      <AppText style={styles.statEmoji}>👥</AppText>
                    </View>
                    <AppText style={[styles.statNumber, { color: '#8B5CF6' }]} numberOfLines={1}>
                      {stats.totalStudents}
                    </AppText>
                  </View>
                  <AppText style={[styles.statLabel, { color: colors.text.primary }]} numberOfLines={1}>
                    Total Students
                  </AppText>
                  <AppText variant="caption" style={[styles.statSubtext, { color: colors.text.muted }]} numberOfLines={1}>
                    3 assigned classes
                  </AppText>
                </View>

                <View style={[styles.glassStatCard, { backgroundColor: colors.statCardBg, borderColor: colors.cardBorder }]}>
                  <View style={styles.statTop}>
                    <View style={[styles.statIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                      <AppText style={styles.statEmoji}>📅</AppText>
                    </View>
                    <AppText style={[styles.statNumber, { color: '#3B82F6' }]} numberOfLines={1}>
                      {stats.classesToday}
                    </AppText>
                  </View>
                  <AppText style={[styles.statLabel, { color: colors.text.primary }]} numberOfLines={1}>
                    Classes Today
                  </AppText>
                  <AppText variant="caption" style={[styles.statSubtext, { color: colors.text.muted }]} numberOfLines={1}>
                    2 completed, 2 upcoming
                  </AppText>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={[styles.glassStatCard, { backgroundColor: colors.statCardBg, borderColor: colors.cardBorder }]}>
                  <View style={styles.statTop}>
                    <View style={[styles.statIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                      <AppText style={styles.statEmoji}>📝</AppText>
                    </View>
                    <AppText style={[styles.statNumber, { color: '#F59E0B' }]} numberOfLines={1}>
                      {stats.pendingGrading}
                    </AppText>
                  </View>
                  <AppText style={[styles.statLabel, { color: colors.text.primary }]} numberOfLines={1}>
                    Pending Reviews
                  </AppText>
                  <AppText variant="caption" style={[styles.statSubtext, { color: colors.text.muted }]} numberOfLines={1}>
                    Homework & quizzes
                  </AppText>
                </View>

                <View style={[styles.glassStatCard, { backgroundColor: colors.statCardBg, borderColor: colors.cardBorder }]}>
                  <View style={styles.statTop}>
                    <View style={[styles.statIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                      <AppText style={styles.statEmoji}>📈</AppText>
                    </View>
                    <AppText style={[styles.statNumber, { color: '#10B981' }]} numberOfLines={1}>
                      {stats.avgAttendance}
                    </AppText>
                  </View>
                  <AppText style={[styles.statLabel, { color: colors.text.primary }]} numberOfLines={1}>
                    Attendance
                  </AppText>
                  <AppText variant="caption" style={[styles.statSubtext, { color: colors.text.muted }]} numberOfLines={1}>
                    High class average
                  </AppText>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.sectionHeader}>
              <AppText variant="h3" style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Quick Actions
              </AppText>
            </View>

            <View style={styles.quickActionsRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleAction('Mark Attendance')}
                activeOpacity={0.75}
              >
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(124, 58, 237, 0.15)', borderColor: colors.cardBorder }]}>
                  <AppText style={styles.actionEmoji}>📋</AppText>
                </View>
                <AppText variant="caption" style={[styles.actionLabel, { color: colors.text.secondary }]}>
                  Attendance
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleAction('Create Assignment')}
                activeOpacity={0.75}
              >
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: colors.cardBorder }]}>
                  <AppText style={styles.actionEmoji}>✏️</AppText>
                </View>
                <AppText variant="caption" style={[styles.actionLabel, { color: colors.text.secondary }]}>
                  Assignment
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleAction('Grade Book')}
                activeOpacity={0.75}
              >
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: colors.cardBorder }]}>
                  <AppText style={styles.actionEmoji}>📊</AppText>
                </View>
                <AppText variant="caption" style={[styles.actionLabel, { color: colors.text.secondary }]}>
                  Grade Book
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => setActiveTab('notices')}
                activeOpacity={0.75}
              >
                <View style={[styles.actionIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: colors.cardBorder }]}>
                  <AppText style={styles.actionEmoji}>📢</AppText>
                </View>
                <AppText variant="caption" style={[styles.actionLabel, { color: colors.text.secondary }]}>
                  Notices
                </AppText>
              </TouchableOpacity>
            </View>

            {/* Today's Schedule */}
            <View style={styles.sectionHeader}>
              <AppText variant="h3" style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Teaching Schedule
              </AppText>
              <TouchableOpacity onPress={() => setActiveTab('schedule')} activeOpacity={0.7}>
                <Badge label="Full Schedule →" variant="teacher" size="sm" />
              </TouchableOpacity>
            </View>

            <View style={styles.classList}>
              {todayClasses.map((item) => {
                const isCompleted = item.status === 'completed';
                const isInProgress = item.status === 'in_progress';

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.glassCard,
                      {
                        backgroundColor: colors.cardBg,
                        borderColor: colors.cardBorder,
                      },
                      isInProgress && styles.liveCardBorder,
                    ]}
                  >
                    <View style={styles.classCardHeader}>
                      <View style={styles.classInfo}>
                        <View style={styles.subjectRow}>
                          <AppText variant="bodyBold" style={{ color: colors.text.primary }}>
                            {item.subject}
                          </AppText>
                          {isInProgress && (
                            <Badge label="LIVE" variant="danger" size="sm" showDot />
                          )}
                          {isCompleted && (
                            <Badge label="Done" variant="success" size="sm" />
                          )}
                        </View>
                        <AppText variant="caption" style={{ color: colors.text.secondary, marginBottom: 2 }}>
                          {item.grade} • {item.studentCount} Students
                        </AppText>
                        <AppText variant="caption" style={{ color: colors.text.muted }}>
                          📍 {item.room}
                        </AppText>
                      </View>
                      <View style={[styles.timeBadge, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9' }]}>
                        <AppText variant="caption" style={{ color: '#2563EB', fontWeight: '700' }}>
                          {item.time}
                        </AppText>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Pending Grading Tasks */}
            <View style={styles.sectionHeader}>
              <AppText variant="h3" style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Pending Reviews
              </AppText>
            </View>

            <View style={styles.tasksList}>
              {pendingTasks.map((task) => (
                <View
                  key={task.id}
                  style={[
                    styles.glassCard,
                    { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
                  ]}
                >
                  <View style={styles.taskRow}>
                    <View style={styles.taskTextCol}>
                      <AppText variant="bodyBold" style={{ color: colors.text.primary, marginBottom: 2 }}>
                        {task.title}
                      </AppText>
                      <AppText variant="caption" style={{ color: colors.text.secondary }}>
                        {task.grade} • Submissions: {task.submissions}
                      </AppText>
                      <AppText variant="caption" style={{ color: '#EF4444', marginTop: 2 }}>
                        ⏳ Due: {task.dueDate}
                      </AppText>
                    </View>
                    <Button
                      title="Grade"
                      size="sm"
                      variant="primary"
                      role="teacher"
                      fullWidth={false}
                      onPress={() => handleAction(`Grading ${task.title}`)}
                    />
                  </View>
                </View>
              ))}
            </View>

            {/* Faculty Notices */}
            <View style={styles.sectionHeader}>
              <AppText variant="h3" style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Faculty Circulars
              </AppText>
              <TouchableOpacity onPress={() => setActiveTab('notices')} activeOpacity={0.7}>
                <AppText variant="caption" style={{ color: '#8B5CF6', fontWeight: '700' }}>
                  See All Notices →
                </AppText>
              </TouchableOpacity>
            </View>

            {announcements.map((ann) => (
              <View
                key={ann.id}
                style={[
                  styles.glassCard,
                  { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
                ]}
              >
                <View style={styles.annHeader}>
                  <AppText variant="bodyBold" style={{ color: colors.text.primary }}>
                    {ann.title}
                  </AppText>
                  <Badge label={ann.date} variant="neutral" size="sm" />
                </View>
                <AppText variant="caption" style={{ color: colors.text.secondary, marginBottom: 4 }}>
                  {ann.content}
                </AppText>
                <AppText variant="caption" style={{ color: colors.text.muted }}>
                  Issued by: {ann.author}
                </AppText>
              </View>
            ))}
          </View>
        )}
      </ScreenWrapper>

      {/* Floating iOS Glass Taskbar */}
      <GlassTaskbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        role="teacher"
      />

      {/* Interactive Sidebar Drawer */}
      <SidebarDrawer
        visible={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* Notifications Modal Sheet */}
      <NotificationsModal
        visible={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onToggleRead={handleToggleNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onClearRead={handleClearReadNotifications}
        role="teacher"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  glowTop: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: -50,
    left: -40,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  container: {
    padding: SPACING.lg,
  },
  profileBanner: {
    borderRadius: 22,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileTextCol: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  userName: {
    fontWeight: '800',
    fontSize: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontWeight: '800',
    fontSize: 17,
  },
  statsGrid: {
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  glassStatCard: {
    flex: 1,
    minHeight: 114,
    borderRadius: 18,
    borderWidth: 1,
    padding: 13,
    justifyContent: 'space-between',
  },
  statTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  statEmoji: {
    fontSize: 17,
  },
  statNumber: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '800',
    flexShrink: 1,
    textAlign: 'right',
  },
  statLabel: {
    fontWeight: '700',
    fontSize: 13,
    lineHeight: 18,
  },
  statSubtext: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  actionBtn: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    borderWidth: 1,
  },
  actionEmoji: {
    fontSize: 22,
  },
  actionLabel: {
    fontWeight: '600',
    fontSize: 11,
  },
  classList: {
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  glassCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  liveCardBorder: {
    borderColor: '#8B5CF6',
    borderWidth: 1.5,
  },
  classCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  classInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 4,
  },
  timeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  tasksList: {
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskTextCol: {
    flex: 1,
    marginRight: SPACING.md,
  },
  annHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
});

export default TeacherDashboardScreen;
