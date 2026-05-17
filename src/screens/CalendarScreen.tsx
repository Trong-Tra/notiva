import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, SafeAreaView, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { formatDate, formatTime } from '../utils/helpers';
import { CalendarScreenProps } from '../types/navigation';
import { Card, Board, BoardList } from '../types';

interface MarkedDate {
  marked?: boolean;
  dotColor?: string;
  selected?: boolean;
  selectedColor?: string;
}

export default function CalendarScreen({ navigation }: CalendarScreenProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { boards, createCard } = useApp();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayTasks, setDayTasks] = useState<Card[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState<string>(boards[0]?.id || '');
  const [selectedListId, setSelectedListId] = useState<string>(boards[0]?.lists[0]?.id || '');
  const [boardPickerVisible, setBoardPickerVisible] = useState(false);
  const [listPickerVisible, setListPickerVisible] = useState(false);

  const selectedBoard = boards.find((b) => b.id === selectedBoardId);
  const selectedList = selectedBoard?.lists.find((l) => l.id === selectedListId);

  const { markedDates, allDueCards } = useMemo(() => {
    const marks: Record<string, MarkedDate> = {};
    const cards: (Card & { dateStr: string; boardTitle: string; listTitle: string })[] = [];

    boards.forEach((board) => {
      board.lists.forEach((list) => {
        list.cards.forEach((card) => {
          if (card.dueDate) {
            const dateStr = new Date(card.dueDate).toISOString().split('T')[0];
            marks[dateStr] = { marked: true, dotColor: card.isCompleted ? colors.success : colors.primary };
            cards.push({ ...card, dateStr, boardTitle: board.title, listTitle: list.title });
          }
        });
      });
    });

    if (selectedDate) {
      marks[selectedDate] = { ...(marks[selectedDate] || {}), selected: true, selectedColor: colors.primary };
    }

    return { markedDates: marks, allDueCards: cards };
  }, [boards, selectedDate, colors]);

  const onDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
    const tasks = allDueCards.filter((c) => c.dateStr === day.dateString);
    tasks.sort((a, b) => {
      if (a.hasTime && b.hasTime) return (a.dueDate || 0) - (b.dueDate || 0);
      if (a.hasTime) return -1;
      if (b.hasTime) return 1;
      return (a.dueDate || 0) - (b.dueDate || 0);
    });
    setDayTasks(tasks);
    setShowAddForm(false);
    setNewTaskTitle('');
    if (boards.length > 0) {
      setSelectedBoardId(boards[0].id);
      setSelectedListId(boards[0].lists[0]?.id || '');
    }
    setModalVisible(true);
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim() || !selectedBoardId || !selectedListId || !selectedDate) return;
    const dueTimestamp = new Date(selectedDate + 'T09:00:00').getTime();
    await createCard(selectedBoardId, selectedListId, newTaskTitle.trim(), dueTimestamp, false);
    setNewTaskTitle('');
    setShowAddForm(false);
    // Refresh tasks for this day
    const tasks = allDueCards.filter((c) => c.dateStr === selectedDate);
    setDayTasks(tasks);
  };

  const navigateToCard = (card: Card) => {
    setModalVisible(false);
    let foundListId = card.listId;
    let foundBoardId: string | null = null;
    boards.forEach((b) => {
      b.lists.forEach((l) => {
        if (l.cards.find((c) => c.id === card.id)) {
          foundBoardId = b.id;
          foundListId = l.id;
        }
      });
    });
    if (foundBoardId) {
      navigation.navigate('SpaceTab', {
        screen: 'CardDetail',
        params: { boardId: foundBoardId, listId: foundListId, cardId: card.id, fromTab: 'CalendarTab' },
      });
    }
  };

  const handleSelectBoard = (board: Board) => {
    setSelectedBoardId(board.id);
    setSelectedListId(board.lists[0]?.id || '');
    setBoardPickerVisible(false);
  };

  const handleSelectList = (list: BoardList) => {
    setSelectedListId(list.id);
    setListPickerVisible(false);
  };

  const renderTask = ({ item }: { item: Card }) => (
    <TouchableOpacity style={styles.taskCard} onPress={() => navigateToCard(item)}>
      <Text style={[styles.taskTitle, item.isCompleted && styles.completedText]}>
        {item.isCompleted ? '[Done] ' : ''}{item.title}
      </Text>
      <Text style={styles.taskMeta}>Board: {(item as any).boardTitle}</Text>
      {item.hasTime && <Text style={styles.taskTime}>Time: {formatTime(item.dueDate)}</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar</Text>
      </View>

      <Calendar
        style={styles.calendar}
        theme={{
          todayTextColor: colors.primary,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: colors.surface,
          arrowColor: colors.primary,
          monthTextColor: colors.textPrimary,
          textMonthFontWeight: 'bold',
          textDayFontSize: 14,
          textMonthFontSize: 16,
          calendarBackground: colors.surface,
          dayTextColor: colors.textPrimary,
          textDisabledColor: colors.textMuted,
          dotStyle: { width: 5, height: 5, borderRadius: 3 },
        }}
        markedDates={markedDates}
        onDayPress={onDayPress}
      />

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Due</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
          <Text style={styles.legendText}>Done</Text>
        </View>
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {selectedDate ? formatDate(new Date(selectedDate + 'T00:00:00').getTime()) : ''}
                  </Text>
                  <TouchableOpacity onPress={() => { setModalVisible(false); setShowAddForm(false); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close" size={22} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>

                {!showAddForm && (
                  <TouchableOpacity style={styles.addTaskBtn} onPress={() => setShowAddForm(true)}>
                    <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
                    <Text style={styles.addTaskText}>Add Task for This Day</Text>
                  </TouchableOpacity>
                )}

                {showAddForm && (
                  <View style={styles.addForm}>
                    <TextInput
                      style={styles.addInput}
                      placeholder="Task title"
                      placeholderTextColor={colors.textMuted}
                      value={newTaskTitle}
                      onChangeText={setNewTaskTitle}
                      autoFocus
                      maxLength={80}
                    />
                    <View style={styles.selectorRow}>
                      <TouchableOpacity style={styles.selector} onPress={() => setBoardPickerVisible(true)}>
                        <Text style={styles.selectorLabel}>Board</Text>
                        <Text style={styles.selectorValue} numberOfLines={1}>{selectedBoard?.title || 'Select'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.selector} onPress={() => setListPickerVisible(true)}>
                        <Text style={styles.selectorLabel}>List</Text>
                        <Text style={styles.selectorValue} numberOfLines={1}>{selectedList?.title || 'Select'}</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.addActions}>
                      <TouchableOpacity style={styles.addCancel} onPress={() => { setShowAddForm(false); setNewTaskTitle(''); }}>
                        <Text style={styles.addCancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.addConfirm, !newTaskTitle.trim() && styles.addConfirmDisabled]} onPress={handleCreateTask} disabled={!newTaskTitle.trim()}>
                        <Text style={styles.addConfirmText}>Create</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {dayTasks.length === 0 && !showAddForm ? (
                  <Text style={styles.emptyText}>No tasks for this day</Text>
                ) : (
                  <FlatList
                    data={dayTasks}
                    keyExtractor={(item) => item.id}
                    renderItem={renderTask}
                    contentContainerStyle={styles.taskList}
                    scrollEnabled={false}
                  />
                )}
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={boardPickerVisible} animationType="fade" transparent>
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerBox}>
            <Text style={styles.pickerTitle}>Select Board</Text>
            {boards.map((b) => (
              <TouchableOpacity key={b.id} style={[styles.pickerItem, selectedBoardId === b.id && styles.pickerItemActive]} onPress={() => handleSelectBoard(b)}>
                <View style={[styles.pickerDot, { backgroundColor: b.backgroundColor }]} />
                <Text style={[styles.pickerItemText, selectedBoardId === b.id && styles.pickerItemTextActive]}>{b.title}</Text>
                {selectedBoardId === b.id && <Ionicons name="checkmark" size={18} color={colors.primary} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.pickerCancel} onPress={() => setBoardPickerVisible(false)}>
              <Text style={styles.pickerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={listPickerVisible} animationType="fade" transparent>
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerBox}>
            <Text style={styles.pickerTitle}>Select List</Text>
            {selectedBoard?.lists.map((l) => (
              <TouchableOpacity key={l.id} style={[styles.pickerItem, selectedListId === l.id && styles.pickerItemActive]} onPress={() => handleSelectList(l)}>
                <Text style={[styles.pickerItemText, selectedListId === l.id && styles.pickerItemTextActive]}>{l.title}</Text>
                {selectedListId === l.id && <Ionicons name="checkmark" size={18} color={colors.primary} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.pickerCancel} onPress={() => setListPickerVisible(false)}>
              <Text style={styles.pickerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },
  calendar: { marginHorizontal: 10, marginTop: 10, borderRadius: 12, backgroundColor: colors.surface, paddingBottom: 10 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 13, color: colors.textMuted },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '75%', minHeight: 200 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  addTaskBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primaryLight, padding: 12, borderRadius: 10, marginBottom: 16 },
  addTaskText: { fontSize: 15, fontWeight: '600', color: colors.primary },
  addForm: { backgroundColor: colors.surfaceHover, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: colors.borderLight },
  addInput: { backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1, borderColor: colors.border, padding: 12, fontSize: 16, color: colors.textPrimary, marginBottom: 12 },
  selectorRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  selector: { flex: 1, backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1, borderColor: colors.border, padding: 10 },
  selectorLabel: { fontSize: 11, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  selectorValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  addActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  addCancel: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  addCancelText: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  addConfirm: { backgroundColor: colors.primary, paddingVertical: 8, paddingHorizontal: 18, borderRadius: 8 },
  addConfirmDisabled: { backgroundColor: colors.border },
  addConfirmText: { fontSize: 14, fontWeight: '600', color: colors.surface },
  emptyText: { textAlign: 'center', color: colors.textMuted, fontSize: 15, marginTop: 20 },
  taskList: { paddingBottom: 20 },
  taskCard: { backgroundColor: colors.surfaceHover, padding: 14, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: colors.borderLight },
  taskTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  completedText: { textDecorationLine: 'line-through', color: colors.textMuted },
  taskMeta: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  taskTime: { fontSize: 13, color: colors.primary, marginTop: 2 },
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  pickerBox: { backgroundColor: colors.surface, borderRadius: 12, padding: 20, width: '100%', maxWidth: 400 },
  pickerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 12 },
  pickerItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  pickerItemActive: { backgroundColor: colors.primaryLight, marginHorizontal: -12, paddingHorizontal: 12, borderRadius: 8, borderBottomWidth: 0 },
  pickerDot: { width: 10, height: 10, borderRadius: 5 },
  pickerItemText: { flex: 1, fontSize: 15, color: colors.textPrimary },
  pickerItemTextActive: { fontWeight: '600', color: colors.primary },
  pickerCancel: { marginTop: 12, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 24, backgroundColor: colors.background, borderRadius: 10 },
  pickerCancelText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
});
