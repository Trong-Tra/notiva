import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../constants/colors';
import { isOverdue, isToday } from '../utils/helpers';

export default function HomeScreen({ navigation }) {
  const { space, boards, getStats, getAllCardsWithDueDates } = useApp();
  const stats = getStats();
  const dueCards = getAllCardsWithDueDates();
  const todayCards = dueCards.filter((c) => isToday(c.dueDate) && !c.isCompleted);
  const overdueCards = dueCards.filter((c) => isOverdue(c.dueDate) && !c.isCompleted);
  const recentBoards = [...boards].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);

  const StatCard = ({ label, value, color }) => (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Welcome */}
        <View style={styles.welcome}>
          <Text style={styles.greeting}>Hello 👋</Text>
          <Text style={styles.spaceName}>{space?.name || 'Your Workspace'}</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard label="Boards" value={stats.totalBoards} color={colors.primary} />
          <StatCard label="Tasks" value={stats.totalCards} color={colors.textPrimary} />
          <StatCard label="Done" value={stats.completedCards} color={colors.success} />
          <StatCard label="Overdue" value={stats.overdueCards} color={colors.error} />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickGrid}>
            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: colors.primaryLight }]}
              onPress={() => navigation.navigate('SpaceTab', { screen: 'SpaceBoards' })}
            >
              <Text style={styles.quickIcon}>📋</Text>
              <Text style={styles.quickLabel}>My Boards</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: '#E3FCEF' }]}
              onPress={() => navigation.navigate('CalendarTab')}
            >
              <Text style={styles.quickIcon}>📅</Text>
              <Text style={styles.quickLabel}>Calendar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: '#FFEBE6' }]}
              onPress={() => navigation.navigate('NotificationsTab')}
            >
              <Text style={styles.quickIcon}>🔔</Text>
              <Text style={styles.quickLabel}>
                Alerts{overdueCards.length > 0 ? ` (${overdueCards.length})` : ''}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickCard, { backgroundColor: '#EAE6FF' }]}
              onPress={() => navigation.navigate('DashboardTab')}
            >
              <Text style={styles.quickIcon}>📊</Text>
              <Text style={styles.quickLabel}>Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Due Today */}
        {todayCards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Due Today</Text>
            {todayCards.slice(0, 3).map((card) => (
              <View key={card.id} style={styles.taskRow}>
                <View style={[styles.taskDot, { backgroundColor: colors.warning }]} />
                <Text style={styles.taskText} numberOfLines={1}>
                  {card.title}
                </Text>
                <Text style={styles.taskBoard}>{card.boardTitle}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Recent Boards */}
        {recentBoards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Boards</Text>
            {recentBoards.map((board) => (
              <TouchableOpacity
                key={board.id}
                style={styles.recentBoard}
                onPress={() => navigation.navigate('SpaceTab', { screen: 'BoardDetail', params: { boardId: board.id } })}
              >
                <View style={[styles.recentColor, { backgroundColor: board.backgroundColor }]} />
                <View style={styles.recentInfo}>
                  <Text style={styles.recentTitle}>{board.title}</Text>
                  <Text style={styles.recentMeta}>
                    {board.lists.length} lists · {board.lists.reduce((a, l) => a + l.cards.length, 0)} cards
                  </Text>
                </View>
                <Text style={styles.recentArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  welcome: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  spaceName: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4,
    letterSpacing: -0.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickCard: {
    width: '47%',
    minWidth: 140,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  quickLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  taskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  taskText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  taskBoard: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  recentBoard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  recentColor: {
    width: 4,
    height: 36,
    borderRadius: 2,
    marginRight: 12,
  },
  recentInfo: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  recentMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  recentArrow: {
    fontSize: 20,
    color: colors.textMuted,
    fontWeight: '300',
  },
});
