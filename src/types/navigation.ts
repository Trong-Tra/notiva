import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

export type SpaceStackParamList = {
  SpaceBoards: undefined;
  BoardDetail: { boardId: string };
  CardDetail: { boardId: string; listId: string; cardId: string; fromTab?: string };
};

export type TabParamList = {
  HomeTab: undefined;
  SpaceTab: { screen?: keyof SpaceStackParamList; params?: any };
  DashboardTab: undefined;
  CalendarTab: undefined;
  NotificationsTab: undefined;
};

export type OnboardingScreenProps = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export type HomeScreenNavigationProp = BottomTabNavigationProp<TabParamList>;

export type SpaceScreenNavigationProp = NativeStackNavigationProp<SpaceStackParamList>;
export type SpaceScreenProps = NativeStackScreenProps<SpaceStackParamList, 'SpaceBoards'>;

export type BoardDetailScreenProps = NativeStackScreenProps<SpaceStackParamList, 'BoardDetail'>;
export type CardDetailScreenProps = NativeStackScreenProps<SpaceStackParamList, 'CardDetail'>;

export type CalendarScreenProps = NativeStackScreenProps<any, any>;
export type NotificationsScreenProps = NativeStackScreenProps<any, any>;
