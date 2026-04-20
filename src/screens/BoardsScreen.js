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
  const allBoards = boards;

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

  const renderBoardCard = (board) => (
    <TouchableOpacity
      style={styles.boardCard}
      onPress={() => navigation.navigate('BoardDetail', { boardId: board.id })}
      onLongPress={() => openEdit(board)}
      activeOpacity={0.7}
    >
      <View style={[styles.colorStrip, { backgroundColor: board.backgroundColor }]} />
      <View style={styles.boardCardBody}>
        <Text style={styles.boardTitle} numberOfLines={2}>
          {board.title}
        </Text>
        <View style={styles.boardMeta}>
          <Text style={styles.boardMetaText}>
            {board.lists.length} list{board.lists.length !== 1 ? 's' : ''} ·{' '}
            {board.lists.reduce((acc, l) => acc + l.cards.length, 0)} card
            {board.lists.reduce((acc, l) => acc + l.cards.length, 0) !== 1 ? 's' : ''}
          </Text>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              toggleStarBoard(board.id);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.star, board.isStarred && styles.starActive]}>
              {board.isStarred ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Boards</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={openCreate}>
          <Text style={styles.headerBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {boards.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No boards yet</Text>
            <Text style={styles.emptyDesc}>
              Create a board to start organizing your tasks and projects.
            </Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={openCreate}>
              <Text style={styles.emptyBtnText}>Create Board</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {starredBoards.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Starred</Text>
              <FlatList
                data={starredBoards}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                renderItem={({ item }) => (
                  <View style={styles.horizontalItem}>{renderBoardCard(item)}</View>
                )}
              />
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>All Boards</Text>
            {allBoards.map((board) => (
              <View key={board.id} style={styles.listItem}>
                {renderBoardCard(board)}
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.footerCreate} onPress={openCreate}>
            <Text style={styles.footerCreatePlus}>+</Text>
            <Text style={styles.footerCreateText}>Create new board</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <Modal visible={modalVisible} animationType="fade" transparent statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalDismiss} onPress={() => setModalVisible(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {editingBoard ? 'Edit Board' : 'New Board'}
            </Text>

            <Text style={styles.modalLabel}>Title</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Board name"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
              autoFocus
              maxLength={40}
            />

            <Text style={styles.modalLabel}>Accent Color</Text>
            <View style={styles.colorRow}>
              {boardBackgroundColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorDot,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorDotActive,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>

            <View style={styles.modalActions}>
              {editingBoard && (
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    confirmDelete(editingBoard);
                  }}
                >
                  <Text style={styles.modalDelete}>Delete</Text>
                </TouchableOpacity>
              )}
              <View style={{ flex: 1 }} />
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirm, !title.trim() && styles.modalConfirmDisabled]}
                onPress={saveBoard}
                disabled={!title.trim()}
              >
                <Text style={styles.modalConfirmText}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  headerBtn: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  headerBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  horizontalList: {
    paddingRight: 20,
    gap: 12,
  },
  horizontalItem: {
    width: 280,
  },
  listItem: {
    marginBottom: 10,
  },
  boardCard: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  colorStrip: {
    width: 5,
  },
  boardCardBody: {
    flex: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  boardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  boardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  boardMetaText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  star: {
    fontSize: 18,
    color: '#D1D5DB',
  },
  starActive: {
    color: '#F59E0B',
  },
  footerCreate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginTop: 4,
  },
  footerCreatePlus: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: '300',
    marginRight: 8,
  },
  footerCreateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyBox: {
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyBtn: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  emptyBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalDismiss: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 10,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    fontSize: 16,
    color: '#111827',
    marginBottom: 20,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
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
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalDelete: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '600',
  },
  modalCancel: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  modalCancelText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '600',
  },
  modalConfirm: {
    backgroundColor: '#111827',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 10,
  },
  modalConfirmDisabled: {
    backgroundColor: '#D1D5DB',
  },
  modalConfirmText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
