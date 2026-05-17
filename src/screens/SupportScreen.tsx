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

export default function SupportScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), text: input.trim(), sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Auto-reply after a short delay
    setTimeout(() => {
      const replies = [
        'Thanks for reaching out! Our team will get back to you soon.',
        'Got it. Is there anything else I can help with?',
        'Thank you! We have received your message.',
      ];
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: replies[Math.floor(Math.random() * replies.length)],
        sender: 'bot',
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 800);
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
            <View style={styles.placeholderWrap}>
              <Text style={styles.placeholder}>ask notiva anything</Text>
            </View>
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
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={!input.trim()}>
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
    chatEmpty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    chatContent: { padding: 16, paddingBottom: 8 },
    placeholderWrap: { alignItems: 'center' },
    placeholder: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textMuted,
      opacity: 0.35,
      letterSpacing: 0.5,
    },
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
