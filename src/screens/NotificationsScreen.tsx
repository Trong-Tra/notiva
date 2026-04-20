import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../constants/colors';
import { formatDate, isOverdue, isToday } from '../utils/helpers';
import { NotificationsScreenProps } from '../types/navigation';
import { Board, Card } from '../types';

export default function NotificationsScreen({ navigation }: NotificationsScreenProps) {
  const { boards, getAllCardsWithDueDates } = useApp();
  const dueCards = getAllCardsWithDueDates();
  const overdue = dueCards.filter((c) => isOverdue(c.dueDate) && !c.isCompleted);
  const today = dueCards.filter((c) => isToday(c.dueDate) && !c.isCompleted);
  const upcoming = dueCards.filter((c) => !c.isCompleted && c.dueDate && c.dueDate > Date.now() && !isToday(c.dueDate));

  const findCardLocation = (cardId: string) => {
    for (const board of boards) {
      for (const list of board.lists) {
        const card = list.cards.find((c) => c.id === cardId);
        if (card) return { boardId: board.id, listId: list.id, card };
      }
    }
    return null;
  };

  const openCard = (cardId: string) => {
    const loc = findCardLocation(cardId);
    if (loc) {
      navigation.navigate('SpaceTab', {
        screen: 'CardDetail',
        params: { boardId: loc.boardId, listId: loc.listId, cardId: loc.card.id },
      });
    }
  };

  const Section = ({ title, items, accentColor }: { title: string; items: Card[]; accentColor: string }) => {
    if (items.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{title}</Text>
        {items.map((card) => (
          <TouchableOpacity key={card.id} style={styles.row} onPress={() => openCard(card.id)}>
            <View style={[styles.dot, { backgroundColor: accentColor }]} />
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle} numberOfLines={1}>{card.title}</Text>
              <Text style={styles.rowMeta}>
                {(card as any).boardTitle} · {formatDate(card.dueDate)}
              </Text>
            </View>
            <Text style={styles.rowArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Text style={styles.headerSub}>{overdue.length + today.length} require attention</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {overdue.length === 0 && today.length === 0 && upcoming.length === 0 && (
          <View style={styles.empty}>
            <View style={styles.emptyCircle}><Text style={styles.emptyCircleText}>!</Text></View>
            <Text style={styles.emptyTitle}>All caught up</Text>
            <Text style={styles.emptyText}>No upcoming deadlines right now.</Text>
          </View>
        )}

        <Section title="Overdue" items={overdue} accentColor={colors.error} />
        <Section title="Due Today" items={today} accentColor={colors.warning} />
        <Section title="Upcoming" items={upcoming.slice(0, 10)} accentColor={colors.primary} />

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },
  headerSub: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  scroll: { padding: 20, paddingBottom: 40 },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#F0F0F0' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  rowMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  rowArrow: { fontSize: 18, color: colors.textMuted, fontWeight: '300', marginLeft: 8 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyCircleText: { fontSize: 28, fontWeight: '800', color: colors.primary },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  emptyText: { fontSize: 14, color: colors.textMuted },
});
