import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider, useApp } from './src/context/AppContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import SpaceScreen from './src/screens/SpaceScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import BoardDetailScreen from './src/screens/BoardDetailScreen';
import CardDetailScreen from './src/screens/CardDetailScreen';
import { RootStackParamList, SpaceStackParamList, TabParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const SpaceStack = createNativeStackNavigator<SpaceStackParamList>();

function SpaceStackNavigator() {
  return (
    <SpaceStack.Navigator screenOptions={{ headerShown: false }}>
      <SpaceStack.Screen name="SpaceBoards" component={SpaceScreen} />
      <SpaceStack.Screen name="BoardDetail" component={BoardDetailScreen} />
      <SpaceStack.Screen name="CardDetail" component={CardDetailScreen} />
    </SpaceStack.Navigator>
  );
}

const TAB_ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  HomeTab: { active: 'home', inactive: 'home-outline' },
  SpaceTab: { active: 'grid', inactive: 'grid-outline' },
  DashboardTab: { active: 'bar-chart', inactive: 'bar-chart-outline' },
  CalendarTab: { active: 'calendar', inactive: 'calendar-outline' },
  NotificationsTab: { active: 'notifications', inactive: 'notifications-outline' },
};

function TabIcon({ focused, routeName }: { focused: boolean; routeName: string }) {
  const icons = TAB_ICONS[routeName];
  if (!icons) return null;
  const name = focused ? icons.active : icons.inactive;
  return (
    <Ionicons
      name={name}
      size={22}
      color={focused ? '#0052CC' : '#9CA3AF'}
    />
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon focused={focused} routeName={route.name} />,
        tabBarActiveTintColor: '#0052CC',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
        tabBarStyle: {
          height: 88,
          paddingTop: 8,
          paddingBottom: 24,
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
          backgroundColor: '#fff',
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="SpaceTab"
        component={SpaceStackNavigator}
        options={{ tabBarLabel: 'Space' }}
      />
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="CalendarTab"
        component={CalendarScreen}
        options={{ tabBarLabel: 'Calendar' }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{ tabBarLabel: 'Alerts' }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { onboardingComplete, loading } = useApp();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 16, color: '#9CA3AF' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!onboardingComplete ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
}

function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export default function App() {
  return (
    <AppProvider>
      <ThemeProvider>
        <NavigationContainer>
          <ThemedStatusBar />
          <RootNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </AppProvider>
  );
}
