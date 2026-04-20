import AsyncStorage from '@react-native-async-storage/async-storage';
import { Board, Space } from '../types';

const BOARDS_KEY = '@trello_clone_boards';
const SPACE_KEY = '@trello_clone_space';
const ONBOARDING_KEY = '@trello_clone_onboarding';

export const storage = {
  async getBoards(): Promise<Board[]> {
    try {
      const data = await AsyncStorage.getItem(BOARDS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading boards:', e);
      return [];
    }
  },

  async saveBoards(boards: Board[]): Promise<void> {
    try {
      await AsyncStorage.setItem(BOARDS_KEY, JSON.stringify(boards));
    } catch (e) {
      console.error('Error saving boards:', e);
    }
  },

  async getSpace(): Promise<Space | null> {
    try {
      const data = await AsyncStorage.getItem(SPACE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error loading space:', e);
      return null;
    }
  },

  async saveSpace(space: Space): Promise<void> {
    try {
      await AsyncStorage.setItem(SPACE_KEY, JSON.stringify(space));
    } catch (e) {
      console.error('Error saving space:', e);
    }
  },

  async getOnboardingComplete(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(ONBOARDING_KEY);
      return data === 'true';
    } catch (e) {
      console.error('Error loading onboarding:', e);
      return false;
    }
  },

  async setOnboardingComplete(value: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, value ? 'true' : 'false');
    } catch (e) {
      console.error('Error saving onboarding:', e);
    }
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([BOARDS_KEY, SPACE_KEY, ONBOARDING_KEY]);
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
  },
};
