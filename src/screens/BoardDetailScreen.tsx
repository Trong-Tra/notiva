import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors } from '../constants/colors';
import { formatDate, isOverdue } from '../utils/helpers';
import { BoardDetailScreenProps } from '../types/navigation';
import { Card } from '../types';

type CardAction = 'edit' | 'moveTop' | 'moveUp' | 'moveDown' | 'moveBottom' | 'moveList' | 'delete';

export default function BoardDetailScreen({ route, navigation }: BoardDetailScreenProps) {
  const { boardId } = route.params;
  const { getBoard, createList, updateList, deleteList, reorderLists, createCard, updateCard, deleteCard, moveCard, reorderCards } = useApp();

  const board = getBoard(boardId);
  const [listModalVisible, setListModalVisible] = useState(false);
  const [listTitle, setListTitle] = useState('');
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [cardModalVisible, setCardModalVisible] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [cardToMove, setCardToMove] = useState<{ listId: string; card: Card } | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  if (!board) {
    return (
      <View style={styles.container}>
        <Text>Board not found</Text>
      </View>
    );
  }

  const openListModal = (listId: string | null = null) => {
    setEditingListId(listId);
    setListTitle(listId ? board.lists.find((l) => l.id === listId)?.title || '' : '');
    setListModalVisible(true);
  };

  const saveList = () => {
    if (!listTitle.trim()) return;
    if (editingListId) {
      const list = board.lists.find((l) => l.id === editingListId);
      if (list) updateList(boardId, { ...list, title: listTitle.trim() });
    } else {
      createList(boardId, listTitle.trim());
    }
    setListModalVisible(false);
    setListTitle('');
  };

  const confirmDeleteList = (listId: string) => {
    const list = board.lists.find((l) => l.id === listId);
    Alert.alert('Delete List', `Delete "${list?.title}" and all its cards?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteList(boardId, listId) },
    ]);
  };

  const openCardModal = (listId: string, card: Card | null = null) => {
    setActiveListId(listId);
    setEditingCardId(card?.id || null);
    setCardTitle(card?.title || '');
    setCardModalVisible(true);
  };

  const saveCard = () => {
    if (!cardTitle.trim() || !activeListId) return;
    if (editingCardId) {
      const list = board.lists.find((l) => l.id === activeListId);
      const card = list?.cards.find((c) => c.id === editingCardId);
      if (card) updateCard(boardId, activeListId, { ...card, title: cardTitle.trim() });
    } else {
      createCard(boardId, activeListId, cardTitle.trim());
    }
    setCardModalVisible(false);
    setCardTitle('');
  };

  const confirmDeleteCard = (listId: string, cardId: string) => {
    const list = board.lists.find((l) => l.id === listId);
    const card = list?.cards.find((c) => c.id === cardId);
    Alert.alert('Delete Card', `Delete "${card?.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteCard(boardId, listId, cardId) },
    ]);
  };

  const openMoveModal = (listId: string, card: Card) => {
    setCardToMove({ listId, card });
    setMoveModalVisible(true);
  };

  const executeMove = (targetListId: string) => {
    if (!cardToMove || targetListId === cardToMove.listId) {
      setMoveModalVisible(false);
      setCardToMove(null);
      return;
    }
    const targetList = board.lists.find((l) => l.id === targetListId);
    if (targetList) {
      moveCard(boardId, cardToMove.listId, targetListId, cardToMove.card.id, targetList.cards.length);
    }
    setMoveModalVisible(false);
    setCardToMove(null);
  };

  const moveCardUp = (listId: string, cardId: string) => {
    const list = board.lists.find((l) => l.id === listId);
    if (!list) return;
    const idx = list.cards.findIndex((c) => c.id === cardId);
    if (idx <= 0) return;
    const newCards = [...list.cards];
    [newCards[idx - 1], newCards[idx]] = [newCards[idx], newCards[idx - 1]];
    reorderCards(boardId, listId, newCards);
  };

  const moveCardDown = (listId: string, cardId: string) => {
    const list = board.lists.find((l) => l.id === listId);
    if (!list) return;
    const idx = list.cards.findIndex((c) => c.id === cardId);
    if (idx < 0 || idx >= list.cards.length - 1) return;
    const newCards = [...list.cards];
    [newCards[idx], newCards[idx + 1]] = [newCards[idx + 1], newCards[idx]];
    reorderCards(boardId, listId, newCards);
  };

  const moveCardToTop = (listId: string, cardId: string) => {
    const list = board.lists.find((l) => l.id === listId);
    if (!list) return;
    const idx = list.cards.findIndex((c) => c.id === cardId);
    if (idx <= 0) return;
    const newCards = [...list.cards];
    const [card] = newCards.splice(idx, 1);
    newCards.unshift(card);
    reorderCards(boardId, listId, newCards);
  };

  const moveCardToBottom = (listId: string, cardId: string) => {
    const list = board.lists.find((l) => l.id === listId);
    if (!list) return;
    const idx = list.cards.findIndex((c) => c.id === cardId);
    if (idx < 0 || idx >= list.cards.length - 1) return;
    const newCards = [...list.cards];
    const [card] = newCards.splice(idx, 1);
    newCards.push(card);
    reorderCards(boardId, listId, newCards);
  };

  const openCardActionSheet = (listId: string, card: Card) => {
    setSelectedListId(listId);
    setSelectedCard(card);
    setActionSheetVisible(true);
  };

  const handleCardAction = (action: CardAction) => {
    if (!selectedCard || !selectedListId) return;
    const listId = selectedListId;
    const cardId = selectedCard.id;

    switch (action) {
      case 'edit':
        setActionSheetVisible(false);
        setTimeout(() => openCardModal(listId, selectedCard), 300);
        break;
      case 'moveTop':
        moveCardToTop(listId, cardId);
        setActionSheetVisible(false);
        break;
      case 'moveUp':
        moveCardUp(listId, cardId);
        setActionSheetVisible(false);
        break;
      case 'moveDown':
        moveCardDown(listId, cardId);
        setActionSheetVisible(false);
        break;
      case 'moveBottom':
        moveCardToBottom(listId, cardId);
        setActionSheetVisible(false);
        break;
      case 'moveList':
        setActionSheetVisible(false);
        setTimeout(() => openMoveModal(listId, selectedCard), 300);
        break;
      case 'delete':
        setActionSheetVisible(false);
        setTimeout(() => confirmDeleteCard(listId, cardId), 300);
        break;
    }
  };

  const renderCard = ({ item: card }: { item: Card }) => {
    const listId = card.listId;
    const checklistTotal = card.checklists?.reduce((acc, cl) => acc + cl.items.length, 0) || 0;
    const checklistDone = card.checklists?.reduce((acc, cl) => acc + cl.items.filter((i) => i.isChecked).length, 0) || 0;

    return (
      <TouchableOpacity
        style={[styles.card, card.isCompleted && styles.cardCompleted]}
        onPress={() => navigation.navigate('CardDetail', { boardId, listId, cardId: card.id })}
        onLongPress={() => openCardActionSheet(listId, card)}
        delayLongPress={350}
        activeOpacity={0.7}
      >
        {card.labels?.length > 0 && (
          <View style={styles.labelRow}>
            {card.labels.map((label) => (
              <View key={label.id} style={[styles.labelDot, { backgroundColor: label.color }]} />
            ))}
          </View>
        )}
        <Text style={[styles.cardTitle, card.isCompleted && styles.cardTitleCompleted]} numberOfLines={3}>{card.title}</Text>
        <View style={styles.cardMetaRow}>
          {card.dueDate && (
            <View style={[styles.dueBadge, isOverdue(card.dueDate) && !card.isCompleted && styles.overdueBadge]}>
              <Ionicons name="time-outline" size={11} color={isOverdue(card.dueDate) && !card.isCompleted ? colors.error : colors.primary} />
              <Text style={[styles.dueText, isOverdue(card.dueDate) && !card.isCompleted && styles.overdueText]}>{formatDate(card.dueDate)}</Text>
            </View>
          )}
          {checklistTotal > 0 && (
            <View style={styles.metaBadge}>
              <Ionicons name="checkmark-circle-outline" size={11} color={checklistDone === checklistTotal ? colors.success : colors.textSecondary} />
              <Text style={[styles.metaText, checklistDone === checklistTotal && styles.metaTextDone]}>
                {checklistDone}/{checklistTotal}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderList = (list: typeof board.lists[0]) => (
    <View key={list.id} style={styles.listColumn}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle} numberOfLines={1}>{list.title}</Text>
        <View style={styles.listActions}>
          <TouchableOpacity onPress={() => openListModal(list.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="ellipsis-horizontal" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => confirmDeleteList(list.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.listContent}>
        <FlatList data={list.cards} keyExtractor={(item) => item.id} renderItem={renderCard} contentContainerStyle={styles.cardList} />
      </View>
      <TouchableOpacity style={styles.addCardBtn} onPress={() => openCardModal(list.id)}>
        <Ionicons name="add" size={16} color={colors.textSecondary} />
        <Text style={styles.addCardText}>Add a card</Text>
      </TouchableOpacity>
    </View>
  );

  const actionRow = (label: string, icon: keyof typeof Ionicons.glyphMap, action: CardAction, danger?: boolean) => (
    <TouchableOpacity style={styles.actionRow} onPress={() => handleCardAction(action)}>
      <Ionicons name={icon} size={20} color={danger ? colors.error : colors.textPrimary} />
      <Text style={[styles.actionLabel, danger && styles.actionLabelDanger]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: board.backgroundColor }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.boardTitleText} numberOfLines={1}>{board.title}</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.boardScroll}>
        {board.lists.map(renderList)}
        <TouchableOpacity style={styles.addListBtn} onPress={() => openListModal()}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addListText}>Add another list</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={listModalVisible} animationType="fade" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>{editingListId ? 'Edit List' : 'Add List'}</Text>
              <TextInput style={styles.modalInput} placeholder="List title" value={listTitle} onChangeText={setListTitle} autoFocus />
              <View style={styles.modalRow}>
                <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setListModalVisible(false)}><Text>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={styles.modalBtnPrimary} onPress={saveList}><Text style={{ color: '#fff' }}>{editingListId ? 'Save' : 'Add'}</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={cardModalVisible} animationType="fade" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>{editingCardId ? 'Edit Card' : 'Add Card'}</Text>
              <TextInput style={styles.modalInput} placeholder="Card title" value={cardTitle} onChangeText={setCardTitle} autoFocus />
              <View style={styles.modalRow}>
                <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setCardModalVisible(false)}><Text>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={styles.modalBtnPrimary} onPress={saveCard}><Text style={{ color: '#fff' }}>{editingCardId ? 'Save' : 'Add'}</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={moveModalVisible} animationType="fade" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Move to List</Text>
              {board.lists.map((l) => (
                <TouchableOpacity key={l.id} style={styles.moveItem} onPress={() => executeMove(l.id)}>
                  <Text style={styles.moveItemText}>{l.title}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setMoveModalVisible(false)}>
                <Text style={{ textAlign: 'center' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={actionSheetVisible} animationType="slide" transparent>
        <View style={styles.actionOverlay}>
          <TouchableOpacity style={styles.actionDismiss} onPress={() => setActionSheetVisible(false)} />
          <View style={styles.actionSheet}>
            <View style={styles.actionHandle} />
            <Text style={styles.actionTitle} numberOfLines={1}>{selectedCard?.title}</Text>
            {actionRow('Edit Title', 'create-outline', 'edit')}
            <View style={styles.actionDivider} />
            {actionRow('Move to Top', 'arrow-up-circle-outline', 'moveTop')}
            {actionRow('Move Up', 'chevron-up-circle-outline', 'moveUp')}
            {actionRow('Move Down', 'chevron-down-circle-outline', 'moveDown')}
            {actionRow('Move to Bottom', 'arrow-down-circle-outline', 'moveBottom')}
            {actionRow('Move to Another List', 'git-compare-outline', 'moveList')}
            <View style={styles.actionDivider} />
            {actionRow('Delete Card', 'trash-outline', 'delete', true)}
            <TouchableOpacity style={styles.actionCancelBtn} onPress={() => setActionSheetVisible(false)}>
              <Text style={styles.actionCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12 },
  backText: { color: '#fff', fontSize: 16, fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  boardTitleText: { color: '#fff', fontSize: 18, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2, maxWidth: 220, textAlign: 'center' },
  boardScroll: { paddingHorizontal: 12, paddingVertical: 8, alignItems: 'flex-start' },
  listColumn: { width: 280, backgroundColor: colors.background, borderRadius: 8, marginRight: 12, maxHeight: '85%' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  listTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, flex: 1 },
  listActions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  listAction: { fontSize: 18, color: colors.textSecondary, fontWeight: 'bold' },
  listContent: { flex: 1 },
  cardList: { padding: 8, paddingBottom: 0 },
  card: { backgroundColor: colors.surface, borderRadius: 6, padding: 10, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  cardCompleted: { opacity: 0.7 },
  cardTitle: { fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
  cardTitleCompleted: { textDecorationLine: 'line-through', color: colors.textSecondary },
  labelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 6 },
  labelDot: { width: 32, height: 6, borderRadius: 3 },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 10 },
  dueBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#E4F0F6', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 },
  dueText: { fontSize: 11, color: colors.primary, fontWeight: '500' },
  overdueBadge: { backgroundColor: '#F5D3CE' },
  overdueText: { color: colors.error },
  metaBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 11, color: colors.textSecondary },
  metaTextDone: { color: colors.success },
  addCardBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 12 },
  addCardText: { color: colors.textSecondary, fontSize: 14 },
  addListBtn: { width: 280, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 6, height: 50 },
  addListText: { color: '#fff', fontSize: 15, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox: { backgroundColor: colors.surface, borderRadius: 12, padding: 20, width: '100%', maxWidth: 400 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 12 },
  modalInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16, color: colors.textPrimary },
  modalRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalBtnSecondary: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: colors.background },
  modalBtnPrimary: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  moveItem: { paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  moveItemText: { fontSize: 15, color: colors.textPrimary },
  actionOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  actionDismiss: { flex: 1 },
  actionSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 36 },
  actionHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 16 },
  actionTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, textAlign: 'center' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  actionLabel: { fontSize: 16, color: colors.textPrimary, fontWeight: '500' },
  actionLabelDanger: { color: colors.error },
  actionDivider: { height: 1, backgroundColor: '#F0F0F0' },
  actionCancelBtn: { marginTop: 12, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 24, backgroundColor: colors.background, borderRadius: 10 },
  actionCancelText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
});
