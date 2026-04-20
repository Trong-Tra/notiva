export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  isChecked: boolean;
}

export interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface Card {
  id: string;
  listId: string;
  title: string;
  description: string;
  position: number;
  dueDate: number | null;
  hasTime: boolean;
  isCompleted: boolean;
  labels: Label[];
  checklists: Checklist[];
}

export interface BoardList {
  id: string;
  boardId: string;
  title: string;
  position: number;
  cards: Card[];
}

export interface Board {
  id: string;
  title: string;
  backgroundColor: string;
  isStarred: boolean;
  createdAt: number;
  lists: BoardList[];
}

export interface Space {
  name: string;
  createdAt: number;
}

export interface AppState {
  boards: Board[];
  space: Space | null;
  onboardingComplete: boolean;
  loading: boolean;
}

export interface DueCard extends Card {
  dateStr: string;
  boardTitle: string;
  listTitle: string;
}

export interface Stats {
  totalCards: number;
  completedCards: number;
  overdueCards: number;
  totalBoards: number;
}

export type AppAction =
  | { type: 'SET_BOARDS'; payload: Board[] }
  | { type: 'SET_SPACE'; payload: Space | null }
  | { type: 'SET_ONBOARDING'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_BOARD'; payload: Board }
  | { type: 'UPDATE_BOARD'; payload: Board }
  | { type: 'DELETE_BOARD'; payload: string }
  | { type: 'ADD_LIST'; payload: { boardId: string; list: BoardList } }
  | { type: 'UPDATE_LIST'; payload: { boardId: string; list: BoardList } }
  | { type: 'DELETE_LIST'; payload: { boardId: string; listId: string } }
  | { type: 'REORDER_LISTS'; payload: { boardId: string; lists: BoardList[] } }
  | { type: 'ADD_CARD'; payload: { boardId: string; listId: string; card: Card } }
  | { type: 'UPDATE_CARD'; payload: { boardId: string; listId: string; card: Card } }
  | { type: 'DELETE_CARD'; payload: { boardId: string; listId: string; cardId: string } }
  | { type: 'MOVE_CARD'; payload: { boardId: string; fromListId: string; toListId: string; cardId: string; newPosition: number } }
  | { type: 'REORDER_CARDS'; payload: { boardId: string; listId: string; cards: Card[] } };
