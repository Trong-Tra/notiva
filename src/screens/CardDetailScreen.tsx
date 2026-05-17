import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { labelColors } from '../constants/colors';
import { formatDate, formatTime, generateId } from '../utils/helpers';
import { CardDetailScreenProps } from '../types/navigation';
import { Label, Checklist, ChecklistItem } from '../types';

export default function CardDetailScreen({ route, navigation }: CardDetailScreenProps) {
  const { boardId, listId, cardId, fromTab } = route.params;
  const { getBoard, getList, getCard, updateCard, deleteCard, moveCard } = useApp();
  const { colors } = useTheme();

  const board = getBoard(boardId);
  const list = getList(boardId, listId);
  const card = getCard(boardId, listId, cardId);

  const [title, setTitle] = useState(card?.title || '');
  const [description, setDescription] = useState(card?.description || '');
  const [isCompleted, setIsCompleted] = useState(card?.isCompleted || false);
  const [dueDate, setDueDate] = useState<Date | null>(card?.dueDate ? new Date(card.dueDate) : null);
  const [hasTime, setHasTime] = useState(card?.hasTime || false);
  const [labels, setLabels] = useState<Label[]>(card?.labels || []);
  const [checklists, setChecklists] = useState<Checklist[]>(card?.checklists || []);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [labelModalVisible, setLabelModalVisible] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedLabelColor, setSelectedLabelColor] = useState(labelColors[0]);
  const [checklistModalVisible, setChecklistModalVisible] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newItemInputs, setNewItemInputs] = useState<Record<string, string>>({});
  const [moveModalVisible, setMoveModalVisible] = useState(false);

  const styles = getStyles(colors);

  if (!card) {
    return (
      <View style={styles.container}>
        <Text style={{ color: colors.textPrimary }}>Card not found</Text>
      </View>
    );
  }

  const saveCard = async () => {
    const updated = { ...card, title: title.trim() || card.title, description, isCompleted, dueDate: dueDate ? dueDate.getTime() : null, hasTime, labels, checklists };
    await updateCard(boardId, listId, updated);
  };

  const goBack = () => {
    if (fromTab) {
      navigation.navigate(fromTab as never);
    } else {
      navigation.goBack();
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Card', `Delete "${card.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteCard(boardId, listId, cardId); goBack(); } },
    ]);
  };

  const onDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const current = dueDate || new Date();
      selectedDate.setHours(current.getHours(), current.getMinutes());
      setDueDate(selectedDate);
    }
  };

  const onTimeChange = (_event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate && dueDate) {
      const updated = new Date(dueDate);
      updated.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      setDueDate(updated);
    }
  };

  const clearDueDate = () => { setDueDate(null); setHasTime(false); };

  const addLabel = () => {
    if (!newLabelName.trim()) return;
    const newLabel: Label = { id: generateId(), name: newLabelName.trim(), color: selectedLabelColor };
    setLabels([...labels, newLabel]);
    setNewLabelName('');
  };

  const removeLabel = (labelId: string) => { setLabels(labels.filter((l) => l.id !== labelId)); };

  const addChecklist = () => {
    if (!newChecklistTitle.trim()) return;
    const newCl: Checklist = { id: generateId(), title: newChecklistTitle.trim(), items: [] };
    setChecklists([...checklists, newCl]);
    setNewChecklistTitle('');
    setChecklistModalVisible(false);
  };

  const deleteChecklist = (clId: string) => { setChecklists(checklists.filter((cl) => cl.id !== clId)); };

  const addChecklistItem = (clId: string) => {
    const text = newItemInputs[clId]?.trim();
    if (!text) return;
    setChecklists(checklists.map((cl) => (cl.id === clId ? { ...cl, items: [...cl.items, { id: generateId(), title: text, isChecked: false }] } : cl)));
    setNewItemInputs({ ...newItemInputs, [clId]: '' });
  };

  const toggleItem = (clId: string, itemId: string) => {
    setChecklists(checklists.map((cl) => (cl.id === clId ? { ...cl, items: cl.items.map((item) => (item.id === itemId ? { ...item, isChecked: !item.isChecked } : item)) } : cl)));
  };

  const deleteItem = (clId: string, itemId: string) => {
    setChecklists(checklists.map((cl) => (cl.id === clId ? { ...cl, items: cl.items.filter((item) => item.id !== itemId) } : cl)));
  };

  const getChecklistProgress = (cl: Checklist) => {
    if (cl.items.length === 0) return 0;
    return Math.round((cl.items.filter((i) => i.isChecked).length / cl.items.length) * 100);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { saveCard(); goBack(); }}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Card Details</Text>
        <TouchableOpacity onPress={handleDelete}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <TextInput style={styles.titleInput} value={title} onChangeText={setTitle} onBlur={saveCard} placeholder="Card title" placeholderTextColor={colors.textSecondary} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>In list</Text>
          <Text style={styles.metaValue}>{list?.title}</Text>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Completed</Text>
          <Switch value={isCompleted} onValueChange={(v) => { setIsCompleted(v); saveCard(); }} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <TextInput style={styles.descInput} multiline placeholder="Add a more detailed description..." placeholderTextColor={colors.textSecondary} value={description} onChangeText={setDescription} onBlur={saveCard} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Due Date</Text>
          <View style={styles.dateRow}>
            {dueDate ? (
              <View style={styles.dateDisplay}>
                <Text style={styles.dateText}>{formatDate(dueDate.getTime())} {hasTime ? formatTime(dueDate.getTime()) : ''}</Text>
                <TouchableOpacity onPress={clearDueDate}><Text style={styles.clearText}>Clear</Text></TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.placeholderText}>No due date</Text>
            )}
          </View>
          <View style={styles.dateButtons}>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}><Text style={styles.dateBtnText}>Pick Date</Text></TouchableOpacity>
            {dueDate && <TouchableOpacity style={styles.dateBtn} onPress={() => setShowTimePicker(true)}><Text style={styles.dateBtnText}>Pick Time</Text></TouchableOpacity>}
          </View>
          {dueDate && (
            <View style={styles.timeToggle}>
              <Text style={styles.smallText}>Include time</Text>
              <Switch value={hasTime} onValueChange={setHasTime} />
            </View>
          )}
          {showDatePicker && <DateTimePicker value={dueDate || new Date()} mode="date" display="default" onChange={onDateChange} />}
          {showTimePicker && dueDate && <DateTimePicker value={dueDate} mode="time" display="default" onChange={onTimeChange} />}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Labels</Text>
            <TouchableOpacity onPress={() => setLabelModalVisible(true)}><Text style={styles.addLink}>+ Add</Text></TouchableOpacity>
          </View>
          <View style={styles.labelList}>
            {labels.map((label) => (
              <View key={label.id} style={[styles.labelChip, { backgroundColor: label.color }]}>
                <Text style={styles.labelChipText}>{label.name}</Text>
                <TouchableOpacity onPress={() => removeLabel(label.id)}><Text style={styles.labelChipRemove}>×</Text></TouchableOpacity>
              </View>
            ))}
            {labels.length === 0 && <Text style={styles.placeholderText}>No labels</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Checklists</Text>
            <TouchableOpacity onPress={() => setChecklistModalVisible(true)}><Text style={styles.addLink}>+ Add</Text></TouchableOpacity>
          </View>
          {checklists.map((cl) => (
            <View key={cl.id} style={styles.checklistBox}>
              <View style={styles.checklistHeader}>
                <Text style={styles.checklistTitle}>{cl.title}</Text>
                <TouchableOpacity onPress={() => deleteChecklist(cl.id)}><Text style={styles.deleteText}>Delete</Text></TouchableOpacity>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${getChecklistProgress(cl)}%` }]} />
              </View>
              <Text style={styles.progressText}>{getChecklistProgress(cl)}%</Text>
              {cl.items.map((item) => (
                <View key={item.id} style={styles.checkItem}>
                  <TouchableOpacity style={[styles.checkbox, item.isChecked && styles.checkboxChecked]} onPress={() => toggleItem(cl.id, item.id)}>
                    {item.isChecked && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                  <Text style={[styles.checkItemText, item.isChecked && styles.checkItemTextChecked]}>{item.title}</Text>
                  <TouchableOpacity onPress={() => deleteItem(cl.id, item.id)}><Text style={styles.itemDelete}>×</Text></TouchableOpacity>
                </View>
              ))}
              <View style={styles.addItemRow}>
                <TextInput style={styles.addItemInput} placeholder="Add an item" placeholderTextColor={colors.textSecondary} value={newItemInputs[cl.id] || ''} onChangeText={(text) => setNewItemInputs({ ...newItemInputs, [cl.id]: text })} onSubmitEditing={() => addChecklistItem(cl.id)} />
                <TouchableOpacity onPress={() => addChecklistItem(cl.id)}><Text style={styles.addLink}>Add</Text></TouchableOpacity>
              </View>
            </View>
          ))}
          {checklists.length === 0 && <Text style={styles.placeholderText}>No checklists</Text>}
        </View>

        <TouchableOpacity style={styles.moveBtn} onPress={() => setMoveModalVisible(true)}>
          <Text style={styles.moveBtnText}>Move to another list</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={labelModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add Label</Text>
            <TextInput style={styles.modalInput} placeholder="Label name" placeholderTextColor={colors.textSecondary} value={newLabelName} onChangeText={setNewLabelName} autoFocus />
            <View style={styles.colorGrid}>
              {labelColors.map((color) => (
                <TouchableOpacity key={color} style={[styles.colorCircle, { backgroundColor: color }, selectedLabelColor === color && styles.colorSelected]} onPress={() => setSelectedLabelColor(color)} />
              ))}
            </View>
            <View style={styles.modalRow}>
              <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setLabelModalVisible(false)}><Text style={{ color: colors.textPrimary }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnPrimary} onPress={() => { addLabel(); setLabelModalVisible(false); }}><Text style={{ color: '#fff' }}>Add</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={checklistModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add Checklist</Text>
            <TextInput style={styles.modalInput} placeholder="Checklist title" placeholderTextColor={colors.textSecondary} value={newChecklistTitle} onChangeText={setNewChecklistTitle} autoFocus />
            <View style={styles.modalRow}>
              <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setChecklistModalVisible(false)}><Text style={{ color: colors.textPrimary }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnPrimary} onPress={addChecklist}><Text style={{ color: '#fff' }}>Add</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={moveModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Move to List</Text>
            {board?.lists.map((l) => (
              <TouchableOpacity key={l.id} style={styles.moveItem} onPress={() => {
                if (l.id !== listId) { moveCard(boardId, listId, l.id, cardId, l.cards.length); goBack(); }
                setMoveModalVisible(false);
              }}>
                <Text style={styles.moveItemText}>{l.title}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setMoveModalVisible(false)}>
              <Text style={{ color: colors.textPrimary, textAlign: 'center' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
    backText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
    headerTitle: { fontSize: 17, fontWeight: '600', color: colors.textPrimary },
    deleteText: { color: colors.error, fontSize: 14 },
    content: { flex: 1, padding: 16 },
    titleInput: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 16, padding: 8, backgroundColor: colors.surface, borderRadius: 8 },
    section: { marginBottom: 20, backgroundColor: colors.surface, padding: 12, borderRadius: 8 },
    sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, backgroundColor: colors.surface, padding: 12, borderRadius: 8 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    sectionTitle: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
    metaValue: { fontSize: 15, color: colors.textPrimary },
    descInput: { fontSize: 15, color: colors.textPrimary, minHeight: 80, textAlignVertical: 'top', backgroundColor: colors.background, borderRadius: 6, padding: 10 },
    dateRow: { marginBottom: 8 },
    dateDisplay: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    dateText: { fontSize: 15, color: colors.textPrimary },
    clearText: { color: colors.error, fontSize: 14 },
    dateButtons: { flexDirection: 'row', gap: 10 },
    dateBtn: { backgroundColor: colors.primary, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6, marginTop: 4 },
    dateBtnText: { color: '#fff', fontSize: 14 },
    timeToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
    smallText: { fontSize: 14, color: colors.textSecondary },
    placeholderText: { color: colors.textSecondary, fontSize: 14, fontStyle: 'italic' },
    labelList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    labelChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4, gap: 6 },
    labelChipText: { color: '#fff', fontSize: 12, fontWeight: '600' },
    labelChipRemove: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 'bold' },
    addLink: { color: colors.primary, fontSize: 14, fontWeight: '600' },
    checklistBox: { marginTop: 10, padding: 10, backgroundColor: colors.background, borderRadius: 6 },
    checklistHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    checklistTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
    progressBar: { height: 6, backgroundColor: colors.border, borderRadius: 3, marginBottom: 4 },
    progressFill: { height: 6, backgroundColor: colors.success, borderRadius: 3 },
    progressText: { fontSize: 11, color: colors.textSecondary, marginBottom: 8 },
    checkItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 10 },
    checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: colors.textSecondary, justifyContent: 'center', alignItems: 'center' },
    checkboxChecked: { backgroundColor: colors.success, borderColor: colors.success },
    checkmark: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    checkItemText: { flex: 1, fontSize: 14, color: colors.textPrimary },
    checkItemTextChecked: { textDecorationLine: 'line-through', color: colors.textSecondary },
    itemDelete: { color: colors.error, fontSize: 16, paddingHorizontal: 4 },
    addItemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
    addItemInput: { flex: 1, backgroundColor: colors.surface, borderRadius: 4, padding: 8, fontSize: 14, color: colors.textPrimary },
    moveBtn: { backgroundColor: colors.surface, padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
    moveBtnText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalBox: { backgroundColor: colors.surface, borderRadius: 12, padding: 20, width: '100%', maxWidth: 400 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 12 },
    modalInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16, color: colors.textPrimary },
    colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
    colorCircle: { width: 32, height: 32, borderRadius: 16 },
    colorSelected: { borderWidth: 3, borderColor: colors.textPrimary },
    modalRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    modalBtnSecondary: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: colors.background },
    modalBtnPrimary: { backgroundColor: colors.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
    moveItem: { paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
    moveItemText: { fontSize: 15, color: colors.textPrimary },
  });
}
