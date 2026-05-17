import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { storage } from '../storage/storage';
import { colors } from '../constants/colors';
import { isOverdue, isToday } from '../utils/helpers';
import { HomeScreenNavigationProp } from '../types/navigation';
import { Board, Card, BoardList } from '../types';
import PieChart from '../components/PieChart';

type SearchResult =
  | { type: 'board'; item: Board }
  | { type: 'list'; item: BoardList; board: Board }
  | { type: 'card'; item: Card; board: Board; list: BoardList };

export default function HomeScreen({ navigation }: { navigation: HomeScreenNavigationProp }) {
  const { space, boards, getStats, getAllCardsWithDueDates, loadMockData } = useApp();
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
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

  const searchResults = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const results: SearchResult[] = [];

    boards.forEach((board) => {
      if (board.title.toLowerCase().includes(q)) {
        results.push({ type: 'board', item: board });
      }
      board.lists.forEach((list) => {
        if (list.title.toLowerCase().includes(q)) {
          results.push({ type: 'list', item: list, board });
        }
        list.cards.forEach((card) => {
          if (card.title.toLowerCase().includes(q) || card.description.toLowerCase().includes(q)) {
            results.push({ type: 'card', item: card, board, list });
          }
        });
      });
    });

    return results.slice(0, 20);
  }, [query, boards]);

  const navigateToResult = (result: SearchResult) => {
    setQuery('');
    setSearchFocused(false);
    if (result.type === 'board') {
      navigation.navigate('SpaceTab', { screen: 'BoardDetail', params: { boardId: result.item.id } });
    } else if (result.type === 'list') {
      navigation.navigate('SpaceTab', { screen: 'BoardDetail', params: { boardId: result.board.id } });
    } else {
      navigation.navigate('SpaceTab', {
        screen: 'CardDetail',
        params: { boardId: result.board.id, listId: result.list.id, cardId: result.item.id, fromTab: 'HomeTab' },
      });
    }
  };

  const renderResult = (result: SearchResult, index: number) => {
    const isLast = index === searchResults.length - 1;
    if (result.type === 'board') {
      return (
        <TouchableOpacity key={`b-${result.item.id}`} style={[styles.resultRow, isLast && styles.resultRowLast]} onPress={() => navigateToResult(result)}>
          <View style={[styles.resultIcon, { backgroundColor: result.item.backgroundColor }]} />
          <View style={styles.resultBody}>
            <Text style={styles.resultTitle}>{result.item.title}</Text>
            <Text style={styles.resultMeta}>Board · {result.item.lists.length} lists</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      );
    }
    if (result.type === 'list') {
      return (
        <TouchableOpacity key={`l-${result.item.id}`} style={[styles.resultRow, isLast && styles.resultRowLast]} onPress={() => navigateToResult(result)}>
          <View style={[styles.resultIcon, { backgroundColor: '#E5E7EB' }]}>
            <Ionicons name="list-outline" size={14} color={colors.textSecondary} />
          </View>
          <View style={styles.resultBody}>
            <Text style={styles.resultTitle}>{result.item.title}</Text>
            <Text style={styles.resultMeta}>List in {result.board.title}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity key={`c-${result.item.id}`} style={[styles.resultRow, isLast && styles.resultRowLast]} onPress={() => navigateToResult(result)}>
        <View style={[styles.resultIcon, { backgroundColor: result.item.isCompleted ? colors.success : colors.primary }]}>
          <Ionicons name={result.item.isCompleted ? 'checkmark' : 'document-text-outline'} size={14} color="#fff" />
        </View>
        <View style={styles.resultBody}>
          <Text style={[styles.resultTitle, result.item.isCompleted && styles.resultTitleDone]}>{result.item.title}</Text>
          <Text style={styles.resultMeta}>Card in {result.list.title} · {result.board.title}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.welcome}>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.spaceName}>{space?.name || 'Your Workspace'}</Text>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search boards, lists, cards..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {query.trim().length > 0 && (
          <View style={[styles.section, { marginBottom: 16 }]}>
            <Text style={styles.sectionTitle}>
              {searchResults.length > 0 ? `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}` : 'No results'}
            </Text>
            {searchResults.length > 0 ? (
              <View style={styles.resultsBox}>
                {searchResults.map((r, i) => renderResult(r, i))}
              </View>
            ) : (
              <View style={styles.emptyResults}>
                <Ionicons name="search" size={28} color="#D1D5DB" />
                <Text style={styles.emptyResultsText}>No matches found</Text>
              </View>
            )}
          </View>
        )}

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
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
            <View style={styles.tableDivider} />
            <TouchableOpacity style={styles.tableRow} onPress={() => navigation.navigate('CalendarTab')}>
              <View>
                <Text style={styles.tableTitle}>Calendar</Text>
                <Text style={styles.tableSubtitle}>See tasks by due date</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
            <View style={styles.tableDivider} />
            <TouchableOpacity style={styles.tableRow} onPress={() => navigation.navigate('NotificationsTab')}>
              <View>
                <Text style={styles.tableTitle}>Alerts</Text>
                <Text style={styles.tableSubtitle}>Upcoming and overdue tasks</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
            <View style={styles.tableDivider} />
            <TouchableOpacity style={styles.tableRow} onPress={() => navigation.navigate('DashboardTab')}>
              <View>
                <Text style={styles.tableTitle}>Dashboard</Text>
                <Text style={styles.tableSubtitle}>Track your progress</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
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
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
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
  welcome: { marginBottom: 20 },
  greeting: { fontSize: 15, color: colors.textSecondary, fontWeight: '500' },
  spaceName: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, marginTop: 4, letterSpacing: -0.5 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#F0F0F0', paddingHorizontal: 14, paddingVertical: 10, marginBottom: 20 },
  searchInput: { flex: 1, fontSize: 15, color: colors.textPrimary, paddingVertical: 2 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  resultsBox: { borderRadius: 12, borderWidth: 1, borderColor: '#F0F0F0', overflow: 'hidden' },
  resultRow: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  resultRowLast: { borderBottomWidth: 0 },
  resultIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  resultBody: { flex: 1 },
  resultTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  resultTitleDone: { textDecorationLine: 'line-through', color: colors.textMuted },
  resultMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  emptyResults: { alignItems: 'center', paddingVertical: 30 },
  emptyResultsText: { fontSize: 14, color: colors.textMuted, marginTop: 8, fontWeight: '500' },
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
  table: { borderRadius: 12, borderWidth: 1, borderColor: '#F0F0F0', overflow: 'hidden' },
  tableRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff' },
  tableDivider: { height: 1, backgroundColor: '#F0F0F0', marginLeft: 16 },
  tableTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  tableSubtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  taskRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#F0F0F0' },
  taskDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  taskText: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  taskBoard: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
  recentBoard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 14, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#F0F0F0' },
  recentColor: { width: 4, height: 36, borderRadius: 2, marginRight: 12 },
  recentInfo: { flex: 1 },
  recentTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  recentMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 20, justifyContent: 'center' },
  actionBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  actionText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  resetText: { fontSize: 13, color: colors.error, fontWeight: '600' },
});
