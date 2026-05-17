import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

const FAQS = [
  {
    q: 'How do I create a board?',
    a: 'Go to the Space tab, tap "+ New Board", enter a title, pick a color, and hit Create.',
  },
  {
    q: 'How do I move a card?',
    a: 'Long-press any card in a board to open the action sheet. Choose "Move to Another List" or reorder with Move Up / Down.',
  },
  {
    q: 'How do notifications work?',
    a: 'When you set a due date on a card, Notiva schedules a local notification for 9 AM that day. It auto-cancels if you complete or delete the card.',
  },
  {
    q: 'How do I reset my data?',
    a: 'On the Home screen, scroll to the bottom and tap "Reset App Data". This wipes everything and restores the app to its initial state.',
  },
  {
    q: 'How do I enable dark mode?',
    a: 'On the Home screen, tap the moon icon in the top-right corner and toggle the switch. Your preference is saved automatically.',
  },
  {
    q: 'Can I search across all boards?',
    a: 'Yes! Use the search bar on the Home screen. It finds boards, lists, and cards by title in real time.',
  },
];

export default function SupportScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: Message = { id: Date.now().toString(), text: trimmed, sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    const faq = FAQS.find((f) => f.q === trimmed);
    const replyText = faq
      ? faq.a
      : "Thanks for reaching out! Our team will review your message and get back to you as soon as possible.";

    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: replyText,
        sender: 'bot',
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer Support</Text>
        <View style={{ width: 22 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          style={styles.chatArea}
          contentContainerStyle={messages.length === 0 ? styles.chatEmpty : styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 && (
            <>
              <Text style={styles.placeholder}>Ask Notiva Anything</Text>
              <View style={styles.faqWrap}>
                {FAQS.map((f, i) => (
                  <TouchableOpacity key={i} style={styles.faqChip} onPress={() => sendMessage(f.q)}>
                    <Text style={styles.faqText} numberOfLines={1}>{f.q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.bubble,
                msg.sender === 'user' ? styles.bubbleUser : styles.bubbleBot,
              ]}
            >
              <Text style={[styles.bubbleText, msg.sender === 'user' ? styles.bubbleTextUser : styles.bubbleTextBot]}>
                {msg.text}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={() => sendMessage(input)} disabled={!input.trim()}>
            <Ionicons name="send" size={18} color={input.trim() ? '#fff' : colors.textMuted} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
    chatArea: { flex: 1 },
    chatEmpty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
    chatContent: { padding: 16, paddingBottom: 8 },
    placeholder: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textMuted,
      opacity: 0.35,
      letterSpacing: 0.5,
      marginBottom: 20,
    },
    faqWrap: { width: '100%', gap: 8 },
    faqChip: {
      backgroundColor: colors.surfaceHover,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 10,
      paddingHorizontal: 14,
    },
    faqText: { fontSize: 14, fontWeight: '500', color: colors.textPrimary },
    bubble: {
      maxWidth: '80%',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 18,
      marginBottom: 10,
    },
    bubbleUser: {
      alignSelf: 'flex-end',
      backgroundColor: colors.primary,
      borderBottomRightRadius: 4,
    },
    bubbleBot: {
      alignSelf: 'flex-start',
      backgroundColor: colors.surfaceHover,
      borderBottomLeftRadius: 4,
    },
    bubbleText: { fontSize: 14, lineHeight: 20 },
    bubbleTextUser: { color: '#fff' },
    bubbleTextBot: { color: colors.textPrimary },
    inputBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
    },
    input: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: 15,
      color: colors.textPrimary,
      maxHeight: 100,
    },
    sendBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
