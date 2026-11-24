import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../typography/AppText';
import { Badge } from '../common/Badge';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, RADIUS } from '../../constants/spacing';

export const NotificationsModal = ({
  visible = false,
  onClose,
  notifications = [],
  onToggleRead,
  onMarkAllRead,
  onClearRead,
  role = 'teacher',
}) => {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const [filter, setFilter] = useState('All');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleCardPress = (item) => {
    if (!item.read && onToggleRead) {
      onToggleRead(item.id);
    }
    Alert.alert(
      item.title,
      `${item.desc}\n\nCategory: ${item.category}\nReceived: ${item.time}`,
      [{ text: 'Close', style: 'cancel' }]
    );
  };

  const filteredItems = notifications.filter((n) => {
    if (filter === 'Unread') return !n.read;
    if (filter === 'Important') return n.urgent;
    return true;
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.sheetOverlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.sheetContainer,
                {
                  backgroundColor: isDark ? '#0D1326' : '#FFFFFF',
                  borderColor: colors.cardBorder,
                  paddingBottom: Math.max(insets.bottom, 16) + 12,
                },
              ]}
            >
              {/* Drag Handle Bar Pill */}
              <View
                style={[
                  styles.dragPill,
                  { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.15)' },
                ]}
              />

              {/* Sheet Header Row */}
              <View style={styles.sheetHeader}>
                <View style={styles.titleCol}>
                  <View style={styles.titleRow}>
                    <View style={[styles.bellBox, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF' }]}>
                      <AppText style={styles.bellIcon}>🔔</AppText>
                    </View>
                    <AppText variant="h2" style={[styles.sheetTitle, { color: colors.text.primary }]}>
                      Notifications
                    </AppText>
                    {unreadCount > 0 ? (
                      <View style={styles.unreadPill}>
                        <AppText style={styles.unreadPillText}>{unreadCount} New</AppText>
                      </View>
                    ) : (
                      <View style={styles.caughtUpPill}>
                        <AppText style={styles.caughtUpPillText}>✓ Caught Up</AppText>
                      </View>
                    )}
                  </View>
                  <AppText variant="caption" style={{ color: colors.text.secondary, marginTop: 2, paddingLeft: 2 }}>
                    Real-time campus updates & reminders
                  </AppText>
                </View>

                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={[styles.closeBtn, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9' }]}
                  activeOpacity={0.7}
                  accessibilityLabel="Close Notifications"
                >
                  <AppText style={[styles.closeIcon, { color: colors.text.secondary }]}>✕</AppText>
                </TouchableOpacity>
              </View>

              {/* Filter Pills & Actions Row */}
              <View
                style={[
                  styles.filterRow,
                  { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)' },
                ]}
              >
                <View style={styles.filterPills}>
                  {['All', 'Unread', 'Important'].map((f) => {
                    const isSelected = filter === f;
                    const count = f === 'All'
                      ? notifications.length
                      : f === 'Unread'
                      ? unreadCount
                      : notifications.filter((n) => n.urgent).length;

                    return (
                      <TouchableOpacity
                        key={f}
                        onPress={() => setFilter(f)}
                        activeOpacity={0.7}
                        style={[
                          styles.filterPill,
                          {
                            backgroundColor: isSelected
                              ? '#2563EB'
                              : isDark
                              ? 'rgba(255, 255, 255, 0.06)'
                              : '#F1F5F9',
                            borderColor: isSelected ? '#2563EB' : colors.cardBorder,
                          },
                        ]}
                      >
                        <AppText
                          variant="caption"
                          style={{
                            color: isSelected ? '#FFFFFF' : colors.text.secondary,
                            fontWeight: isSelected ? '700' : '600',
                            fontSize: 12,
                          }}
                        >
                          {f} ({count})
                        </AppText>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {unreadCount > 0 && onMarkAllRead && (
                  <TouchableOpacity onPress={onMarkAllRead} activeOpacity={0.7}>
                    <AppText variant="caption" style={styles.markAllReadLink}>
                      Mark all read
                    </AppText>
                  </TouchableOpacity>
                )}
              </View>

              {/* Notification Cards List */}
              <ScrollView
                style={styles.cardScroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {filteredItems.length === 0 ? (
                  <View style={styles.emptyView}>
                    <AppText style={styles.emptyEmoji}>🎉</AppText>
                    <AppText variant="bodyBold" style={{ color: colors.text.primary, marginTop: 8, fontSize: 16 }}>
                      {filter === 'Unread' ? 'No unread notifications' : 'No alerts in this category'}
                    </AppText>
                    <AppText variant="caption" style={{ color: colors.text.muted, marginTop: 3 }}>
                      You are completely caught up with your campus schedule.
                    </AppText>
                  </View>
                ) : (
                  filteredItems.map((item) => {
                    const isUnread = !item.read;

                    return (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => handleCardPress(item)}
                        activeOpacity={0.75}
                        style={[
                          styles.notifCard,
                          {
                            backgroundColor: isUnread
                              ? isDark
                                ? 'rgba(59, 130, 246, 0.12)'
                                : '#F0F7FF'
                              : isDark
                              ? 'rgba(255, 255, 255, 0.03)'
                              : '#FAFAFA',
                            borderColor: item.urgent
                              ? '#EF4444'
                              : isUnread
                              ? '#3B82F6'
                              : colors.cardBorder,
                            borderWidth: isUnread || item.urgent ? 1.5 : 1,
                          },
                        ]}
                      >
                        {/* Icon column */}
                        <View
                          style={[
                            styles.notifIconBox,
                            {
                              backgroundColor: item.urgent
                                ? 'rgba(239, 68, 68, 0.15)'
                                : isUnread
                                ? 'rgba(59, 130, 246, 0.15)'
                                : isDark
                                ? 'rgba(255, 255, 255, 0.08)'
                                : '#F1F5F9',
                            },
                          ]}
                        >
                          <AppText style={styles.notifEmoji}>{item.icon || '📌'}</AppText>
                        </View>

                        {/* Content column */}
                        <View style={styles.notifContentCol}>
                          <View style={styles.notifTopRow}>
                            <View style={styles.categoryPillRow}>
                              {isUnread && <View style={styles.unreadDot} />}
                              <Badge
                                label={item.category}
                                variant={item.urgent ? 'danger' : 'neutral'}
                                size="sm"
                              />
                            </View>
                            <AppText variant="caption" style={{ color: colors.text.muted, fontSize: 11 }}>
                              {item.time}
                            </AppText>
                          </View>

                          <AppText
                            variant="bodyBold"
                            style={[
                              styles.notifTitle,
                              { color: colors.text.primary },
                              isUnread && { fontWeight: '800' },
                            ]}
                          >
                            {item.title}
                          </AppText>

                          <AppText
                            variant="caption"
                            style={[styles.notifDesc, { color: colors.text.secondary }]}
                            numberOfLines={2}
                          >
                            {item.desc}
                          </AppText>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>

              {/* Bottom Actions footer */}
              {notifications.some((n) => n.read) && onClearRead && (
                <View style={styles.sheetFooter}>
                  <TouchableOpacity
                    onPress={onClearRead}
                    activeOpacity={0.75}
                    style={[
                      styles.clearBtn,
                      {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9',
                        borderColor: colors.cardBorder,
                      },
                    ]}
                  >
                    <AppText variant="caption" style={{ color: colors.text.secondary, fontWeight: '600' }}>
                      Clear read notifications
                    </AppText>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    width: '100%',
    maxHeight: '85%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopWidth: 1.5,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingTop: 8,
    paddingHorizontal: SPACING.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.3,
        shadowRadius: 25,
      },
      android: {
        elevation: 24,
      },
      default: {
        boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.3)',
      },
    }),
  },
  dragPill: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  titleCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bellBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellIcon: {
    fontSize: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  unreadPill: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  unreadPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  caughtUpPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  caughtUpPillText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  closeIcon: {
    fontSize: 14,
    fontWeight: '800',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  filterPills: {
    flexDirection: 'row',
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  markAllReadLink: {
    color: '#3B82F6',
    fontWeight: '700',
    fontSize: 12,
  },
  cardScroll: {
    maxHeight: 400,
  },
  scrollContent: {
    paddingVertical: 4,
  },
  notifCard: {
    flexDirection: 'row',
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  notifIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  notifEmoji: {
    fontSize: 18,
  },
  notifContentCol: {
    flex: 1,
  },
  notifTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#3B82F6',
  },
  notifTitle: {
    fontSize: 14,
    lineHeight: 19,
    marginBottom: 3,
  },
  notifDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  emptyView: {
    paddingVertical: SPACING.xl * 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEmoji: {
    fontSize: 36,
  },
  sheetFooter: {
    paddingTop: 10,
    alignItems: 'center',
  },
  clearBtn: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
});

export default NotificationsModal;
