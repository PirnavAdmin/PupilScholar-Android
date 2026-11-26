import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../typography/AppText';
import { Badge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { useTheme } from '../../context/ThemeContext';
import {
  getTeacherChatContacts,
  getTeacherChatMessages,
  sendTeacherChatMessage,
} from '../../api/teacherApi';
import { SPACING, RADIUS } from '../../constants/spacing';

export const ParentCommunicationModal = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();

  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const scrollViewRef = useRef(null);

  // Load contacts list
  useEffect(() => {
    if (!visible) return;

    let isMounted = true;
    const fetchContacts = async () => {
      setIsLoadingContacts(true);
      try {
        const res = await getTeacherChatContacts();
        if (isMounted && res.data) {
          setContacts(res.data);
        }
      } catch {
        // Fallback handled inside teacherApi
      } finally {
        if (isMounted) setIsLoadingContacts(false);
      }
    };

    fetchContacts();
    return () => {
      isMounted = false;
    };
  }, [visible]);

  // Load messages when contact is selected
  useEffect(() => {
    if (!selectedContact) return;

    let isMounted = true;
    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const res = await getTeacherChatMessages(selectedContact.id);
        if (isMounted && res.data) {
          setMessages(res.data);
        }
      } catch {
        // Handled silently
      } finally {
        if (isMounted) setIsLoadingMessages(false);
      }
    };

    fetchMessages();
    return () => {
      isMounted = false;
    };
  }, [selectedContact]);

  // Send message
  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text || !selectedContact) return;

    const newMsg = {
      id: `msg_${Date.now()}`,
      senderId: 'me',
      senderName: 'Mrs. Jenkins',
      message: text,
      timestamp: 'Just now',
      isIncoming: false,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    try {
      await sendTeacherChatMessage({
        receiverId: selectedContact.id,
        message: text,
      });
    } catch {
      // Kept in local state
    }

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.modalScreen, { backgroundColor: colors.background }]}
      >
        {/* Header */}
        <View
          style={[
            styles.headerRow,
            {
              paddingTop: Math.max(insets.top, 16),
              borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            },
          ]}
        >
          {selectedContact ? (
            <TouchableOpacity
              onPress={() => setSelectedContact(null)}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <AppText style={styles.backIcon}>←</AppText>
            </TouchableOpacity>
          ) : null}

          <View style={styles.headerTitleCol}>
            <AppText variant="h2" style={[styles.modalTitle, { color: colors.text.primary }]}>
              {selectedContact ? selectedContact.name : 'Parent Communication'}
            </AppText>
            <AppText variant="caption" style={{ color: colors.text.secondary }}>
              {selectedContact
                ? `${selectedContact.studentName || 'Student'} • ${selectedContact.grade || 'Grade 10'}`
                : 'Direct messaging with guardians & staff'}
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

        {/* Content Body: Either Contacts List or Chat Thread */}
        {!selectedContact ? (
          isLoadingContacts ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#7C3AED" />
              <AppText variant="caption" style={{ color: colors.text.secondary, marginTop: 8 }}>
                Loading parent contacts...
              </AppText>
            </View>
          ) : (
            <ScrollView
              style={styles.contactsScroll}
              contentContainerStyle={styles.contactsScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {contacts.map((contact) => (
                <TouchableOpacity
                  key={contact.id}
                  onPress={() => setSelectedContact(contact)}
                  activeOpacity={0.75}
                  style={[
                    styles.contactCard,
                    {
                      backgroundColor: colors.cardBg,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                >
                  <Avatar name={contact.name} size="md" role="parent" />

                  <View style={styles.contactInfoCol}>
                    <View style={styles.contactTopRow}>
                      <AppText variant="bodyBold" style={{ color: colors.text.primary, flex: 1 }} numberOfLines={1}>
                        {contact.name}
                      </AppText>
                      <AppText variant="caption" style={{ color: colors.text.muted }}>
                        {contact.lastTime}
                      </AppText>
                    </View>

                    <AppText variant="caption" style={{ color: colors.text.secondary, marginBottom: 2 }}>
                      {contact.studentName ? `Student: ${contact.studentName} (${contact.grade})` : contact.designation}
                    </AppText>

                    <AppText variant="caption" style={{ color: colors.text.muted }} numberOfLines={1}>
                      {contact.lastMessage}
                    </AppText>
                  </View>

                  {contact.unreadCount > 0 && (
                    <Badge label={String(contact.unreadCount)} variant="teacher" size="sm" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )
        ) : (
          <View style={styles.chatContainer}>
            {isLoadingMessages ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#7C3AED" />
              </View>
            ) : (
              <ScrollView
                ref={scrollViewRef}
                style={styles.messagesScroll}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
              >
                {messages.map((msg) => {
                  const isMine = !msg.isIncoming;
                  return (
                    <View
                      key={msg.id}
                      style={[
                        styles.msgBubbleWrapper,
                        isMine ? styles.myMsgWrapper : styles.theirMsgWrapper,
                      ]}
                    >
                      <View
                        style={[
                          styles.msgBubble,
                          isMine
                            ? styles.myBubble
                            : [styles.theirBubble, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }],
                        ]}
                      >
                        <AppText
                          variant="body"
                          style={{
                            color: isMine ? '#FFFFFF' : colors.text.primary,
                            fontSize: 14,
                            lineHeight: 20,
                          }}
                        >
                          {msg.message}
                        </AppText>
                        <AppText
                          variant="caption"
                          style={{
                            color: isMine ? 'rgba(255, 255, 255, 0.7)' : colors.text.muted,
                            fontSize: 10,
                            marginTop: 4,
                            alignSelf: isMine ? 'flex-end' : 'flex-start',
                          }}
                        >
                          {msg.timestamp}
                        </AppText>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}

            {/* Input Bar */}
            <View
              style={[
                styles.chatInputBar,
                {
                  paddingBottom: Math.max(insets.bottom, 12),
                  backgroundColor: colors.cardBg,
                  borderTopColor: colors.cardBorder,
                },
              ]}
            >
              <TextInput
                style={[
                  styles.chatInput,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                    color: colors.text.primary,
                    borderColor: colors.cardBorder,
                  },
                ]}
                placeholder="Type your message..."
                placeholderTextColor={colors.text.muted}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSendMessage}
                returnKeyType="send"
              />

              <TouchableOpacity
                onPress={handleSendMessage}
                disabled={!inputText.trim()}
                style={[
                  styles.sendBtn,
                  { backgroundColor: inputText.trim() ? '#7C3AED' : 'rgba(124, 58, 237, 0.4)' },
                ]}
              >
                <AppText style={styles.sendIcon}>➤</AppText>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    paddingRight: 12,
  },
  backIcon: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerTitleCol: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactsScroll: {
    flex: 1,
  },
  contactsScrollContent: {
    padding: SPACING.lg,
    gap: 10,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: 12,
  },
  contactInfoCol: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  contactTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  chatContainer: {
    flex: 1,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    padding: SPACING.lg,
    gap: 12,
  },
  msgBubbleWrapper: {
    width: '100%',
    flexDirection: 'row',
  },
  myMsgWrapper: {
    justifyContent: 'flex-end',
  },
  theirMsgWrapper: {
    justifyContent: 'flex-start',
  },
  msgBubble: {
    maxWidth: '80%',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
  },
  myBubble: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    borderBottomLeftRadius: 4,
  },
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderTopWidth: 1,
    gap: 10,
  },
  chatInput: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default ParentCommunicationModal;
