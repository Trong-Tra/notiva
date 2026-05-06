import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { AppProvider, useApp } from './src/context/AppContext';
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

function TabLabel({ focused, label }: { focused: boolean; label: string }) {
  return (
    <Text style={{ fontSize: 11, fontWeight: focused ? '700' : '500', color: focused ? '#0052CC' : '#9CA3AF', marginTop: 2 }}>
      {label}
    </Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 88,
          paddingTop: 8,
          paddingBottom: 24,
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
          backgroundColor: '#fff',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: ({ focused }) => <TabLabel focused={focused} label="Home" />,
        }}
      />
      <Tab.Screen
        name="SpaceTab"
        component={SpaceStackNavigator}
        options={{
          tabBarLabel: ({ focused }) => <TabLabel focused={focused} label="Space" />,
        }}
      />
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          tabBarLabel: ({ focused }) => <TabLabel focused={focused} label="Dashboard" />,
        }}
      />
      <Tab.Screen
        name="CalendarTab"
        component={CalendarScreen}
        options={{
          tabBarLabel: ({ focused }) => <TabLabel focused={focused} label="Calendar" />,
        }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{
          tabBarLabel: ({ focused }) => <TabLabel focused={focused} label="Alerts" />,
        }}
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

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
    </AppProvider>
  );
}
