import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { storage } from '../storage/storage';
import { notificationService } from '../notifications/notifications';
import { generateId } from '../utils/helpers';

const AppContext = createContext();

const initialState = {
  boards: [],
  loading: true,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_BOARDS':
      return { ...state, boards: action.payload, loading: false };
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

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    loadBoards();
    notificationService.requestPermissions();
  }, []);

  useEffect(() => {
    if (!state.loading) {
      storage.saveBoards(state.boards);
    }
  }, [state.boards]);

  const loadBoards = async () => {
    const boards = await storage.getBoards();
    dispatch({ type: 'SET_BOARDS', payload: boards });
  };

  const getBoard = (boardId) => state.boards.find((b) => b.id === boardId);
  const getList = (boardId, listId) => {
    const board = getBoard(boardId);
    return board?.lists.find((l) => l.id === listId);
  };
  const getCard = (boardId, listId, cardId) => {
    const list = getList(boardId, listId);
    return list?.cards.find((c) => c.id === cardId);
  };

  const createBoard = (title, backgroundColor) => {
    const board = {
      id: generateId(),
      title,
      backgroundColor: backgroundColor || '#0079BF',
      isStarred: false,
      createdAt: Date.now(),
      lists: [],
    };
    dispatch({ type: 'ADD_BOARD', payload: board });
    return board;
  };

  const updateBoard = (board) => {
    dispatch({ type: 'UPDATE_BOARD', payload: board });
  };

  const deleteBoard = (boardId) => {
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

  const toggleStarBoard = (boardId) => {
    const board = getBoard(boardId);
    if (board) {
      updateBoard({ ...board, isStarred: !board.isStarred });
    }
  };

  const createList = (boardId, title) => {
    const list = {
      id: generateId(),
      boardId,
      title,
      position: getBoard(boardId)?.lists.length || 0,
      cards: [],
    };
    dispatch({ type: 'ADD_LIST', payload: { boardId, list } });
    return list;
  };

  const updateList = (boardId, list) => {
    dispatch({ type: 'UPDATE_LIST', payload: { boardId, list } });
  };

  const deleteList = (boardId, listId) => {
    const list = getList(boardId, listId);
    if (list) {
      list.cards.forEach((card) => {
        notificationService.cancelCardNotification(card.id);
      });
    }
    dispatch({ type: 'DELETE_LIST', payload: { boardId, listId } });
  };

  const reorderLists = (boardId, lists) => {
    dispatch({ type: 'REORDER_LISTS', payload: { boardId, lists } });
  };

  const createCard = async (boardId, listId, title, dueDate = null, hasTime = false) => {
    const card = {
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

  const updateCard = async (boardId, listId, card) => {
    dispatch({ type: 'UPDATE_CARD', payload: { boardId, listId, card } });

    const board = getBoard(boardId);
    await notificationService.cancelCardNotification(card.id);
    if (card.dueDate && !card.isCompleted) {
      await notificationService.scheduleCardNotification(card, board?.title || '');
    }
  };

  const deleteCard = (boardId, listId, cardId) => {
    notificationService.cancelCardNotification(cardId);
    dispatch({ type: 'DELETE_CARD', payload: { boardId, listId, cardId } });
  };

  const moveCard = async (boardId, fromListId, toListId, cardId, newPosition) => {
    dispatch({
      type: 'MOVE_CARD',
      payload: { boardId, fromListId, toListId, cardId, newPosition },
    });
  };

  const reorderCards = (boardId, listId, cards) => {
    dispatch({ type: 'REORDER_CARDS', payload: { boardId, listId, cards } });
  };

  const getAllCardsWithDueDates = () => {
    const cards = [];
    state.boards.forEach((board) => {
      board.lists.forEach((list) => {
        list.cards.forEach((card) => {
          if (card.dueDate) {
            cards.push({ ...card, boardTitle: board.title, listTitle: list.title });
          }
        });
      });
    });
    return cards.sort((a, b) => a.dueDate - b.dueDate);
  };

  return (
    <AppContext.Provider
      value={{
        boards: state.boards,
        loading: state.loading,
        getBoard,
        getList,
        getCard,
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
