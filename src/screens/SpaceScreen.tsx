import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, Alert, SafeAreaView } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors, boardBackgroundColors } from '../constants/colors';
import { SpaceScreenProps } from '../types/navigation';

export default function SpaceScreen({ navigation }: SpaceScreenProps) {
  const { space, boards, createBoard, updateBoard, deleteBoard, toggleStarBoard } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBoard, setEditingBoard] = useState<ReturnType<typeof createBoard> | null>(null);
  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState(boardBackgroundColors[0]);

  const starredBoards = boards.filter((b) => b.isStarred);
  const allBoards = [...boards].sort((a, b) => b.createdAt - a.createdAt);

  const openCreate = () => {
    setEditingBoard(null);
    setTitle('');
    setSelectedColor(boardBackgroundColors[0]);
    setModalVisible(true);
  };

  const openEdit = (board: ReturnType<typeof createBoard>) => {
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

  const confirmDelete = (board: ReturnType<typeof createBoard>) => {
    Alert.alert('Delete Board', `Delete "${board.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteBoard(board.id) },
    ]);
  };

  const renderBoardCard = (board: ReturnType<typeof createBoard>) => (
    <TouchableOpacity
      style={styles.boardCard}
      onPress={() => navigation.navigate('BoardDetail', { boardId: board.id })}
      onLongPress={() => openEdit(board)}
      activeOpacity={0.8}
    >
      <View style={[styles.cardTop, { backgroundColor: board.backgroundColor }]} />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>{board.title}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardMeta}>
            {board.lists.length} list{board.lists.length !== 1 ? 's' : ''} · {board.lists.reduce((a, l) => a + l.cards.length, 0)} card{board.lists.reduce((a, l) => a + l.cards.length, 0) !== 1 ? 's' : ''}
          </Text>
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation(); toggleStarBoard(board.id); }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.star, board.isStarred && styles.starActive]}>{board.isStarred ? '★' : '☆'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{space?.name || 'Space'}</Text>
        <TouchableOpacity style={styles.newBtn} onPress={openCreate}>
          <Text style={styles.newBtnText}>+ New Board</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {starredBoards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Starred</Text>
            <View style={styles.grid}>
              {starredBoards.map((board) => (
                <View key={board.id} style={styles.gridItem}>{renderBoardCard(board)}</View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>All Boards</Text>
          {allBoards.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No boards yet</Text>
              <Text style={styles.emptyText}>Create your first board to start organizing work.</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={openCreate}>
                <Text style={styles.emptyBtnText}>Create Board</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.grid}>
              {allBoards.map((board) => (
                <View key={board.id} style={styles.gridItem}>{renderBoardCard(board)}</View>
              ))}
              <TouchableOpacity style={[styles.gridItem, styles.createTile]} onPress={openCreate}>
                <View style={styles.createTileInner}>
                  <Text style={styles.createTilePlus}>+</Text>
                  <Text style={styles.createTileText}>New Board</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalDismiss} onPress={() => setModalVisible(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{editingBoard ? 'Edit Board' : 'New Board'}</Text>
            <Text style={styles.modalLabel}>Title</Text>
            <TextInput style={styles.modalInput} placeholder="Board name" placeholderTextColor="#9CA3AF" value={title} onChangeText={setTitle} autoFocus maxLength={40} />
            <Text style={styles.modalLabel}>Color</Text>
            <View style={styles.colorRow}>
              {boardBackgroundColors.map((color) => (
                <TouchableOpacity key={color} style={[styles.colorDot, { backgroundColor: color }, selectedColor === color && styles.colorDotActive]} onPress={() => setSelectedColor(color)} />
              ))}
            </View>
            <View style={styles.modalActions}>
              {editingBoard && (
                <TouchableOpacity onPress={() => { setModalVisible(false); confirmDelete(editingBoard); }}>
                  <Text style={styles.modalDelete}>Delete</Text>
                </TouchableOpacity>
              )}
              <View style={{ flex: 1 }} />
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalConfirm, !title.trim() && styles.modalConfirmDisabled]} onPress={saveBoard} disabled={!title.trim()}>
                <Text style={styles.modalConfirmText}>{editingBoard ? 'Save' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },
  newBtn: { backgroundColor: colors.primary, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  newBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  scroll: { padding: 20, paddingBottom: 40 },
  section: { marginBottom: 28 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '48%' },
  boardCard: { backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#F0F0F0', overflow: 'hidden' },
  cardTop: { height: 6, width: '100%' },
  cardBody: { padding: 14 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 10, minHeight: 40 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardMeta: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
  star: { fontSize: 16, color: '#D1D5DB' },
  starActive: { color: '#F59E0B' },
  createTile: { backgroundColor: '#FAFAFA', borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', borderStyle: 'dashed', minHeight: 90, justifyContent: 'center', alignItems: 'center' },
  createTileInner: { alignItems: 'center' },
  createTilePlus: { fontSize: 24, color: colors.textMuted, fontWeight: '300', marginBottom: 4 },
  createTileText: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  emptyText: { fontSize: 14, color: colors.textMuted, marginBottom: 20, textAlign: 'center' },
  emptyBtn: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  emptyBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalDismiss: { flex: 1 },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingBottom: 36, paddingTop: 10 },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 20 },
  modalLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 },
  modalInput: { backgroundColor: '#F9FAFB', borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, fontSize: 16, color: colors.textPrimary, marginBottom: 20 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  colorDot: { width: 36, height: 36, borderRadius: 18 },
  colorDotActive: { borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  modalActions: { flexDirection: 'row', alignItems: 'center' },
  modalDelete: { color: colors.error, fontSize: 15, fontWeight: '600' },
  modalCancel: { paddingVertical: 10, paddingHorizontal: 16, marginRight: 8 },
  modalCancelText: { color: colors.textMuted, fontSize: 15, fontWeight: '600' },
  modalConfirm: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 22, borderRadius: 10 },
  modalConfirmDisabled: { backgroundColor: '#D1D5DB' },
  modalConfirmText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
