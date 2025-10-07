import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
// import { FontProvider } from './src/contexts/FontContext'; // Kaldırıldı
import { Ionicons } from '@expo/vector-icons';
// import './global.css'; // Disabled for now

// Type definitions for navigation
type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  WriteDiary: { entry?: any } | undefined;
  WriteDiaryStep1: undefined;
  WriteDiaryStep2: { title: string; mood: number };
  WriteDiaryStep3: { title: string; mood: number; answers: any; freeWriting: string };
  ThemeSelection: undefined;
  WellnessTracking: undefined;
  Archive: undefined;
  Tasks: undefined;
  Reminders: undefined;
};

type TabParamList = {
  Dashboard: undefined;
  History: undefined;
  Statistics: undefined;
  Settings: undefined;
};

// Screens
import AuthScreen from './src/screens/AuthScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import WriteDiaryScreen from './src/screens/WriteDiaryScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import StatisticsScreen from './src/screens/StatisticsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ThemeSelectionScreen from './src/screens/ThemeSelectionScreen';
// import FontSelectionScreen from './src/screens/FontSelectionScreen'; // Kaldırıldı
import WriteDiaryStep1Screen from './src/screens/WriteDiaryStep1Screen';
import WriteDiaryStep2Screen from './src/screens/WriteDiaryStep2Screen';
import WriteDiaryStep3Screen from './src/screens/WriteDiaryStep3Screen';
import WellnessTrackingScreen from './src/screens/WellnessTrackingScreen';
import ArchiveScreen from './src/screens/ArchiveScreen';
import TasksScreen from './src/screens/TasksScreen';
import RemindersScreen from './src/screens/RemindersScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  const { currentTheme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: currentTheme.colors.card,
          borderTopWidth: 1,
          borderTopColor: currentTheme.colors.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 80,
        },
        tabBarActiveTintColor: currentTheme.colors.primary,
        tabBarInactiveTintColor: currentTheme.colors.secondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: 'Geçmiş',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          title: 'İstatistikler',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Loading screen can be added here
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="WriteDiary"
              component={WriteDiaryScreen}
              options={{
                headerShown: true,
                title: 'Yeni Günlük',
                headerStyle: {
                  backgroundColor: '#f8fafc',
                },
                headerTintColor: '#1f2937',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
        <Stack.Screen name="ThemeSelection" component={ThemeSelectionScreen} options={{ headerShown: false }} />
        <Stack.Screen name="WriteDiaryStep1" component={WriteDiaryStep1Screen} options={{ headerShown: false }} />
        <Stack.Screen name="WriteDiaryStep2" component={WriteDiaryStep2Screen} options={{ headerShown: false }} />
        <Stack.Screen name="WriteDiaryStep3" component={WriteDiaryStep3Screen} options={{ headerShown: false }} />
        <Stack.Screen name="WellnessTracking" component={WellnessTrackingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Archive" component={ArchiveScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Tasks" component={TasksScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Reminders" component={RemindersScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <AuthProvider>
            <AppNavigator />
            <StatusBar style="auto" />
          </AuthProvider>
        </ThemeProvider>
    </GestureHandlerRootView>
  );
}