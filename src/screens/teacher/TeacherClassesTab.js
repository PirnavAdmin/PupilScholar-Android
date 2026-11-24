import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { AppText } from '../../components/typography/AppText';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useTheme } from '../../context/ThemeContext';
import { MOCK_TEACHER_DATA } from '../../data/mockSchoolData';
import { SPACING, RADIUS } from '../../constants/spacing';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export const TeacherClassesTab = () => {
  const { isDark, colors } = useTheme();
  const [selectedDay, setSelectedDay] = useState('Tue');
  const [markedAttendance, setMarkedAttendance] = useState({
    tc_1: true,
    tc_2: true,
  });

  const daySchedule = MOCK_TEACHER_DATA.weeklySchedule[selectedDay] || [];

  const handleToggleAttendance = (classId, subject) => {
    const nextState = !markedAttendance[classId];
    setMarkedAttendance((prev) => ({ ...prev, [classId]: nextState }));
    Alert.alert(
      nextState ? 'Attendance Recorded' : 'Attendance Reset',
      nextState
        ? `Roll call for "${subject}" has been marked present and synced to SIS.`
        : `Attendance sheet for "${subject}" has been reopened for editing.`
    );
  };

  const handleViewRoster = (subject, grade, count) => {
    Alert.alert(
      `${subject} (${grade})`,
      `Enrolled Students: ${count}\n\nTop Roll Call:\n1. Alex Rivera (Present)\n2. Brian Gomez (Present)\n3. Chloe Zhang (Absent - Excused)\n4. Daniel Evans (Present)\n5. Emily Watson (Present)\n... and ${count - 5} more.`
    );
  };

  const handleLessonPlan = (subject) => {
    Alert.alert(
      `Lesson Plan: ${subject}`,
      `Topic: Weekly Module & Laboratory Practice\n\nObjective: Master core problem-solving frameworks through step-by-step group demonstrations and independent lab exercises.`
    );
  };

  return (
    <View style={styles.container}>
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

      {/* Day Overview Banner */}
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
              {selectedDay === 'Tue' ? 'Tuesday (Today)' : `${selectedDay} Schedule`}
            </AppText>
            <AppText variant="caption" style={{ color: colors.text.secondary }}>
              {daySchedule.length} Assigned Periods • Science Wing & Main Block
            </AppText>
          </View>
          <View style={styles.facultyTag}>
            <AppText style={styles.facultyTagText}>FACULTY</AppText>
          </View>
        </View>
      </View>

      {/* Schedule List */}
      <View style={styles.sectionHeader}>
        <AppText variant="h3" style={{ color: colors.text.primary, fontWeight: '700' }}>
          Assigned Lectures & Labs
        </AppText>
      </View>

      {daySchedule.map((item, index) => {
        const isAttended = markedAttendance[item.id] || (selectedDay === 'Tue' && index === 0);

        return (
          <View
            key={item.id}
            style={[
              styles.classCard,
              {
                backgroundColor: colors.cardBg,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            {/* Card Top: Subject & Grade Badge */}
            <View style={styles.classTopRow}>
              <View style={styles.subjectCol}>
                <AppText
                  variant="bodyBold"
                  style={[styles.subjectName, { color: colors.text.primary }]}
                >
                  {item.subject}
                </AppText>
                <AppText variant="caption" style={{ color: colors.text.muted, marginTop: 2 }}>
                  Period {index + 1} • {item.grade}
                </AppText>
              </View>
              <Badge
                label={item.grade}
                variant="teacher"
                size="sm"
              />
            </View>

            {/* Middle Row: Time & Room */}
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
                  {item.students || 30} Students
                </AppText>
              </View>
            </View>

            {/* Actions: Attendance, Roster, Lesson Plan */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={() => handleToggleAttendance(item.id, item.subject)}
                activeOpacity={0.75}
                style={[
                  styles.attendanceBtn,
                  {
                    backgroundColor: isAttended
                      ? 'rgba(16, 185, 129, 0.15)'
                      : '#7C3AED',
                    borderColor: isAttended ? '#10B981' : '#7C3AED',
                  },
                ]}
              >
                <AppText
                  style={[
                    styles.attendanceBtnText,
                    { color: isAttended ? '#10B981' : '#FFFFFF' },
                  ]}
                >
                  {isAttended ? '✓ Attended' : 'Roll Call'}
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleViewRoster(item.subject, item.grade, item.students || 30)}
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
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
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
  sectionHeader: {
    marginBottom: SPACING.md,
  },
  classCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.md,
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
    flex: 1.4,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendanceBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TeacherClassesTab;
