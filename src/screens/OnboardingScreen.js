import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { colors, boardBackgroundColors } from '../constants/colors';

export default function OnboardingScreen({ navigation }) {
  const { createSpace, completeOnboarding, createBoard, createList, createCard, space } = useApp();
  const [step, setStep] = useState(1);
  const [spaceName, setSpaceName] = useState('');
  const [boardTitle, setBoardTitle] = useState('');
  const [boardColor, setBoardColor] = useState(boardBackgroundColors[0]);
  const [taskTitle, setTaskTitle] = useState('');

  const handleSpaceSubmit = () => {
    if (!spaceName.trim()) return;
    createSpace(spaceName.trim());
    setStep(2);
  };

  const handleBoardSubmit = () => {
    if (!boardTitle.trim()) return;
    createBoard(boardTitle.trim(), boardColor);
    setStep(3);
  };

  const handleTaskSubmit = async () => {
    const board = createBoard(boardTitle.trim() || 'My First Board', boardColor);
    const list = createList(board.id, 'To Do');
    if (taskTitle.trim()) {
      await createCard(board.id, list.id, taskTitle.trim());
    }
    await completeOnboarding();
  };

  const handleSkip = async () => {
    createSpace(spaceName.trim() || 'My Workspace');
    await completeOnboarding();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Progress dots */}
          <View style={styles.progress}>
            {[1, 2, 3].map((s) => (
              <View key={s} style={[styles.dot, step === s && styles.dotActive]} />
            ))}
          </View>

          {step === 1 && (
            <View style={styles.step}>
              <Text style={styles.emoji}>🚀</Text>
              <Text style={styles.title}>Welcome aboard</Text>
              <Text style={styles.subtitle}>
                Let's set up your workspace. What should we call it?
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Acme Inc, University, Personal"
                placeholderTextColor={colors.textMuted}
                value={spaceName}
                onChangeText={setSpaceName}
                autoFocus
                maxLength={30}
              />
              <TouchableOpacity
                style={[styles.button, !spaceName.trim() && styles.buttonDisabled]}
                onPress={handleSpaceSubmit}
                disabled={!spaceName.trim()}
              >
                <Text style={styles.buttonText}>Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
                <Text style={styles.skipText}>Skip for now</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View style={styles.step}>
              <Text style={styles.emoji}>📋</Text>
              <Text style={styles.title}>Create your first board</Text>
              <Text style={styles.subtitle}>
                Boards help you organize tasks. Give your first one a name.
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Project Alpha, Homework, Shopping"
                placeholderTextColor={colors.textMuted}
                value={boardTitle}
                onChangeText={setBoardTitle}
                autoFocus
                maxLength={30}
              />
              <Text style={styles.label}>Accent color</Text>
              <View style={styles.colorRow}>
                {boardBackgroundColors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorDot,
                      { backgroundColor: color },
                      boardColor === color && styles.colorDotActive,
                    ]}
                    onPress={() => setBoardColor(color)}
                  />
                ))}
              </View>
              <TouchableOpacity
                style={[styles.button, !boardTitle.trim() && styles.buttonDisabled]}
                onPress={handleBoardSubmit}
                disabled={!boardTitle.trim()}
              >
                <Text style={styles.buttonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 3 && (
            <View style={styles.step}>
              <Text style={styles.emoji}>✅</Text>
              <Text style={styles.title}>Add your first task</Text>
              <Text style={styles.subtitle}>
                What is the first thing you need to get done?
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Finish assignment, Buy groceries"
                placeholderTextColor={colors.textMuted}
                value={taskTitle}
                onChangeText={setTaskTitle}
                autoFocus
                maxLength={40}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={handleTaskSubmit}
              >
                <Text style={styles.buttonText}>
                  {taskTitle.trim() ? 'Get Started' : 'Skip & Get Started'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 40,
  },
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 48,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  step: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 56,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  input: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 20,
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 10,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
    alignSelf: 'flex-start',
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorDotActive: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#A0C4E0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  skipBtn: {
    marginTop: 16,
    padding: 8,
  },
  skipText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
});
