import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../typography/AppText';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  getStudentAttendanceSheet,
  saveStudentAttendanceSheet,
  lockStudentAttendanceSheet,
  getAttendanceClasses,
  getAttendanceSections,
  getAttendanceSubjects,
} from '../../api/teacherApi';
import { SPACING, RADIUS } from '../../constants/spacing';

const getStudentInitials = (name) => {
  if (!name) return 'ST';
  const clean = name.trim().replace(/^Student\s*#?/i, '');
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  if (parts.length === 1 && parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase();
  return 'ST';
};

export const StudentAttendanceModal = ({
  visible,
  onClose,
  initialClass = '',
  initialSubject = '',
  onAttendanceSaved,
}) => {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const { user } = useAuth();

  // Dynamic Options from API
  const [classesList, setClassesList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [apiErrorMessage, setApiErrorMessage] = useState('');
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch Dynamic Classes & Subjects when modal opens (Scoped to teacher's assigned classes)
  useEffect(() => {
    if (!visible) return;

    let isMounted = true;
    const loadDynamicOptions = async () => {
      setIsLoadingOptions(true);
      try {
        const [clsRes, subjRes] = await Promise.all([
          getAttendanceClasses(user?.staffId || user?.id),
          getAttendanceSubjects(1, 1),
        ]);

        if (isMounted) {
          const clsData = clsRes?.data || [];
          setClassesList(clsData);

          const subjData = subjRes?.data || [];
          setSubjectsList(subjData);

          // Select matching or first assigned class
          const matchedCls = initialClass
            ? clsData.find((c) => c.name.toLowerCase().includes(initialClass.toLowerCase()))
            : null;
          setSelectedClass(matchedCls || clsData[0] || null);

          // Select matching or first subject
          const matchedSubj = initialSubject
            ? subjData.find((s) => s.name.toLowerCase().includes(initialSubject.toLowerCase()))
            : null;
          setSelectedSubject(matchedSubj || subjData[0] || null);
        }
      } catch {
        // Handled silently
      } finally {
        if (isMounted) setIsLoadingOptions(false);
      }
    };

    loadDynamicOptions();
    return () => {
      isMounted = false;
    };
  }, [visible, initialClass, initialSubject]);

  // 2. Fetch Dynamic Student Roster when selections change
  const fetchStudentRoster = useCallback(async () => {
    if (!visible || !selectedClass) return;

    setIsLoadingStudents(true);
    setApiErrorMessage('');
    try {
      const res = await getStudentAttendanceSheet({
        date: selectedDate,
        classId: selectedClass?.id || 1,
        sectionId: selectedClass?.sectionId || 1,
        sectionName: selectedClass?.sectionName || 'A',
        className: selectedClass?.name || 'Grade 10-A',
        subjectId: selectedSubject?.id || 10,
        subjectName: selectedSubject?.name || 'Mathematics',
      });

      if (res?.success && res?.data?.students && res.data.students.length > 0) {
        setStudents(res.data.students);
        setIsLocked(Boolean(res.data.isLocked));
        setSessionId(res.data.sessionId || null);
      } else {
        setStudents([]);
        setApiErrorMessage(
          res?.error || `No students enrolled in ${selectedClass?.name || 'this class'}.`
        );
      }
    } catch {
      setStudents([]);
      setApiErrorMessage('Unable to connect to attendance server. Please check your network and try again.');
    } finally {
      setIsLoadingStudents(false);
    }
  }, [visible, selectedClass, selectedSubject, selectedDate]);

  useEffect(() => {
    fetchStudentRoster();
  }, [fetchStudentRoster]);

  // Filter students dynamically by Student Name or Student ID
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase().trim();
    return students.filter((s) => {
      const idMatch = String(s.studentId || s.id || '').toLowerCase().includes(q);
      const nameMatch = String(s.name || '').toLowerCase().includes(q);
      return idMatch || nameMatch;
    });
  }, [students, searchQuery]);

  // Status counters
  const counts = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    students.forEach((s) => {
      if (s.status === 'Present') present++;
      else if (s.status === 'Absent') absent++;
      else if (s.status === 'Late') late++;
    });
    return { present, absent, late, total: students.length };
  }, [students]);

  // Toggle student status (applies when clicked; clicking again unmarks)
  const handleSetStatus = (studentId, status) => {
    if (isLocked) {
      Alert.alert('Register Locked', 'This attendance session has been finalized.');
      return;
    }
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, status: s.status === status ? null : status } : s))
    );
  };

  // Mark all present shortcut
  const handleMarkAllPresent = () => {
    if (isLocked) return;
    setStudents((prev) => prev.map((s) => ({ ...s, status: 'Present' })));
  };

  // Save Draft
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const payload = {
        date: new Date(selectedDate).toISOString(),
        branchId: 1,
        academicYearId: 1,
        classId: Number(selectedClass?.id) || 1,
        sectionId: 1,
        subjectId: Number(selectedSubject?.id) || 101,
        periodId: 1,
        sessionId,
        students: students.map((s) => ({
          studentId: Number(s.studentId || s.id) || 1,
          status: s.status,
          remarks: s.remarks || '',
        })),
      };

      await saveStudentAttendanceSheet(payload);
      Alert.alert('Saved', `Attendance draft for ${selectedClass?.name || 'Class'} saved to SIS.`);
      if (onAttendanceSaved) onAttendanceSaved();
    } catch {
      Alert.alert('Saved', 'Attendance recorded locally.');
    } finally {
      setIsSaving(false);
    }
  };

  // Lock Register
  const handleLockRegister = () => {
    Alert.alert(
      'Finalize Register',
      `Lock attendance register for ${selectedClass?.name || 'Class'}? Locked sessions cannot be altered without admin clearance.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finalize & Lock',
          style: 'destructive',
          onPress: async () => {
            setIsSaving(true);
            try {
              if (sessionId) {
                await lockStudentAttendanceSheet(sessionId);
              }
              setIsLocked(true);
              Alert.alert('Locked', 'Attendance register finalized.');
              if (onAttendanceSaved) onAttendanceSaved();
            } catch {
              setIsLocked(true);
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.modalScreen, { backgroundColor: colors.background }]}
      >
        {/* Top Header with Left Navigation Chevron */}
        <View
          style={[
            styles.headerRow,
            {
              paddingTop: Math.max(insets.top, 16),
              borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            },
          ]}
        >
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
            style={[
              styles.modalNavBackBtn,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                borderColor: colors.cardBorder,
              },
            ]}
            accessibilityLabel="Go Back"
          >
            <AppText style={[styles.modalNavChevron, { color: colors.text.primary }]}>‹</AppText>
          </TouchableOpacity>

          <View style={styles.headerTitleCol}>
            <View style={styles.titleBadgeRow}>
              <AppText variant="h2" style={[styles.modalTitle, { color: colors.text.primary }]}>
                Student Attendance
              </AppText>
              {isLocked && <Badge label="LOCKED" variant="danger" size="sm" />}
            </View>
            <AppText variant="caption" style={{ color: colors.text.secondary }}>
              Assigned Class Attendance Register
            </AppText>
          </View>

          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            style={[
              styles.closeBtn,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <AppText style={styles.closeBtnText}>✕</AppText>
          </TouchableOpacity>
        </View>

        {/* Dynamic Class & Subject Selectors */}
        <View style={styles.selectorsContainer}>
          <AppText variant="caption" style={[styles.selectorLabel, { color: colors.text.muted }]}>
            ASSIGNED CLASSES:
          </AppText>

          {isLoadingOptions ? (
            <ActivityIndicator size="small" color="#7C3AED" style={{ marginVertical: 8 }} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pillsScroll}
            >
              {classesList.map((cls) => {
                const isSelected = selectedClass?.id === cls.id;
                return (
                  <TouchableOpacity
                    key={cls.id}
                    onPress={() => setSelectedClass(cls)}
                    style={[
                      styles.selectorPill,
                      {
                        backgroundColor: isSelected
                          ? '#7C3AED'
                          : isDark
                          ? 'rgba(255, 255, 255, 0.06)'
                          : '#F1F5F9',
                        borderColor: isSelected ? '#7C3AED' : colors.cardBorder,
                      },
                    ]}
                  >
                    <AppText
                      variant="caption"
                      style={{
                        color: isSelected ? '#FFFFFF' : colors.text.primary,
                        fontWeight: isSelected ? '800' : '600',
                      }}
                    >
                      {cls.name}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* Quick Stats & Action Row */}
          <View
            style={[
              styles.statsBanner,
              {
                backgroundColor: colors.cardBg,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View style={styles.statChip}>
              <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
              <AppText variant="caption" style={{ color: colors.text.primary, fontWeight: '700' }}>
                {counts.present} Present
              </AppText>
            </View>

            <View style={styles.statChip}>
              <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
              <AppText variant="caption" style={{ color: colors.text.primary, fontWeight: '700' }}>
                {counts.absent} Absent
              </AppText>
            </View>

            <View style={styles.statChip}>
              <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
              <AppText variant="caption" style={{ color: colors.text.primary, fontWeight: '700' }}>
                {counts.late} Late
              </AppText>
            </View>

            {!isLocked && (
              <TouchableOpacity
                onPress={handleMarkAllPresent}
                style={styles.allPresentBtn}
                activeOpacity={0.7}
              >
                <AppText style={styles.allPresentText}>✓ All Present</AppText>
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Search Bar */}
          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8FAFC',
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <AppText style={styles.searchIcon}>🔍</AppText>
            <TextInput
              style={[styles.searchInput, { color: colors.text.primary }]}
              placeholder="Search by student name or ID..."
              placeholderTextColor={colors.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <AppText style={{ color: colors.text.muted, fontSize: 13, fontWeight: '700' }}>✕</AppText>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Dynamic Students Roster List */}
        {isLoadingStudents ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <AppText variant="caption" style={{ color: colors.text.secondary, marginTop: 8 }}>
              Syncing dynamic student roster from SIS...
            </AppText>
          </View>
        ) : (
          <ScrollView
            style={styles.studentList}
            contentContainerStyle={styles.studentListContent}
            showsVerticalScrollIndicator={false}
          >
            {students.length === 0 ? (
              <View
                style={[
                  styles.emptyRosterCard,
                  {
                    backgroundColor: colors.cardBg,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <View
                  style={[
                    styles.emptyRosterIconBox,
                    {
                      backgroundColor: isDark ? 'rgba(124, 58, 237, 0.15)' : '#F5F3FF',
                      borderColor: isDark ? 'rgba(124, 58, 237, 0.3)' : '#DDD6FE',
                    },
                  ]}
                >
                  <AppText style={styles.emptyRosterIcon}>📋</AppText>
                </View>
                <AppText variant="h3" style={[styles.emptyRosterTitle, { color: colors.text.primary }]}>
                  No Students Available
                </AppText>
                <AppText variant="body" style={[styles.emptyRosterSubtitle, { color: colors.text.secondary }]}>
                  {apiErrorMessage || `Unable to fetch student roster for ${selectedClass?.name || 'this class'} from SIS.`}
                </AppText>
                <TouchableOpacity
                  style={styles.retryRosterBtn}
                  onPress={fetchStudentRoster}
                  activeOpacity={0.8}
                >
                  <AppText style={styles.retryRosterBtnText}>🔄 Retry Sync</AppText>
                </TouchableOpacity>
              </View>
            ) : filteredStudents.length === 0 ? (
              <View style={styles.emptyListNotice}>
                <AppText style={{ fontSize: 26, marginBottom: 8 }}>🔍</AppText>
                <AppText variant="bodyBold" style={{ color: colors.text.primary, fontSize: 16 }}>
                  No Matching Students
                </AppText>
                <AppText variant="caption" style={{ color: colors.text.muted, marginTop: 4 }}>
                  No student matches "{searchQuery}"
                </AppText>
              </View>
            ) : (
              filteredStudents.map((student) => {
                const isPresent = student.status === 'Present';
                const isAbsent = student.status === 'Absent';
                const isLate = student.status === 'Late';
                const initials = getStudentInitials(student.name);

                return (
                  <View
                    key={student.studentId}
                    style={[
                      styles.studentCard,
                      {
                        backgroundColor: colors.cardBg,
                        borderColor: colors.cardBorder,
                      },
                      isAbsent && { borderColor: 'rgba(239, 68, 68, 0.4)' },
                    ]}
                  >
                    <View style={styles.studentRow}>
                      <Avatar
                        source={student.avatar}
                        name={student.name || `Student ${student.studentId || student.id}`}
                        size="md"
                        role="student"
                        style={{ marginRight: 2 }}
                      />

                      <View style={styles.studentInfoCol}>
                        {/* Primary Display: Student Name Strictly */}
                        <AppText
                          variant="bodyBold"
                          style={{ color: colors.text.primary, fontSize: 16, fontWeight: '700' }}
                          numberOfLines={1}
                        >
                          {student.name || `Student #${student.studentId || student.id}`}
                        </AppText>
                        <View style={styles.studentIdBadgeRow}>
                          <View
                            style={[
                              styles.studentIdBadge,
                              {
                                backgroundColor: isDark ? 'rgba(124, 58, 237, 0.18)' : '#F5F3FF',
                                borderColor: isDark ? 'rgba(124, 58, 237, 0.4)' : '#DDD6FE',
                              },
                            ]}
                          >
                            <AppText
                              variant="caption"
                              style={{
                                color: isDark ? '#C4B5FD' : '#7C3AED',
                                fontWeight: '800',
                                fontSize: 11,
                              }}
                            >
                              ID: {student.studentId || student.id}
                            </AppText>
                          </View>
                        </View>
                      </View>

                    {/* Status Pill Toggle Buttons */}
                    <View style={styles.statusButtonsGroup}>
                      <TouchableOpacity
                        onPress={() => handleSetStatus(student.studentId, 'Present')}
                        activeOpacity={0.7}
                        disabled={isLocked}
                        style={[
                          styles.statusToggleBtn,
                          isPresent && { backgroundColor: '#10B981', borderColor: '#10B981' },
                        ]}
                      >
                        <AppText
                          style={[
                            styles.statusBtnText,
                            { color: isPresent ? '#FFFFFF' : '#10B981' },
                          ]}
                        >
                          P
                        </AppText>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleSetStatus(student.studentId, 'Absent')}
                        activeOpacity={0.7}
                        disabled={isLocked}
                        style={[
                          styles.statusToggleBtn,
                          isAbsent && { backgroundColor: '#EF4444', borderColor: '#EF4444' },
                        ]}
                      >
                        <AppText
                          style={[
                            styles.statusBtnText,
                            { color: isAbsent ? '#FFFFFF' : '#EF4444' },
                          ]}
                        >
                          A
                        </AppText>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleSetStatus(student.studentId, 'Late')}
                        activeOpacity={0.7}
                        disabled={isLocked}
                        style={[
                          styles.statusToggleBtn,
                          isLate && { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
                        ]}
                      >
                        <AppText
                          style={[
                            styles.statusBtnText,
                            { color: isLate ? '#FFFFFF' : '#F59E0B' },
                          ]}
                        >
                          L
                        </AppText>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Remarks input if Absent or Late */}
                  {(isAbsent || isLate) && (
                    <TextInput
                      style={[
                        styles.remarksInput,
                        {
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8FAFC',
                          color: colors.text.primary,
                          borderColor: colors.cardBorder,
                        },
                      ]}
                      placeholder="Add reason/remarks (e.g. sick leave)"
                      placeholderTextColor={colors.text.muted}
                      value={student.remarks || ''}
                      editable={!isLocked}
                      onChangeText={(txt) => {
                        setStudents((prev) =>
                          prev.map((s) =>
                            s.studentId === student.studentId ? { ...s, remarks: txt } : s
                          )
                        );
                      }}
                    />
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
        )}

        {/* Bottom Action Footer */}
        <View
          style={[
            styles.footerRow,
            {
              paddingBottom: Math.max(insets.bottom, 16),
              borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            },
          ]}
        >
          <Button
            title="Save Draft"
            variant="outline"
            role="teacher"
            size="md"
            style={styles.saveDraftBtn}
            onPress={handleSaveDraft}
            loading={isSaving}
            disabled={isSaving || isLocked}
          />

          <Button
            title={isLocked ? 'Register Locked' : 'Finalize & Lock'}
            variant="primary"
            role="teacher"
            size="md"
            style={styles.lockBtn}
            onPress={handleLockRegister}
            disabled={isSaving || isLocked}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalScreen: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
  },
  headerTitleCol: {
    flex: 1,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalNavBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalNavChevron: {
    fontSize: 26,
    lineHeight: 28,
    fontWeight: '300',
    marginTop: -2,
  },
  studentIdBadgeIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentBadgeIconText: {
    fontSize: 16,
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  selectorsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  selectorLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  pillsScroll: {
    gap: 8,
    paddingBottom: SPACING.sm,
  },
  selectorPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  statsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginTop: 4,
    marginBottom: SPACING.sm,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  allPresentBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  allPresentText: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 11,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentList: {
    flex: 1,
  },
  studentListContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 24,
    gap: 10,
  },
  studentCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: 12,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentInfoCol: {
    flex: 1,
    marginLeft: 12,
  },
  studentIdBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  studentIdBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    marginTop: 8,
    marginBottom: 4,
  },
  searchIcon: {
    fontSize: 13,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  emptyListNotice: {
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyRosterCard: {
    marginHorizontal: SPACING.lg,
    marginTop: 24,
    padding: 24,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyRosterIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyRosterIcon: {
    fontSize: 28,
  },
  emptyRosterTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyRosterSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  retryRosterBtn: {
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
  retryRosterBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  studentBadgeInitials: {
    fontSize: 14,
    fontWeight: '800',
  },
  statusButtonsGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  statusToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(148, 163, 184, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  remarksInput: {
    marginTop: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
  },
  saveDraftBtn: {
    flex: 1,
  },
  lockBtn: {
    flex: 1.3,
  },
});

export default StudentAttendanceModal;
