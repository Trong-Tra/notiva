import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useApp } from '../context/AppContext';
import { colors } from '../constants/colors';
import { formatDate, isOverdue } from '../utils/helpers';

export default function BoardDetailScreen({ route, navigation }) {
  const { boardId } = route.params;
  const {
    getBoard,
    createList,
    updateList,
    deleteList,
    reorderLists,
    createCard,
    updateCard,
    deleteCard,
    moveCard,
    reorderCards,
  } = useApp();

  const board = getBoard(boardId);
  const [listModalVisible, setListModalVisible] = useState(false);
  const [listTitle, setListTitle] = useState('');
  const [editingListId, setEditingListId] = useState(null);
  const [cardModalVisible, setCardModalVisible] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const [activeListId, setActiveListId] = useState(null);
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [cardToMove, setCardToMove] = useState(null);
  const [editingCardId, setEditingCardId] = useState(null);

  const scrollRef = useRef(null);

  if (!board) {
    return (
      <View style={styles.container}>
        <Text>Board not found</Text>
      </View>
    );
  }

  const openListModal = (listId = null) => {
    setEditingListId(listId);
    setListTitle(listId ? board.lists.find((l) => l.id === listId)?.title || '' : '');
    setListModalVisible(true);
  };

  const saveList = () => {
    if (!listTitle.trim()) return;
    if (editingListId) {
      const list = board.lists.find((l) => l.id === editingListId);
      updateList(boardId, { ...list, title: listTitle.trim() });
    } else {
      createList(boardId, listTitle.trim());
    }
    setListModalVisible(false);
    setListTitle('');
  };

  const confirmDeleteList = (listId) => {
    const list = board.lists.find((l) => l.id === listId);
    Alert.alert('Delete List', `Delete "${list?.title}" and all its cards?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteList(boardId, listId) },
    ]);
  };

  const moveListLeft = (listId) => {
    const idx = board.lists.findIndex((l) => l.id === listId);
    if (idx <= 0) return;
    const newLists = [...board.lists];
    [newLists[idx - 1], newLists[idx]] = [newLists[idx], newLists[idx - 1]];
    reorderLists(boardId, newLists);
  };

  const moveListRight = (listId) => {
    const idx = board.lists.findIndex((l) => l.id === listId);
    if (idx < 0 || idx >= board.lists.length - 1) return;
    const newLists = [...board.lists];
    [newLists[idx], newLists[idx + 1]] = [newLists[idx + 1], newLists[idx]];
    reorderLists(boardId, newLists);
  };

  const openCardModal = (listId, card = null) => {
    setActiveListId(listId);
    setEditingCardId(card?.id || null);
    setCardTitle(card?.title || '');
    setCardModalVisible(true);
  };

  const saveCard = () => {
    if (!cardTitle.trim() || !activeListId) return;
    if (editingCardId) {
      const list = board.lists.find((l) => l.id === activeListId);
      const card = list.cards.find((c) => c.id === editingCardId);
      updateCard(boardId, activeListId, { ...card, title: cardTitle.trim() });
    } else {
      createCard(boardId, activeListId, cardTitle.trim());
    }
    setCardModalVisible(false);
    setCardTitle('');
  };

  const confirmDeleteCard = (listId, cardId) => {
    const list = board.lists.find((l) => l.id === listId);
    const card = list.cards.find((c) => c.id === cardId);
    Alert.alert('Delete Card', `Delete "${card?.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteCard(boardId, listId, cardId) },
    ]);
  };

  const openMoveModal = (listId, card) => {
    setCardToMove({ listId, card });
    setMoveModalVisible(true);
  };

  const executeMove = (targetListId) => {
    if (!cardToMove || targetListId === cardToMove.listId) {
      setMoveModalVisible(false);
      setCardToMove(null);
      return;
    }
    const targetList = board.lists.find((l) => l.id === targetListId);
    moveCard(boardId, cardToMove.listId, targetListId, cardToMove.card.id, targetList.cards.length);
    setMoveModalVisible(false);
    setCardToMove(null);
  };

  const renderCard = ({ item: card, drag, isActive }) => {
    const listId = card.listId;
    return (
      <TouchableOpacity
        style={[
          styles.card,
          isActive && styles.cardActive,
          card.isCompleted && styles.cardCompleted,
        ]}
        onLongPress={drag}
        onPress={() =>
          navigation.navigate('CardDetail', { boardId, listId, cardId: card.id })
        }
      >
        {card.labels?.length > 0 && (
          <View style={styles.labelRow}>
            {card.labels.map((label) => (
              <View key={label.id} style={[styles.labelDot, { backgroundColor: label.color }]} />
            ))}
          </View>
        )}
        <Text style={[styles.cardTitle, card.isCompleted && styles.cardTitleCompleted]}>
          {card.title}
        </Text>
        <View style={styles.cardFooter}>
          {card.dueDate && (
            <View style={[styles.dueBadge, isOverdue(card.dueDate) && styles.overdueBadge]}>
              <Text style={[styles.dueText, isOverdue(card.dueDate) && styles.overdueText]}>
                {formatDate(card.dueDate)}
              </Text>
            </View>
          )}
          {card.checklists?.length > 0 && (
            <Text style={styles.metaText}>
              {card.checklists.reduce((acc, cl) => acc + cl.items.filter((i) => i.isChecked).length, 0)}/
              {card.checklists.reduce((acc, cl) => acc + cl.items.length, 0)}
            </Text>
          )}
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={() => openCardModal(listId, card)}>
            <Text style={styles.cardActionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openMoveModal(listId, card)}>
            <Text style={styles.cardActionText}>Move</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => confirmDeleteCard(listId, card.id)}>
            <Text style={[styles.cardActionText, styles.deleteText]}>Del</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderList = (list) => (
    <View key={list.id} style={styles.listColumn}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle} numberOfLines={1}>
          {list.title}
        </Text>
        <View style={styles.listActions}>
          <TouchableOpacity onPress={() => moveListLeft(list.id)}>
            <Text style={styles.listAction}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => moveListRight(list.id)}>
            <Text style={styles.listAction}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openListModal(list.id)}>
            <Text style={styles.listAction}>⋯</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => confirmDeleteList(list.id)}>
            <Text style={[styles.listAction, styles.deleteText]}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.listContent}>
        <DraggableFlatList
          data={list.cards}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          onDragEnd={({ data }) => reorderCards(boardId, list.id, data)}
          contentContainerStyle={styles.cardList}
        />
      </View>
      <TouchableOpacity style={styles.addCardBtn} onPress={() => openCardModal(list.id)}>
        <Text style={styles.addCardText}>+ Add a card</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: board.backgroundColor }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.boardTitleText} numberOfLines={1}>
          {board.title}
        </Text>
        <View style={{ width: 50 }} />
      </View>
      <ScrollView
        horizontal
        ref={scrollRef}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.boardScroll}
      >
        {board.lists.map(renderList)}
        <TouchableOpacity style={styles.addListBtn} onPress={() => openListModal()}>
          <Text style={styles.addListText}>+ Add another list</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* List Modal */}
      <Modal visible={listModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{editingListId ? 'Edit List' : 'Add List'}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="List title"
              value={listTitle}
              onChangeText={setListTitle}
              autoFocus
            />
            <View style={styles.modalRow}>
              <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setListModalVisible(false)}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnPrimary} onPress={saveList}>
                <Text style={{ color: '#fff' }}>{editingListId ? 'Save' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Card Modal */}
      <Modal visible={cardModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{editingCardId ? 'Edit Card' : 'Add Card'}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Card title"
              value={cardTitle}
              onChangeText={setCardTitle}
              autoFocus
            />
            <View style={styles.modalRow}>
              <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setCardModalVisible(false)}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnPrimary} onPress={saveCard}>
                <Text style={{ color: '#fff' }}>{editingCardId ? 'Save' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Move Modal */}
      <Modal visible={moveModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Move to List</Text>
            {board.lists.map((l) => (
              <TouchableOpacity
                key={l.id}
                style={styles.moveItem}
                onPress={() => executeMove(l.id)}
              >
                <Text style={styles.moveItemText}>{l.title}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setMoveModalVisible(false)}>
              <Text style={{ textAlign: 'center' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  boardTitleText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    maxWidth: 200,
  },
  boardScroll: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'flex-start',
  },
  listColumn: {
    width: 280,
    backgroundColor: colors.listBackground,
    borderRadius: 8,
    marginRight: 12,
    maxHeight: '85%',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  listActions: {
    flexDirection: 'row',
    gap: 12,
  },
  listAction: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  listContent: {
    flex: 1,
  },
  cardList: {
    padding: 8,
    paddingBottom: 0,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardActive: {
    opacity: 0.8,
    transform: [{ scale: 1.02 }],
  },
  cardCompleted: {
    opacity: 0.7,
  },
  cardTitle: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  cardTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  labelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 6,
  },
  labelDot: {
    width: 32,
    height: 6,
    borderRadius: 3,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  dueBadge: {
    backgroundColor: '#E4F0F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dueText: {
    fontSize: 11,
    color: colors.primary,
  },
  overdueBadge: {
    backgroundColor: '#F5D3CE',
  },
  overdueText: {
    color: colors.error,
  },
  metaText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 6,
  },
  cardActionText: {
    fontSize: 12,
    color: colors.primary,
  },
  deleteText: {
    color: colors.error,
  },
  addCardBtn: {
    padding: 12,
  },
  addCardText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  addListBtn: {
    width: 280,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    height: 50,
  },
  addListText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: colors.textPrimary,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalBtnSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  modalBtnPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  moveItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  moveItemText: {
    fontSize: 15,
    color: colors.textPrimary,
  },
});
