import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../constants/colors';
import { isOverdue, isToday } from '../utils/helpers';

export default function DashboardScreen() {
  const { space, boards, getStats, getAllCardsWithDueDates } = useApp();
  const stats = getStats();
  const dueCards = getAllCardsWithDueDates();
  const todayCount = dueCards.filter((c) => isToday(c.dueDate) && !c.isCompleted).length;
  const overdueCount = dueCards.filter((c) => isOverdue(c.dueDate) && !c.isCompleted).length;
  const upcomingCount = dueCards.filter(
    (c) => !c.isCompleted && c.dueDate > Date.now() && !isToday(c.dueDate)
  ).length;

  const completionRate = stats.totalCards > 0
    ? Math.round((stats.completedCards / stats.totalCards) * 100)
    : 0;

  const StatRow = ({ label, value, color }) => (
    <View style={styles.statRow}>
      <View style={[styles.statDot, { backgroundColor: color }]} />
      <Text style={styles.statRowLabel}>{label}</Text>
      <Text style={[styles.statRowValue, { color }]}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSub}>{space?.name || 'Workspace'}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Big completion circle */}
        <View style={styles.completionCard}>
          <View style={styles.circle}>
            <Text style={styles.circlePercent}>{completionRate}%</Text>
            <Text style={styles.circleLabel}>Done</Text>
          </View>
          <View style={styles.circleMeta}>
            <Text style={styles.circleMetaText}>
              {stats.completedCards} of {stats.totalCards} tasks completed
            </Text>
          </View>
        </View>

        {/* Task breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Task Breakdown</Text>
          <View style={styles.card}>
            <StatRow label="Due Today" value={todayCount} color={colors.warning} />
            <StatRow label="Overdue" value={overdueCount} color={colors.error} />
            <StatRow label="Upcoming" value={upcomingCount} color={colors.primary} />
            <StatRow label="Completed" value={stats.completedCards} color={colors.success} />
          </View>
        </View>

        {/* Boards overview */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Boards</Text>
          <View style={styles.card}>
            {boards.length === 0 ? (
              <Text style={styles.emptyText}>No boards yet</Text>
            ) : (
              boards.map((board) => {
                const cardCount = board.lists.reduce((a, l) => a + l.cards.length, 0);
                const doneCount = board.lists.reduce(
                  (a, l) => a + l.cards.filter((c) => c.isCompleted).length,
                  0
                );
                const pct = cardCount > 0 ? Math.round((doneCount / cardCount) * 100) : 0;
                return (
                  <View key={board.id} style={styles.boardRow}>
                    <View style={[styles.boardRowDot, { backgroundColor: board.backgroundColor }]} />
                    <Text style={styles.boardRowTitle} numberOfLines={1}>{board.title}</Text>
                    <View style={styles.boardRowBar}>
                      <View style={[styles.boardRowFill, { width: `${pct}%`, backgroundColor: board.backgroundColor }]} />
                    </View>
                    <Text style={styles.boardRowPct}>{pct}%</Text>
                  </View>
                );
              })
            )}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
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
  headerSub: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  scroll: { padding: 20, paddingBottom: 40 },
  completionCard: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 24,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  circlePercent: { fontSize: 32, fontWeight: '800', color: colors.primary },
  circleLabel: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  circleMeta: { marginTop: 4 },
  circleMetaText: { fontSize: 14, color: colors.textSecondary },
  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  card: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#F0F0F0' },
  statRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  statDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  statRowLabel: { flex: 1, fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
  statRowValue: { fontSize: 16, fontWeight: '700' },
  emptyText: { color: colors.textMuted, fontSize: 14, textAlign: 'center', paddingVertical: 10 },
  boardRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  boardRowDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  boardRowTitle: { width: 100, fontSize: 14, color: colors.textPrimary, fontWeight: '600' },
  boardRowBar: { flex: 1, height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, marginHorizontal: 10 },
  boardRowFill: { height: 6, borderRadius: 3 },
  boardRowPct: { width: 36, fontSize: 13, fontWeight: '700', color: colors.textSecondary, textAlign: 'right' },
});
