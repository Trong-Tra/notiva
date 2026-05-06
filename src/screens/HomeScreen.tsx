import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useApp } from '../context/AppContext';
import { storage } from '../storage/storage';
import { colors } from '../constants/colors';
import { isOverdue, isToday } from '../utils/helpers';
import { HomeScreenNavigationProp } from '../types/navigation';
import PieChart from '../components/PieChart';

export default function HomeScreen({ navigation }: { navigation: HomeScreenNavigationProp }) {
  const { space, boards, getStats, getAllCardsWithDueDates, loadMockData } = useApp();
  const stats = getStats();
  const dueCards = getAllCardsWithDueDates();
  const todayCards = dueCards.filter((c) => isToday(c.dueDate) && !c.isCompleted);
  const overdueCards = dueCards.filter((c) => isOverdue(c.dueDate) && !c.isCompleted);
  const recentBoards = [...boards].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);

  const chartData = [
    { value: stats.completedCards, color: colors.success, label: 'Done' },
    { value: stats.overdueCards, color: colors.error, label: 'Late' },
    { value: Math.max(0, stats.totalCards - stats.completedCards - stats.overdueCards), color: colors.primary, label: 'Current' },
  ].filter((d) => d.value > 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.welcome}>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.spaceName}>{space?.name || 'Your Workspace'}</Text>
        </View>

        <View style={styles.overviewCard}>
          <View style={styles.overviewLeft}>
            {stats.totalCards > 0 ? (
              <PieChart data={chartData} />
            ) : (
              <View style={styles.emptyChart}>
                <Text style={styles.emptyChartText}>No tasks</Text>
              </View>
            )}
          </View>
          <View style={styles.overviewRight}>
            <View style={styles.overviewRow}>
              <View style={[styles.overviewDot, { backgroundColor: colors.success }]} />
              <Text style={styles.overviewLabel}>Done</Text>
              <Text style={styles.overviewValue}>{stats.completedCards}</Text>
            </View>
            <View style={styles.overviewRow}>
              <View style={[styles.overviewDot, { backgroundColor: colors.error }]} />
              <Text style={styles.overviewLabel}>Late</Text>
              <Text style={styles.overviewValue}>{stats.overdueCards}</Text>
            </View>
            <View style={styles.overviewRow}>
              <View style={[styles.overviewDot, { backgroundColor: colors.primary }]} />
              <Text style={styles.overviewLabel}>Current</Text>
              <Text style={styles.overviewValue}>{Math.max(0, stats.totalCards - stats.completedCards - stats.overdueCards)}</Text>
            </View>
            <View style={[styles.overviewRow, styles.overviewRowBorder]}>
              <View style={[styles.overviewDot, { backgroundColor: colors.textMuted }]} />
              <Text style={styles.overviewLabel}>Boards</Text>
              <Text style={styles.overviewValue}>{stats.totalBoards}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.table}>
            <TouchableOpacity style={styles.tableRow} onPress={() => navigation.navigate('SpaceTab', { screen: 'SpaceBoards' })}>
              <View>
                <Text style={styles.tableTitle}>Boards</Text>
                <Text style={styles.tableSubtitle}>View and manage your boards</Text>
              </View>
              <Text style={styles.tableArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.tableDivider} />
            <TouchableOpacity style={styles.tableRow} onPress={() => navigation.navigate('CalendarTab')}>
              <View>
                <Text style={styles.tableTitle}>Calendar</Text>
                <Text style={styles.tableSubtitle}>See tasks by due date</Text>
              </View>
              <Text style={styles.tableArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.tableDivider} />
            <TouchableOpacity style={styles.tableRow} onPress={() => navigation.navigate('NotificationsTab')}>
              <View>
                <Text style={styles.tableTitle}>Alerts</Text>
                <Text style={styles.tableSubtitle}>Upcoming and overdue tasks</Text>
              </View>
              <Text style={styles.tableArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.tableDivider} />
            <TouchableOpacity style={styles.tableRow} onPress={() => navigation.navigate('DashboardTab')}>
              <View>
                <Text style={styles.tableTitle}>Dashboard</Text>
                <Text style={styles.tableSubtitle}>Track your progress</Text>
              </View>
              <Text style={styles.tableArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {todayCards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Due Today</Text>
            {todayCards.slice(0, 3).map((card) => (
              <View key={card.id} style={styles.taskRow}>
                <View style={[styles.taskDot, { backgroundColor: colors.warning }]} />
                <Text style={styles.taskText} numberOfLines={1}>{card.title}</Text>
                <Text style={styles.taskBoard}>{(card as any).boardTitle}</Text>
              </View>
            ))}
          </View>
        )}

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
                  <Text style={styles.recentMeta}>{board.lists.length} lists · {board.lists.reduce((a, l) => a + l.cards.length, 0)} cards</Text>
                </View>
                <Text style={styles.recentArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() =>
              Alert.alert('Load Demo Data', 'This will replace all current data with sample boards, lists, and tasks.', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Load',
                  style: 'default',
                  onPress: async () => {
                    await loadMockData();
                  },
                },
              ])
            }
          >
            <Text style={styles.actionText}>Load Demo Data</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() =>
              Alert.alert('Reset App Data', 'This will wipe all boards, tasks, and settings. Are you sure?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Reset',
                  style: 'destructive',
                  onPress: async () => {
                    await storage.clearAll();
                    Alert.alert('Data Wiped', 'Please close and reopen the app to start fresh.');
                  },
                },
              ])
            }
          >
            <Text style={styles.resetText}>Reset App Data</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 20, paddingBottom: 40 },
  welcome: { marginBottom: 24 },
  greeting: { fontSize: 15, color: colors.textSecondary, fontWeight: '500' },
  spaceName: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, marginTop: 4, letterSpacing: -0.5 },
  overviewCard: { flexDirection: 'row', backgroundColor: '#F9FAFB', borderRadius: 16, borderWidth: 1, borderColor: '#F0F0F0', padding: 20, marginBottom: 28, alignItems: 'center' },
  overviewLeft: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  overviewRight: { flex: 1, paddingLeft: 16, gap: 12 },
  overviewRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  overviewRowBorder: { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 12, marginTop: 4 },
  overviewDot: { width: 10, height: 10, borderRadius: 5 },
  overviewLabel: { flex: 1, fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
  overviewValue: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  emptyChart: { width: 140, height: 140, borderRadius: 70, borderWidth: 4, borderColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  emptyChartText: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  table: { borderRadius: 12, borderWidth: 1, borderColor: '#F0F0F0', overflow: 'hidden' },
  tableRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff' },
  tableDivider: { height: 1, backgroundColor: '#F0F0F0', marginLeft: 16 },
  tableTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  tableSubtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  tableArrow: { fontSize: 20, color: colors.textMuted, fontWeight: '300' },
  taskRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#F0F0F0' },
  taskDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  taskText: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  taskBoard: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
  recentBoard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#F0F0F0' },
  recentColor: { width: 4, height: 36, borderRadius: 2, marginRight: 12 },
  recentInfo: { flex: 1 },
  recentTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  recentMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  recentArrow: { fontSize: 20, color: colors.textMuted, fontWeight: '300' },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 20, justifyContent: 'center' },
  actionBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  actionText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  resetText: { fontSize: 13, color: colors.error, fontWeight: '600' },
});
