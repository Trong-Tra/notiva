import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { colors, boardBackgroundColors } from '../constants/colors';

export default function BoardsScreen({ navigation }) {
  const { boards, createBoard, updateBoard, deleteBoard, toggleStarBoard } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState(boardBackgroundColors[0]);

  const starredBoards = boards.filter((b) => b.isStarred);
  const allBoards = boards.filter((b) => !b.isStarred);

  const openCreate = () => {
    setEditingBoard(null);
    setTitle('');
    setSelectedColor(boardBackgroundColors[0]);
    setModalVisible(true);
  };

  const openEdit = (board) => {
    setEditingBoard(board);
    setTitle(board.title);
    setSelectedColor(board.backgroundColor);
    setModalVisible(true);
  };

  const saveBoard = () => {
    if (!title.trim()) return;
    if (editingBoard) {
      updateBoard({ ...editingBoard, title: title.trim(), backgroundColor: selectedColor });
    } else {
      createBoard(title.trim(), selectedColor);
    }
    setModalVisible(false);
  };

  const confirmDelete = (board) => {
    Alert.alert('Delete Board', `Are you sure you want to delete "${board.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteBoard(board.id) },
    ]);
  };

  const renderBoardCard = (board, isSmall) => (
    <TouchableOpacity
      style={[
        styles.boardCard,
        isSmall && styles.boardCardSmall,
        { backgroundColor: board.backgroundColor },
      ]}
      onPress={() => navigation.navigate('BoardDetail', { boardId: board.id })}
      onLongPress={() => openEdit(board)}
      activeOpacity={0.85}
    >
      <View style={styles.boardCardContent}>
        <Text style={styles.boardTitle} numberOfLines={2}>
          {board.title}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.starBtn}
        onPress={() => toggleStarBoard(board.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={[styles.star, board.isStarred && styles.starActive]}>
          {board.isStarred ? '★' : '☆'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderCreateCard = (isSmall) => (
    <TouchableOpacity
      style={[styles.createCard, isSmall && styles.createCardSmall]}
      onPress={openCreate}
      activeOpacity={0.7}
    >
      <View style={styles.createCardInner}>
        <Text style={styles.createCardPlus}>+</Text>
        <Text style={styles.createCardText}>Create new board</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Boards</Text>
          <Text style={styles.headerSubtitle}>{boards.length} workspace{boards.length !== 1 ? 's' : ''}</Text>
        </View>
      </View>

      {boards.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Text style={styles.emptyIcon}>📋</Text>
          </View>
          <Text style={styles.emptyTitle}>Welcome to your workspace</Text>
          <Text style={styles.emptyDesc}>
            Boards keep your tasks organized. Create your first board to get started.
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={openCreate}>
            <Text style={styles.emptyButtonText}>Create Your First Board</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Starred Section */}
          {starredBoards.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⭐ Starred</Text>
              <FlatList
                data={starredBoards}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                renderItem={({ item }) => renderBoardCard(item, true)}
              />
            </View>
          )}

          {/* All Boards Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Your Boards</Text>
            <View style={styles.boardGrid}>
              {allBoards.map((board) => (
                <View key={board.id} style={styles.gridItem}>
                  {renderBoardCard(board, false)}
                </View>
              ))}
              <View key="create" style={styles.gridItem}>
                {renderCreateCard(false)}
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Create/Edit Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalDismiss} onPress={() => setModalVisible(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {editingBoard ? 'Edit Board' : 'Create Board'}
            </Text>

            <Text style={styles.inputLabel}>Board Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. University Project"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
              autoFocus
              maxLength={40}
            />

            <Text style={styles.inputLabel}>Background</Text>
            <View style={styles.colorGrid}>
              {boardBackgroundColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && <Text style={styles.colorCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              {editingBoard && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => {
                    setModalVisible(false);
                    confirmDelete(editingBoard);
                  }}
                >
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              )}
              <View style={styles.actionSpacer} />
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, !title.trim() && styles.primaryBtnDisabled]}
                onPress={saveBoard}
                disabled={!title.trim()}
              >
                <Text style={styles.primaryBtnText}>
                  {editingBoard ? 'Save' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const CARD_RADIUS = 12;
const GAP = 12;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  horizontalList: {
    gap: GAP,
    paddingRight: 20,
  },
  boardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  gridItem: {
    width: '47%',
    minWidth: 150,
  },
  boardCard: {
    borderRadius: CARD_RADIUS,
    height: 110,
    padding: 14,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  boardCardSmall: {
    width: 160,
    height: 100,
  },
  boardCardContent: {
    flex: 1,
  },
  boardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  starBtn: {
    alignSelf: 'flex-start',
  },
  star: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.5)',
  },
  starActive: {
    color: '#F2D600',
  },
  createCard: {
    borderRadius: CARD_RADIUS,
    height: 110,
    backgroundColor: '#F0F2F5',
    borderWidth: 2,
    borderColor: '#D0D5DD',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createCardSmall: {
    width: 160,
    height: 100,
  },
  createCardInner: {
    alignItems: 'center',
  },
  createCardPlus: {
    fontSize: 28,
    color: colors.textSecondary,
    fontWeight: '300',
    lineHeight: 32,
  },
  createCardText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E4E8EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalDismiss: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D0D5DD',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 20,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  colorCheck: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteBtn: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  deleteBtnText: {
    color: colors.error,
    fontSize: 15,
    fontWeight: '600',
  },
  actionSpacer: {
    flex: 1,
  },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  secondaryBtnText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  primaryBtnDisabled: {
    backgroundColor: '#A0C4E0',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
