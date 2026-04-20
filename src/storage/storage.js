import AsyncStorage from '@react-native-async-storage/async-storage';

const BOARDS_KEY = '@trello_clone_boards';

export const storage = {
  async getBoards() {
    try {
      const data = await AsyncStorage.getItem(BOARDS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading boards:', e);
      return [];
    }
  },

  async saveBoards(boards) {
    try {
      await AsyncStorage.setItem(BOARDS_KEY, JSON.stringify(boards));
    } catch (e) {
      console.error('Error saving boards:', e);
    }
  },

  async clearAll() {
    try {
      await AsyncStorage.removeItem(BOARDS_KEY);
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
  },
};
