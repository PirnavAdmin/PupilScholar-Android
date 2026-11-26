import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { AppText } from '../../components/typography/AppText';
import { Badge } from '../../components/common/Badge';
import { StudentAttendanceModal } from '../../components/teacher/StudentAttendanceModal';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getTeacherTimetable, getTeacherSubstitutions } from '../../api/teacherApi';
import { SPACING, RADIUS } from '../../constants/spacing';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const DAY_MAP = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
};

export const TeacherClassesTab = ({ onOpenRollCall = null }) => {
  const { user } = useAuth();
  const { isDark, colors } = useTheme();

  const [selectedDay, setSelectedDay] = useState('Mon');
  const [viewMode, setViewMode] = useState('daily'); // 'daily' | 'weekly'
  const [timetable, setTimetable] = useState([]);
  const [substitutions, setSubstitutions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState('');

  // Student Attendance Modal State
  const [isRollCallModalOpen, setIsRollCallModalOpen] = useState(false);
  const [targetClass, setTargetClass] = useState('');
  const [targetSubject, setTargetSubject] = useState('');

  // Fetch timetable dynamically on-demand
  const loadDynamicTimetable = useCallback(async () => {
    setIsLoading(true);
    setApiErrorMessage('');
    try {
      const [timeRes, subRes] = await Promise.all([
        getTeacherTimetable(user?.staffId || user?.userId || user?.id || 5, '', user),
        getTeacherSubstitutions(user?.staffId || user?.userId || user?.id, user?.name),
      ]);

      if (timeRes?.success && Array.isArray(timeRes.data) && timeRes.data.length > 0) {
        setTimetable(timeRes.data);
      } else {
        setTimetable(timeRes?.data || []);
        if (!timeRes?.data || timeRes.data.length === 0) {
          setApiErrorMessage(timeRes?.error || 'No timetable records found from SIS for this academic year.');
        }
      }

      if (subRes?.data) {
        setSubstitutions(subRes.data);
      }
    } catch {
      setApiErrorMessage('Unable to connect to timetable server. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.staffId]);

  useEffect(() => {
    loadDynamicTimetable();
  }, [loadDynamicTimetable]);

  // Daily Filtered Timetable
  const daySchedule = useMemo(() => {
    const fullDayName = DAY_MAP[selectedDay] || 'Monday';
    const filtered = timetable.filter((item) => {
      const d = (item.dayOfWeek || item.day || '').toLowerCase();
      return d.startsWith(selectedDay.toLowerCase()) || d.startsWith(fullDayName.toLowerCase());
    });

    if (filtered.length > 0) return filtered;
    // If backend returns items without day tag, distribute them across days
    return timetable.filter((_, idx) => idx % 5 === DAYS.indexOf(selectedDay));
  }, [timetable, selectedDay]);

  // Weekly Grouped Timetable
  const weeklySchedule = useMemo(() => {
    const map = {};
    DAYS.forEach((d) => {
      map[d] = [];
    });

    timetable.forEach((item, idx) => {
      const dStr = (item.dayOfWeek || item.day || '').toLowerCase();
      let matchedDay = DAYS.find(
        (d) => dStr.startsWith(d.toLowerCase()) || dStr.startsWith(DAY_MAP[d].toLowerCase())
      );
      if (!matchedDay) {
        matchedDay = DAYS[idx % 5];
      }
      map[matchedDay].push(item);
    });

    return map;
  }, [timetable]);

  const handleOpenRollCall = (className, subject) => {
    if (onOpenRollCall) {
      onOpenRollCall(className, subject);
    } else {
      setTargetClass(className || 'Grade 10-A');
      setTargetSubject(subject || 'Mathematics');
      setIsRollCallModalOpen(true);
    }
  };

  const handleLessonPlan = (subject) => {
    Alert.alert(
      `Lesson Plan: ${subject}`,
      `Module Curriculum & Laboratory Demonstration\n\nObjective: Master core problem-solving frameworks and laboratory exercises.`
    );
  };

  return (
    <View style={styles.container}>
      {/* Top View Toggle: Daily vs Weekly */}
      <View style={styles.viewToggleRow}>
        <View style={styles.viewToggleGroup}>
          <TouchableOpacity
            onPress={() => setViewMode('daily')}
            style={[
              styles.viewToggleBtn,
              viewMode === 'daily' && [styles.viewToggleBtnActive, { backgroundColor: '#7C3AED' }],
            ]}
          >
            <AppText
              variant="caption"
              style={{
                color: viewMode === 'daily' ? '#FFFFFF' : colors.text.secondary,
                fontWeight: viewMode === 'daily' ? '800' : '600',
              }}
            >
              📅 Daily Schedule
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setViewMode('weekly')}
            style={[
              styles.viewToggleBtn,
              viewMode === 'weekly' && [styles.viewToggleBtnActive, { backgroundColor: '#7C3AED' }],
            ]}
          >
            <AppText
              variant="caption"
              style={{
                color: viewMode === 'weekly' ? '#FFFFFF' : colors.text.secondary,
                fontWeight: viewMode === 'weekly' ? '800' : '600',
              }}
            >
              🗓️ Weekly Overview
            </AppText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={loadDynamicTimetable} style={styles.refreshIconBtn}>
          <AppText style={{ fontSize: 16 }}>🔄</AppText>
        </TouchableOpacity>
      </View>

      {/* Substitutions Alert Banner (if any) */}
      {substitutions.length > 0 && (
        <View
          style={[
            styles.substitutionBanner,
            {
              backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
              borderColor: '#F59E0B',
            },
          ]}
        >
          <AppText style={styles.subEmoji}>⚠️</AppText>
          <View style={styles.subTextCol}>
            <AppText variant="caption" style={{ color: '#D97706', fontWeight: '800' }}>
              Substitution Assigned Today
            </AppText>
            <AppText variant="caption" style={{ color: isDark ? '#FDE68A' : '#92400E' }}>
              Period 4 • Covering for Absent Faculty
            </AppText>
          </View>
        </View>
      )}

      {/* View Mode: Daily Schedule */}
      {viewMode === 'daily' ? (
        <>
          {/* Day Selector Pills */}
          <View style={styles.daySelectorRow}>
            {DAYS.map((day) => {
              const isSelected = selectedDay === day;
              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => setSelectedDay(day)}
                  activeOpacity={0.75}
                  style={[
                    styles.dayPill,
                    {
                      backgroundColor: isSelected
                        ? '#7C3AED'
                        : isDark
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.05)',
                      borderColor: isSelected ? '#7C3AED' : colors.cardBorder,
                    },
                  ]}
                >
                  <AppText
                    variant="caption"
                    style={[
                      styles.dayText,
                      {
                        color: isSelected ? '#FFFFFF' : colors.text.secondary,
                        fontWeight: isSelected ? '800' : '600',
                      },
                    ]}
                  >
                    {day}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Day Summary Banner */}
          <View
            style={[
              styles.daySummaryBanner,
              {
                backgroundColor: colors.cardBg,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View style={styles.summaryTop}>
              <View>
                <AppText variant="h3" style={[styles.daySummaryTitle, { color: colors.text.primary }]}>
                  {DAY_MAP[selectedDay]} Dynamic Timetable
                </AppText>
                <AppText variant="caption" style={{ color: colors.text.secondary }}>
                  {daySchedule.length} Assigned Periods • Academic Year 2026-2027
                </AppText>
              </View>
              <View style={styles.facultyTag}>
                <AppText style={styles.facultyTagText}>FACULTY</AppText>
              </View>
            </View>
          </View>

          {/* Periods List */}
          {isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#7C3AED" />
              <AppText variant="caption" style={{ color: colors.text.muted, marginTop: 6 }}>
                Loading dynamic timetable from SIS...
              </AppText>
            </View>
          ) : timetable.length === 0 ? (
            <View
              style={[
                styles.emptyTimetableCard,
                { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
              ]}
            >
              <View
                style={[
                  styles.emptyTimetableIconBox,
                  {
                    backgroundColor: isDark ? 'rgba(124, 58, 237, 0.15)' : '#F5F3FF',
                    borderColor: isDark ? 'rgba(124, 58, 237, 0.3)' : '#DDD6FE',
                  },
                ]}
              >
                <AppText style={{ fontSize: 30 }}>🗓️</AppText>
              </View>
              <AppText variant="h3" style={{ color: colors.text.primary, marginBottom: 6, fontWeight: '800' }}>
                No Timetable Available
              </AppText>
              <AppText variant="body" style={{ color: colors.text.secondary, textAlign: 'center', marginBottom: 18, paddingHorizontal: 16 }}>
                {apiErrorMessage || 'No timetable records found from SIS for this academic year.'}
              </AppText>
              <TouchableOpacity
                onPress={loadDynamicTimetable}
                style={styles.retryTimetableBtn}
                activeOpacity={0.8}
              >
                <AppText style={styles.retryTimetableBtnText}>🔄 Sync Dynamic Timetable</AppText>
              </TouchableOpacity>
            </View>
          ) : daySchedule.length === 0 ? (
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
              ]}
            >
              <AppText style={styles.emptyEmoji}>☕</AppText>
              <AppText variant="bodyBold" style={{ color: colors.text.primary, marginBottom: 4 }}>
                No Lectures Scheduled
              </AppText>
              <AppText variant="caption" style={{ color: colors.text.secondary, textAlign: 'center' }}>
                You have no teaching periods assigned for {DAY_MAP[selectedDay]}. Enjoy your free period or preparation time.
              </AppText>
            </View>
          ) : (
            daySchedule.map((item, index) => {
              const isLive = item.status === 'in_progress';
              const isDone = item.status === 'completed';

              return (
                <View
                  key={item.id}
                  style={[
                    styles.classCard,
                    {
                      backgroundColor: colors.cardBg,
                      borderColor: colors.cardBorder,
                    },
                    isLive && styles.liveCardBorder,
                  ]}
                >
                  <View style={styles.classTopRow}>
                    <View style={styles.subjectCol}>
                      <View style={styles.subjectRow}>
                        <AppText
                          variant="bodyBold"
                          style={[styles.subjectName, { color: colors.text.primary }]}
                        >
                          {item.subject}
                        </AppText>
                        {isLive && <Badge label="LIVE" variant="danger" size="sm" showDot />}
                        {isDone && <Badge label="Done" variant="success" size="sm" />}
                      </View>
                      <AppText variant="caption" style={{ color: colors.text.muted, marginTop: 2 }}>
                        Period {item.periodNumber || index + 1} • {item.grade}
                      </AppText>
                    </View>

                    <Badge label={item.grade} variant="teacher" size="sm" />
                  </View>

                  <View
                    style={[
                      styles.metaContainer,
                      {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
                      },
                    ]}
                  >
                    <View style={styles.metaItem}>
                      <AppText style={styles.metaEmoji}>⏰</AppText>
                      <AppText variant="caption" style={[styles.metaText, { color: colors.text.secondary }]}>
                        {item.time}
                      </AppText>
                    </View>

                    <View style={styles.metaItem}>
                      <AppText style={styles.metaEmoji}>📍</AppText>
                      <AppText variant="caption" style={[styles.metaText, { color: colors.text.secondary }]}>
                        {item.room}
                      </AppText>
                    </View>

                    <View style={styles.metaItem}>
                      <AppText style={styles.metaEmoji}>👥</AppText>
                      <AppText variant="caption" style={[styles.metaText, { color: colors.text.secondary }]}>
                        {item.students || 32} Students
                      </AppText>
                    </View>
                  </View>

                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      onPress={() => handleOpenRollCall(item.grade, item.subject)}
                      activeOpacity={0.75}
                      style={styles.attendanceBtn}
                    >
                      <AppText style={styles.attendanceBtnText}>📋 Mark Attendance</AppText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleOpenRollCall(item.grade, item.subject)}
                      activeOpacity={0.75}
                      style={[
                        styles.secondaryBtn,
                        {
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                          borderColor: colors.cardBorder,
                        },
                      ]}
                    >
                      <AppText variant="caption" style={{ color: colors.text.primary, fontWeight: '600' }}>
                        Roster
                      </AppText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleLessonPlan(item.subject)}
                      activeOpacity={0.75}
                      style={[
                        styles.secondaryBtn,
                        {
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                          borderColor: colors.cardBorder,
                        },
                      ]}
                    >
                      <AppText variant="caption" style={{ color: colors.text.primary, fontWeight: '600' }}>
                        Plan
                      </AppText>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </>
      ) : (
        /* View Mode: Weekly Matrix */
        <ScrollView showsVerticalScrollIndicator={false}>
          {timetable.length === 0 ? (
            <View
              style={[
                styles.emptyTimetableCard,
                { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
              ]}
            >
              <View
                style={[
                  styles.emptyTimetableIconBox,
                  {
                    backgroundColor: isDark ? 'rgba(124, 58, 237, 0.15)' : '#F5F3FF',
                    borderColor: isDark ? 'rgba(124, 58, 237, 0.3)' : '#DDD6FE',
                  },
                ]}
              >
                <AppText style={{ fontSize: 30 }}>🗓️</AppText>
              </View>
              <AppText variant="h3" style={{ color: colors.text.primary, marginBottom: 6, fontWeight: '800' }}>
                No Timetable Available
              </AppText>
              <AppText variant="body" style={{ color: colors.text.secondary, textAlign: 'center', marginBottom: 18, paddingHorizontal: 16 }}>
                {apiErrorMessage || 'No timetable records found from SIS for this academic year.'}
              </AppText>
              <TouchableOpacity
                onPress={loadDynamicTimetable}
                style={styles.retryTimetableBtn}
                activeOpacity={0.8}
              >
                <AppText style={styles.retryTimetableBtnText}>🔄 Sync Dynamic Timetable</AppText>
              </TouchableOpacity>
            </View>
          ) : (
            DAYS.map((day) => {
              const periods = weeklySchedule[day] || [];
              return (
                <View
                  key={day}
                  style={[
                    styles.weeklyDaySection,
                    { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
                  ]}
                >
                  <View style={styles.weeklyDayHeader}>
                    <AppText variant="bodyBold" style={{ color: colors.text.primary }}>
                      {DAY_MAP[day]}
                    </AppText>
                    <Badge label={`${periods.length} Periods`} variant="neutral" size="sm" />
                  </View>

                  {periods.length === 0 ? (
                    <AppText variant="caption" style={{ color: colors.text.muted, fontStyle: 'italic' }}>
                      No lectures assigned
                    </AppText>
                  ) : (
                    periods.map((p, idx) => (
                      <TouchableOpacity
                        key={p.id || idx}
                        onPress={() => handleOpenRollCall(p.grade, p.subject)}
                        activeOpacity={0.75}
                        style={[
                          styles.weeklyPeriodRow,
                          { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)' },
                        ]}
                      >
                        <View style={styles.weeklyPeriodTime}>
                          <AppText variant="caption" style={{ color: '#7C3AED', fontWeight: '700' }}>
                            P{p.periodNumber || idx + 1}
                          </AppText>
                          <AppText variant="caption" style={{ color: colors.text.muted, fontSize: 10 }}>
                            {p.startTime || '08:30'}
                          </AppText>
                        </View>

                        <View style={styles.weeklyPeriodDetails}>
                          <AppText variant="bodyBold" style={{ color: colors.text.primary, fontSize: 13 }}>
                            {p.subject}
                          </AppText>
                          <AppText variant="caption" style={{ color: colors.text.secondary }}>
                            {p.grade} • {p.room}
                          </AppText>
                        </View>

                        <AppText style={{ fontSize: 12, color: colors.text.muted }}>📋</AppText>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Embedded Student Attendance Modal */}
      <StudentAttendanceModal
        visible={isRollCallModalOpen}
        onClose={() => setIsRollCallModalOpen(false)}
        initialClass={targetClass}
        initialSubject={targetSubject}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
  },
  viewToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  viewToggleGroup: {
    flexDirection: 'row',
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderRadius: RADIUS.full,
    padding: 3,
  },
  viewToggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
  },
  viewToggleBtnActive: {},
  refreshIconBtn: {
    padding: 8,
  },
  substitutionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  subEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  subTextCol: {
    flex: 1,
  },
  daySelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  dayPill: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 13,
  },
  daySummaryBanner: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  daySummaryTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  facultyTag: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  facultyTagText: {
    color: '#8B5CF6',
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  loadingBox: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  classCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  liveCardBorder: {
    borderColor: '#8B5CF6',
    borderWidth: 1.5,
  },
  classTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  subjectCol: {
    flex: 1,
    marginRight: 8,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subjectName: {
    fontSize: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaEmoji: {
    fontSize: 13,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attendanceBtn: {
    flex: 1.5,
    backgroundColor: '#7C3AED',
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendanceBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyDaySection: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  weeklyDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  weeklyPeriodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  weeklyPeriodTime: {
    width: 50,
  },
  weeklyPeriodDetails: {
    flex: 1,
    marginLeft: 8,
  },
  emptyTimetableCard: {
    padding: 28,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  emptyTimetableIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  retryTimetableBtn: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    elevation: 2,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  retryTimetableBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});

export default TeacherClassesTab;
