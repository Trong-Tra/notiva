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
} from 'react-native';
import { useApp } from '../context/AppContext';
import { colors, boardBackgroundColors } from '../constants/colors';

export default function BoardsScreen({ navigation }) {
  const { boards, createBoard, updateBoard, deleteBoard, toggleStarBoard } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState(boardBackgroundColors[0]);

  const sortedBoards = [...boards].sort((a, b) => {
    if (a.isStarred && !b.isStarred) return -1;
    if (!a.isStarred && b.isStarred) return 1;
    return b.createdAt - a.createdAt;
  });

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

  const renderBoard = ({ item }) => (
    <TouchableOpacity
      style={[styles.boardCard, { backgroundColor: item.backgroundColor }]}
      onPress={() => navigation.navigate('BoardDetail', { boardId: item.id })}
      onLongPress={() => openEdit(item)}
    >
      <View style={styles.boardHeader}>
        <Text style={styles.boardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <TouchableOpacity onPress={() => toggleStarBoard(item.id)}>
          <Text style={styles.star}>{item.isStarred ? '★' : '☆'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.boardActions}>
        <TouchableOpacity onPress={() => openEdit(item)}>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => confirmDelete(item)}>
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Boards</Text>
      {boards.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No boards yet. Create your first board!</Text>
        </View>
      ) : (
        <FlatList
          data={sortedBoards}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          renderItem={renderBoard}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={openCreate}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingBoard ? 'Edit Board' : 'Create Board'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Board title"
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
            <Text style={styles.label}>Background Color</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorRow}>
              {boardBackgroundColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorSelected,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.buttonSecondary} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonPrimary} onPress={saveBoard}>
                <Text style={styles.buttonPrimaryText}>
                  {editingBoard ? 'Save' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    padding: 16,
    paddingTop: 60,
  },
  list: {
    padding: 8,
  },
  boardCard: {
    flex: 1,
    margin: 8,
    padding: 12,
    borderRadius: 8,
    minHeight: 100,
    justifyContent: 'space-between',
  },
  boardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  boardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  star: {
    color: '#F2D600',
    fontSize: 20,
  },
  boardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '500',
  },
  deleteText: {
    color: '#FFD6D6',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    width: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: colors.textPrimary,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  colorRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: colors.textPrimary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  buttonSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  buttonSecondaryText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
