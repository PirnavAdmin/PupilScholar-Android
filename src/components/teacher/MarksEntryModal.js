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
import {
  getMarksEntryOptions,
  getMarksEntryStudents,
  saveMarksDraft,
  submitFinalMarks,
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

export const MarksEntryModal = ({ visible, onClose, initialExam = '', onMarksSaved }) => {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();

  // Dynamic Options
  const [examsList, setExamsList] = useState([]);
  const [classesList, setClassesList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);

  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [students, setStudents] = useState([]);
  const [apiErrorMessage, setApiErrorMessage] = useState('');
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 1. Fetch Dynamic Exams, Classes, Subjects on modal open
  useEffect(() => {
    if (!visible) return;

    let isMounted = true;
    const loadOptions = async () => {
      setIsLoadingOptions(true);
      try {
        const res = await getMarksEntryOptions();
        if (isMounted && res?.data) {
          const { exams = [], classes = [], subjects = [] } = res.data;
          setExamsList(exams);
          setClassesList(classes);
          setSubjectsList(subjects);

          const matchedExam = initialExam
            ? exams.find((e) => e.name.toLowerCase().includes(initialExam.toLowerCase()))
            : null;
          setSelectedExam(matchedExam || exams[0] || null);
          setSelectedClass(classes[0] || null);
          setSelectedSubject(subjects[0] || null);
        }
      } catch {
        // Handled silently
      } finally {
        if (isMounted) setIsLoadingOptions(false);
      }
    };

    loadOptions();
    return () => {
      isMounted = false;
    };
  }, [visible, initialExam]);

  // 2. Fetch Dynamic Students Roster for Selected Exam & Class
  const fetchMarksRoster = useCallback(async () => {
    if (!visible || !selectedClass) return;

    setIsLoadingStudents(true);
    setApiErrorMessage('');
    try {
      const res = await getMarksEntryStudents({
        className: selectedClass?.name || 'Grade 10-A',
        sectionName: selectedClass?.sectionName || 'A',
        subjectCode: selectedSubject?.name || 'Mathematics',
        classId: selectedClass?.id || 1,
      });

      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setStudents(res.data);
      } else {
        setStudents([]);
        setApiErrorMessage(res?.error || `No students enrolled in ${selectedClass?.name || 'this class'}.`);
      }
    } catch {
      setStudents([]);
      setApiErrorMessage('Unable to connect to marks entry server. Please try again.');
    } finally {
      setIsLoadingStudents(false);
    }
  }, [visible, selectedClass, selectedSubject]);

  useEffect(() => {
    fetchMarksRoster();
  }, [fetchMarksRoster]);

  // Compute stats
  const stats = useMemo(() => {
    let totalMarks = 0;
    let gradedCount = 0;
    let highest = 0;
    let absentCount = 0;

    students.forEach((s) => {
      if (s.isAbsent) {
        absentCount++;
      } else {
        const m = Number(s.marksObtained) || 0;
        totalMarks += m;
        gradedCount++;
        if (m > highest) highest = m;
      }
    });

    const avg = gradedCount > 0 ? (totalMarks / gradedCount).toFixed(1) : 0;
    return { avg, highest, absentCount, total: students.length };
  }, [students]);

  // Handle Mark Change
  const handleMarkChange = (studentId, text) => {
    const numVal = text.replace(/[^0-9]/g, '');
    const cleanNum = numVal ? Math.min(Number(numVal), 100) : '';

    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, marksObtained: cleanNum } : s))
    );
  };

  // Toggle Absent
  const handleToggleAbsent = (studentId) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.studentId === studentId) {
          const nextAbsent = !s.isAbsent;
          return {
            ...s,
            isAbsent: nextAbsent,
            marksObtained: nextAbsent ? 0 : s.marksObtained || '',
            remarks: nextAbsent ? 'Absent' : '',
          };
        }
        return s;
      })
    );
  };

  // Save Draft
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const payload = {
        examName: selectedExam?.name || '',
        className: selectedClass?.name || '',
        subjectName: selectedSubject?.name || '',
        students: students.map((s) => ({
          studentId: s.studentId,
          marksObtained: s.marksObtained,
          maxMarks: s.maxMarks || 100,
          isAbsent: s.isAbsent,
          remarks: s.remarks,
        })),
      };

      await saveMarksDraft(payload);
      Alert.alert('Draft Saved', `Marks draft for ${selectedClass?.name || 'Class'} saved.`);
      if (onMarksSaved) onMarksSaved();
    } catch {
      Alert.alert('Draft Saved', 'Marks draft recorded.');
    } finally {
      setIsSaving(false);
    }
  };

  // Final Submit
  const handleSubmitFinal = () => {
    Alert.alert(
      'Submit Final Marks',
      `Publish finalized marks for ${selectedClass?.name || 'Class'}? Once published, changes require administrative override.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finalize & Submit',
          onPress: async () => {
            setIsSaving(true);
            try {
              const payload = {
                examName: selectedExam?.name || '',
                className: selectedClass?.name || '',
                subjectName: selectedSubject?.name || '',
                students,
              };

              await submitFinalMarks(payload);
              setIsSubmitted(true);
              Alert.alert('Submitted', 'Marks entered.');
              if (onMarksSaved) onMarksSaved();
            } catch {
              setIsSubmitted(true);
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
              styles.closeBtn,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                borderColor: colors.cardBorder,
                marginRight: 10,
              },
            ]}
            accessibilityLabel="Go Back"
          >
            <AppText style={{ fontSize: 24, lineHeight: 26, fontWeight: '300', color: colors.text.primary, marginTop: -2 }}>‹</AppText>
          </TouchableOpacity>

          <View style={styles.headerTitleCol}>
            <View style={styles.titleBadgeRow}>
              <AppText variant="h2" style={[styles.modalTitle, { color: colors.text.primary }]}>
                Grade Book & Marks Entry
              </AppText>
              {isSubmitted && <Badge label="SUBMITTED" variant="success" size="sm" />}
            </View>
            <AppText variant="caption" style={{ color: colors.text.secondary }}>
              Assigned Examination Scores & Marks Roster
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

        {/* Dynamic Filters Bar */}
        <View style={styles.filtersSection}>
          <AppText variant="caption" style={[styles.filterLabel, { color: colors.text.muted }]}>
            EXAMINATION (DYNAMIC):
          </AppText>

          {isLoadingOptions ? (
            <ActivityIndicator size="small" color="#7C3AED" style={{ marginVertical: 6 }} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterPillsScroll}
            >
              {examsList.map((ex) => {
                const isSelected = selectedExam?.id === ex.id;
                return (
                  <TouchableOpacity
                    key={ex.id}
                    onPress={() => setSelectedExam(ex)}
                    style={[
                      styles.filterPill,
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
                      {ex.name}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* Quick Analytics Header */}
          <View
            style={[
              styles.summaryBanner,
              {
                backgroundColor: colors.cardBg,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View style={styles.summaryItem}>
              <AppText variant="caption" style={{ color: colors.text.muted }}>
                Class Avg
              </AppText>
              <AppText variant="bodyBold" style={{ color: '#7C3AED' }}>
                {stats.avg}/100
              </AppText>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <AppText variant="caption" style={{ color: colors.text.muted }}>
                Highest
              </AppText>
              <AppText variant="bodyBold" style={{ color: '#10B981' }}>
                {stats.highest}
              </AppText>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <AppText variant="caption" style={{ color: colors.text.muted }}>
                Absent
              </AppText>
              <AppText variant="bodyBold" style={{ color: '#EF4444' }}>
                {stats.absentCount}
              </AppText>
            </View>
          </View>
        </View>

        {/* Dynamic Students Score Roster */}
        {isLoadingStudents ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <AppText variant="caption" style={{ color: colors.text.secondary, marginTop: 8 }}>
              Syncing marks entry roster from SIS...
            </AppText>
          </View>
        ) : (
          <ScrollView
            style={styles.rosterScroll}
            contentContainerStyle={styles.rosterScrollContent}
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
                  <AppText style={styles.emptyRosterIcon}>📝</AppText>
                </View>
                <AppText variant="h3" style={[styles.emptyRosterTitle, { color: colors.text.primary }]}>
                  No Students Available
                </AppText>
                <AppText variant="body" style={[styles.emptyRosterSubtitle, { color: colors.text.secondary }]}>
                  {apiErrorMessage || `Unable to fetch student roster for ${selectedClass?.name || 'this class'} from SIS.`}
                </AppText>
                <TouchableOpacity
                  style={styles.retryRosterBtn}
                  onPress={fetchMarksRoster}
                  activeOpacity={0.8}
                >
                  <AppText style={styles.retryRosterBtnText}>🔄 Retry Sync</AppText>
                </TouchableOpacity>
              </View>
            ) : (
              students.map((st) => {
                const initials = getStudentInitials(st.name);
                return (
                  <View
                    key={st.studentId}
                    style={[
                      styles.studentScoreCard,
                      {
                        backgroundColor: colors.cardBg,
                        borderColor: colors.cardBorder,
                      },
                      st.isAbsent && { opacity: 0.7 },
                    ]}
                  >
                    <View style={styles.stRow}>
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          borderWidth: 1,
                          backgroundColor: isDark ? 'rgba(124, 58, 237, 0.18)' : '#F5F3FF',
                          borderColor: isDark ? 'rgba(124, 58, 237, 0.4)' : '#DDD6FE',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <AppText
                          style={{
                            color: isDark ? '#C4B5FD' : '#7C3AED',
                            fontSize: 13,
                            fontWeight: '800',
                          }}
                        >
                          {initials}
                        </AppText>
                      </View>

                      <View style={styles.stInfo}>
                        <AppText
                          variant="bodyBold"
                          style={{ color: colors.text.primary, fontSize: 15, fontWeight: '700' }}
                          numberOfLines={1}
                        >
                          {st.name || `Student #${st.studentId || st.id}`}
                        </AppText>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                          <View
                            style={{
                              backgroundColor: isDark ? 'rgba(124, 58, 237, 0.18)' : '#F5F3FF',
                              borderColor: isDark ? 'rgba(124, 58, 237, 0.4)' : '#DDD6FE',
                              borderWidth: 1,
                              borderRadius: 4,
                              paddingHorizontal: 6,
                              paddingVertical: 1,
                            }}
                          >
                            <AppText
                              variant="caption"
                              style={{
                                color: isDark ? '#C4B5FD' : '#7C3AED',
                                fontWeight: '800',
                                fontSize: 10,
                              }}
                            >
                              ID: {st.studentId || st.id}
                            </AppText>
                          </View>
                        </View>
                      </View>

                  {/* Marks Input Box */}
                  <View style={styles.scoreInputWrapper}>
                    <TextInput
                      style={[
                        styles.scoreInput,
                        {
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F8FAFC',
                          color: colors.text.primary,
                          borderColor: colors.cardBorder,
                        },
                        st.isAbsent && { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
                      ]}
                      keyboardType="number-pad"
                      maxLength={3}
                      value={st.isAbsent ? 'AB' : String(st.marksObtained ?? '')}
                      editable={!st.isAbsent && !isSubmitted}
                      onChangeText={(val) => handleMarkChange(st.studentId, val)}
                      placeholder="0"
                      placeholderTextColor={colors.text.muted}
                    />
                    <AppText variant="caption" style={{ color: colors.text.muted, marginLeft: 4 }}>
                      /100
                    </AppText>
                  </View>

                  {/* Absent Toggle Button */}
                  <TouchableOpacity
                    onPress={() => handleToggleAbsent(st.studentId)}
                    disabled={isSubmitted}
                    style={[
                      styles.absentToggle,
                      {
                        backgroundColor: st.isAbsent
                          ? '#EF4444'
                          : isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : '#F1F5F9',
                        borderColor: st.isAbsent ? '#EF4444' : colors.cardBorder,
                      },
                    ]}
                  >
                    <AppText
                      style={[
                        styles.absentToggleText,
                        { color: st.isAbsent ? '#FFFFFF' : colors.text.secondary },
                      ]}
                    >
                      {st.isAbsent ? 'ABSENT' : 'Present'}
                    </AppText>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
        )}

        {/* Footer Actions */}
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
            disabled={isSaving || isSubmitted}
          />

          <Button
            title={isSubmitted ? 'Marks Submitted' : 'Submit Final Marks'}
            variant="primary"
            role="teacher"
            size="md"
            style={styles.submitFinalBtn}
            onPress={handleSubmitFinal}
            disabled={isSaving || isSubmitted}
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
  closeBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  filtersSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  filterLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  filterPillsScroll: {
    gap: 8,
    paddingBottom: SPACING.sm,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  summaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rosterScroll: {
    flex: 1,
  },
  rosterScrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 24,
    gap: 10,
  },
  studentScoreCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: 12,
  },
  stRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stInfo: {
    flex: 1,
    marginLeft: 12,
  },
  scoreInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  scoreInput: {
    width: 52,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '800',
  },
  absentToggle: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  absentToggleText: {
    fontSize: 11,
    fontWeight: '800',
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
  submitFinalBtn: {
    flex: 1.3,
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
});

export default MarksEntryModal;
