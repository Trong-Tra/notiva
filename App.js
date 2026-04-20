import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { AppProvider } from './src/context/AppContext';
import BoardsScreen from './src/screens/BoardsScreen';
import BoardDetailScreen from './src/screens/BoardDetailScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import CardDetailScreen from './src/screens/CardDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function BoardTabs({ route }) {
  const { boardId } = route.params;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { paddingBottom: 8, height: 60 },
      }}
    >
      <Tab.Screen
        name="BoardView"
        component={BoardDetailScreen}
        initialParams={{ boardId }}
        options={{
          tabBarLabel: 'Board',
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 20 }}>📋</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="CalendarView"
        component={CalendarScreen}
        initialParams={{ boardId }}
        options={{
          tabBarLabel: 'Calendar',
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 20 }}>📅</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Boards" component={BoardsScreen} />
          <Stack.Screen name="BoardDetail" component={BoardTabs} />
          <Stack.Screen name="CardDetail" component={CardDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
