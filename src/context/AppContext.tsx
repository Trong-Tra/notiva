import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { storage } from '../storage/storage';
import { notificationService } from '../notifications/notifications';
import { generateId } from '../utils/helpers';
import { Board, BoardList, Card, Space, AppState, AppAction, Stats } from '../types';
import { createMockSpace, createMockBoards } from '../data/mockData';

interface AppContextValue {
  boards: Board[];
  space: Space | null;
  onboardingComplete: boolean;
  loading: boolean;
  getBoard: (boardId: string) => Board | undefined;
  getList: (boardId: string, listId: string) => BoardList | undefined;
  getCard: (boardId: string, listId: string, cardId: string) => Card | undefined;
  createSpace: (name: string) => Space;
  completeOnboarding: () => Promise<void>;
  createBoard: (title: string, backgroundColor?: string) => Board;
  updateBoard: (board: Board) => void;
  deleteBoard: (boardId: string) => void;
  toggleStarBoard: (boardId: string) => void;
  createList: (boardId: string, title: string) => BoardList;
  updateList: (boardId: string, list: BoardList) => void;
  deleteList: (boardId: string, listId: string) => void;
  reorderLists: (boardId: string, lists: BoardList[]) => void;
  createCard: (boardId: string, listId: string, title: string, dueDate?: number | null, hasTime?: boolean) => Promise<Card>;
  updateCard: (boardId: string, listId: string, card: Card) => Promise<void>;
  deleteCard: (boardId: string, listId: string, cardId: string) => void;
  moveCard: (boardId: string, fromListId: string, toListId: string, cardId: string, newPosition: number) => Promise<void>;
  reorderCards: (boardId: string, listId: string, cards: Card[]) => void;
  getAllCardsWithDueDates: () => Card[];
  getStats: () => Stats;
  loadMockData: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const initialState: AppState = {
  boards: [],
  space: null,
  onboardingComplete: false,
  loading: true,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_BOARDS':
      return { ...state, boards: action.payload, loading: false };
    case 'SET_SPACE':
      return { ...state, space: action.payload };
    case 'SET_ONBOARDING':
      return { ...state, onboardingComplete: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'ADD_BOARD':
      return { ...state, boards: [...state.boards, action.payload] };
    case 'UPDATE_BOARD':
      return {
        ...state,
        boards: state.boards.map((b) => (b.id === action.payload.id ? action.payload : b)),
      };
    case 'DELETE_BOARD':
      return {
        ...state,
        boards: state.boards.filter((b) => b.id !== action.payload),
      };
    case 'ADD_LIST': {
      const { boardId, list } = action.payload;
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === boardId ? { ...b, lists: [...b.lists, list] } : b
        ),
      };
    }
    case 'UPDATE_LIST': {
      const { boardId, list } = action.payload;
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === boardId
            ? { ...b, lists: b.lists.map((l) => (l.id === list.id ? list : l)) }
            : b
        ),
      };
    }
    case 'DELETE_LIST': {
      const { boardId, listId } = action.payload;
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === boardId ? { ...b, lists: b.lists.filter((l) => l.id !== listId) } : b
        ),
      };
    }
    case 'REORDER_LISTS': {
      const { boardId, lists } = action.payload;
      return {
        ...state,
        boards: state.boards.map((b) => (b.id === boardId ? { ...b, lists } : b)),
      };
    }
    case 'ADD_CARD': {
      const { boardId, listId, card } = action.payload;
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === boardId
            ? {
                ...b,
                lists: b.lists.map((l) =>
                  l.id === listId ? { ...l, cards: [...l.cards, card] } : l
                ),
              }
            : b
        ),
      };
    }
    case 'UPDATE_CARD': {
      const { boardId, listId, card } = action.payload;
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === boardId
            ? {
                ...b,
                lists: b.lists.map((l) =>
                  l.id === listId
                    ? { ...l, cards: l.cards.map((c) => (c.id === card.id ? card : c)) }
                    : l
                ),
              }
            : b
        ),
      };
    }
    case 'DELETE_CARD': {
      const { boardId, listId, cardId } = action.payload;
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === boardId
            ? {
                ...b,
                lists: b.lists.map((l) =>
                  l.id === listId ? { ...l, cards: l.cards.filter((c) => c.id !== cardId) } : l
                ),
              }
            : b
        ),
      };
    }
    case 'MOVE_CARD': {
      const { boardId, fromListId, toListId, cardId, newPosition } = action.payload;
      const board = state.boards.find((b) => b.id === boardId);
      if (!board) return state;
      const fromList = board.lists.find((l) => l.id === fromListId);
      const card = fromList?.cards.find((c) => c.id === cardId);
      if (!card) return state;

      const newBoards = state.boards.map((b) => {
        if (b.id !== boardId) return b;
        return {
          ...b,
          lists: b.lists.map((l) => {
            if (l.id === fromListId) {
              return { ...l, cards: l.cards.filter((c) => c.id !== cardId) };
            }
            if (l.id === toListId) {
              const newCards = [...l.cards];
              const updatedCard = { ...card, listId: toListId };
              newCards.splice(newPosition, 0, updatedCard);
              return { ...l, cards: newCards };
            }
            return l;
          }),
        };
      });
      return { ...state, boards: newBoards };
    }
    case 'REORDER_CARDS': {
      const { boardId, listId, cards } = action.payload;
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === boardId
            ? {
                ...b,
                lists: b.lists.map((l) => (l.id === listId ? { ...l, cards } : l)),
              }
            : b
        ),
      };
    }
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    loadData();
    notificationService.requestPermissions();
  }, []);

  useEffect(() => {
    if (!state.loading) {
      storage.saveBoards(state.boards);
    }
  }, [state.boards]);

  useEffect(() => {
    if (state.space) {
      storage.saveSpace(state.space);
    }
  }, [state.space]);

  const loadData = async () => {
    const [boards, space, onboardingComplete] = await Promise.all([
      storage.getBoards(),
      storage.getSpace(),
      storage.getOnboardingComplete(),
    ]);
    dispatch({ type: 'SET_BOARDS', payload: boards });
    dispatch({ type: 'SET_SPACE', payload: space });
    dispatch({ type: 'SET_ONBOARDING', payload: onboardingComplete });
  };

  const getBoard = (boardId: string) => state.boards.find((b) => b.id === boardId);
  const getList = (boardId: string, listId: string) => {
    const board = getBoard(boardId);
    return board?.lists.find((l) => l.id === listId);
  };
  const getCard = (boardId: string, listId: string, cardId: string) => {
    const list = getList(boardId, listId);
    return list?.cards.find((c) => c.id === cardId);
  };

  const createSpace = (name: string) => {
    const space: Space = { name: name.trim(), createdAt: Date.now() };
    dispatch({ type: 'SET_SPACE', payload: space });
    return space;
  };

  const completeOnboarding = async () => {
    await storage.setOnboardingComplete(true);
    dispatch({ type: 'SET_ONBOARDING', payload: true });
  };

  const createBoard = (title: string, backgroundColor?: string) => {
    const board: Board = {
      id: generateId(),
      title,
      backgroundColor: backgroundColor || '#0052CC',
      isStarred: false,
      createdAt: Date.now(),
      lists: [],
    };
    dispatch({ type: 'ADD_BOARD', payload: board });
    return board;
  };

  const updateBoard = (board: Board) => {
    dispatch({ type: 'UPDATE_BOARD', payload: board });
  };

  const deleteBoard = (boardId: string) => {
    const board = getBoard(boardId);
    if (board) {
      board.lists.forEach((list) => {
        list.cards.forEach((card) => {
          notificationService.cancelCardNotification(card.id);
        });
      });
    }
    dispatch({ type: 'DELETE_BOARD', payload: boardId });
  };

  const toggleStarBoard = (boardId: string) => {
    const board = getBoard(boardId);
    if (board) {
      updateBoard({ ...board, isStarred: !board.isStarred });
    }
  };

  const createList = (boardId: string, title: string) => {
    const list: BoardList = {
      id: generateId(),
      boardId,
      title,
      position: getBoard(boardId)?.lists.length || 0,
      cards: [],
    };
    dispatch({ type: 'ADD_LIST', payload: { boardId, list } });
    return list;
  };

  const updateList = (boardId: string, list: BoardList) => {
    dispatch({ type: 'UPDATE_LIST', payload: { boardId, list } });
  };

  const deleteList = (boardId: string, listId: string) => {
    const list = getList(boardId, listId);
    if (list) {
      list.cards.forEach((card) => {
        notificationService.cancelCardNotification(card.id);
      });
    }
    dispatch({ type: 'DELETE_LIST', payload: { boardId, listId } });
  };

  const reorderLists = (boardId: string, lists: BoardList[]) => {
    dispatch({ type: 'REORDER_LISTS', payload: { boardId, lists } });
  };

  const createCard = async (boardId: string, listId: string, title: string, dueDate: number | null = null, hasTime = false) => {
    const card: Card = {
      id: generateId(),
      listId,
      title,
      description: '',
      position: getList(boardId, listId)?.cards.length || 0,
      dueDate,
      hasTime,
      isCompleted: false,
      labels: [],
      checklists: [],
    };
    dispatch({ type: 'ADD_CARD', payload: { boardId, listId, card } });

    if (dueDate) {
      const board = getBoard(boardId);
      await notificationService.scheduleCardNotification(card, board?.title || '');
    }
    return card;
  };

  const updateCard = async (boardId: string, listId: string, card: Card) => {
    dispatch({ type: 'UPDATE_CARD', payload: { boardId, listId, card } });

    const board = getBoard(boardId);
    await notificationService.cancelCardNotification(card.id);
    if (card.dueDate && !card.isCompleted) {
      await notificationService.scheduleCardNotification(card, board?.title || '');
    }
  };

  const deleteCard = (boardId: string, listId: string, cardId: string) => {
    notificationService.cancelCardNotification(cardId);
    dispatch({ type: 'DELETE_CARD', payload: { boardId, listId, cardId } });
  };

  const moveCard = async (boardId: string, fromListId: string, toListId: string, cardId: string, newPosition: number) => {
    dispatch({
      type: 'MOVE_CARD',
      payload: { boardId, fromListId, toListId, cardId, newPosition },
    });
  };

  const reorderCards = (boardId: string, listId: string, cards: Card[]) => {
    dispatch({ type: 'REORDER_CARDS', payload: { boardId, listId, cards } });
  };

  const getAllCardsWithDueDates = () => {
    const cards: Card[] = [];
    state.boards.forEach((board) => {
      board.lists.forEach((list) => {
        list.cards.forEach((card) => {
          if (card.dueDate) {
            cards.push({ ...card, boardTitle: board.title, listTitle: list.title } as Card);
          }
        });
      });
    });
    return cards.sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0));
  };

  const getStats = (): Stats => {
    let totalCards = 0;
    let completedCards = 0;
    let overdueCards = 0;
    const now = Date.now();
    state.boards.forEach((board) => {
      board.lists.forEach((list) => {
        list.cards.forEach((card) => {
          totalCards++;
          if (card.isCompleted) completedCards++;
          if (card.dueDate && !card.isCompleted && card.dueDate < now) overdueCards++;
        });
      });
    });
    return { totalCards, completedCards, overdueCards, totalBoards: state.boards.length };
  };

  const loadMockData = async () => {
    const space = createMockSpace();
    const boards = createMockBoards();
    dispatch({ type: 'SET_SPACE', payload: space });
    dispatch({ type: 'SET_BOARDS', payload: boards });
    await storage.saveSpace(space);
    await storage.saveBoards(boards);
    await storage.setOnboardingComplete(true);
    dispatch({ type: 'SET_ONBOARDING', payload: true });
  };

  return (
    <AppContext.Provider
      value={{
        boards: state.boards,
        space: state.space,
        onboardingComplete: state.onboardingComplete,
        loading: state.loading,
        getBoard,
        getList,
        getCard,
        createSpace,
        completeOnboarding,
        createBoard,
        updateBoard,
        deleteBoard,
        toggleStarBoard,
        createList,
        updateList,
        deleteList,
        reorderLists,
        createCard,
        updateCard,
        deleteCard,
        moveCard,
        reorderCards,
        getAllCardsWithDueDates,
        getStats,
        loadMockData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
