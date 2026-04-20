import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useApp } from '../context/AppContext';
import { colors } from '../constants/colors';
import { formatDate, formatTime } from '../utils/helpers';

export default function CalendarScreen({ navigation, route }) {
  const { boards } = useApp();
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayTasks, setDayTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const { markedDates, allDueCards } = useMemo(() => {
    const marks = {};
    const cards = [];

    boards.forEach((board) => {
      board.lists.forEach((list) => {
        list.cards.forEach((card) => {
          if (card.dueDate) {
            const dateStr = new Date(card.dueDate).toISOString().split('T')[0];
            marks[dateStr] = {
              marked: true,
              dotColor: card.isCompleted ? colors.success : colors.primary,
            };
            cards.push({
              ...card,
              dateStr,
              boardTitle: board.title,
              listTitle: list.title,
            });
          }
        });
      });
    });

    if (selectedDate) {
      marks[selectedDate] = {
        ...(marks[selectedDate] || {}),
        selected: true,
        selectedColor: colors.primary,
      };
    }

    return { markedDates: marks, allDueCards: cards };
  }, [boards, selectedDate]);

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
    const tasks = allDueCards.filter((c) => c.dateStr === day.dateString);
    tasks.sort((a, b) => {
      if (a.hasTime && b.hasTime) return a.dueDate - b.dueDate;
      if (a.hasTime) return -1;
      if (b.hasTime) return 1;
      return a.dueDate - b.dueDate;
    });
    setDayTasks(tasks);
    setModalVisible(true);
  };

  const navigateToCard = (card) => {
    setModalVisible(false);
    let foundListId = card.listId;
    let foundBoardId = null;
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
        params: { boardId: foundBoardId, listId: foundListId, cardId: card.id },
      });
    }
  };

  const renderTask = ({ item }) => (
    <TouchableOpacity style={styles.taskCard} onPress={() => navigateToCard(item)}>
      <Text style={[styles.taskTitle, item.isCompleted && styles.completedText]}>
        {item.isCompleted ? '✓ ' : ''}{item.title}
      </Text>
      <Text style={styles.taskMeta}>📋 {item.boardTitle}</Text>
      {item.hasTime && <Text style={styles.taskTime}>⏰ {formatTime(item.dueDate)}</Text>}
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
          selectedDayTextColor: '#fff',
          arrowColor: colors.primary,
          monthTextColor: colors.textPrimary,
          textMonthFontWeight: 'bold',
          textDayFontSize: 14,
          textMonthFontSize: 16,
          calendarBackground: '#fff',
          dayTextColor: colors.textPrimary,
          textDisabledColor: '#D1D5DB',
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDate ? formatDate(new Date(selectedDate + 'T00:00:00').getTime()) : ''}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
            {dayTasks.length === 0 ? (
              <Text style={styles.emptyText}>No tasks for this day</Text>
            ) : (
              <FlatList
                data={dayTasks}
                keyExtractor={(item) => item.id}
                renderItem={renderTask}
                contentContainerStyle={styles.taskList}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },
  calendar: {
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingBottom: 10,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 16,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 13, color: colors.textMuted },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
    minHeight: 200,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  closeText: { fontSize: 20, color: colors.textMuted, padding: 4 },
  emptyText: { textAlign: 'center', color: colors.textMuted, fontSize: 15, marginTop: 20 },
  taskList: { paddingBottom: 20 },
  taskCard: {
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  taskTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  completedText: { textDecorationLine: 'line-through', color: colors.textMuted },
  taskMeta: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  taskTime: { fontSize: 13, color: colors.primary, marginTop: 2 },
});
