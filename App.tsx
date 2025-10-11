import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './src/i18n/LanguageContext';
import { TimerProvider } from './src/contexts/TimerContext';
import { PomodoroProvider } from './src/contexts/PomodoroContext';
import FloatingTimer from './src/components/FloatingTimer';
import GlobalFloatingPomodoro from './src/components/GlobalFloatingPomodoro';
import BackgroundWrapper from './src/components/BackgroundWrapper';
// import { FontProvider } from './src/contexts/FontContext'; // Kaldırıldı
import { Ionicons } from '@expo/vector-icons';
import { scheduleMotivationNotifications, requestNotificationPermission, scheduleSmartNotifications } from './src/services/motivationNotificationService';
import { recordUserActivity } from './src/services/userActivityService';
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
  LanguageSelection: undefined;
  WellnessTracking: undefined;
  Archive: undefined;
  Tasks: undefined;
  Reminders: undefined;
  DataBackupSettings: undefined;
  AccountSettings: undefined;
  PrivacySecuritySettings: undefined;
  AppSettings: undefined;
  NotificationSettings: undefined;
  Achievements: undefined;
};

type TabParamList = {
  Dashboard: undefined;
  DreamsGoals: undefined;
  History: undefined;
  Statistics: undefined;
  Reminders: undefined;
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
import LanguageSelectionScreen from './src/screens/LanguageSelectionScreen';
// import FontSelectionScreen from './src/screens/FontSelectionScreen'; // Kaldırıldı
import WriteDiaryStep1Screen from './src/screens/WriteDiaryStep1Screen';
import WriteDiaryStep2Screen from './src/screens/WriteDiaryStep2Screen';
import WriteDiaryStep3Screen from './src/screens/WriteDiaryStep3Screen';
import WellnessTrackingScreen from './src/screens/WellnessTrackingScreen';
import ArchiveScreen from './src/screens/ArchiveScreen';
import TasksScreen from './src/screens/TasksScreen';
import RemindersScreen from './src/screens/RemindersScreen';
import DreamsGoalsScreen from './src/screens/DreamsGoalsScreen';
import DataBackupSettingsScreen from './src/screens/DataBackupSettingsScreen';
import AccountSettingsScreen from './src/screens/AccountSettingsScreen';
import PrivacySecuritySettingsScreen from './src/screens/PrivacySecuritySettingsScreen';
import AppSettingsScreen from './src/screens/AppSettingsScreen';
import NotificationSettingsScreen from './src/screens/NotificationSettingsScreen';
import AchievementsScreen from './src/screens/AchievementsScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
  
  // Bildirimleri başlat
  useEffect(() => {
    const initNotifications = async () => {
      try {
        const hasPermission = await requestNotificationPermission();
        if (hasPermission) {
          await scheduleMotivationNotifications();
          await scheduleSmartNotifications();
          await recordUserActivity('app_launch');
          console.log('✅ Tüm bildirimler başlatıldı!');
        }
      } catch (error) {
        console.error('❌ Bildirimler başlatılamadı:', error);
      }
    };
    
    initNotifications();
  }, []);
  
  return (
    <BackgroundWrapper>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: currentTheme.colors.card,
            borderTopWidth: 0,
            borderTopColor: 'transparent',
            paddingTop: 12,
            paddingBottom: 12,
            height: 85,
            shadowColor: currentTheme.colors.primary,
            shadowOffset: { width: 0, height: -12 },
            shadowOpacity: 0.3,
            shadowRadius: 24,
            elevation: 16,
            borderRadius: 28,
            marginHorizontal: 12,
            marginBottom: 24,
            position: 'absolute',
            borderWidth: 1,
            borderColor: currentTheme.colors.border + '40',
          },
          tabBarActiveTintColor: currentTheme.colors.primary,
          tabBarInactiveTintColor: currentTheme.colors.secondary,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 4,
          },
        }}
      >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: t('dashboard.title'),
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size + 4} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="DreamsGoals"
        component={DreamsGoalsScreen}
        options={{
          title: 'Hayaller',
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons name={focused ? "star" : "star-outline"} size={size + 4} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          title: 'İstatistikler',
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons name={focused ? "stats-chart" : "stats-chart-outline"} size={size + 4} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: t('history.title'),
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons name={focused ? "calendar" : "calendar-outline"} size={size + 4} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Reminders"
        component={RemindersScreen}
        options={{
          title: 'Alarmlar',
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons name={focused ? "alarm" : "alarm-outline"} size={size + 4} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: t('settings.title'),
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} size={size + 4} color={color} />
          ),
        }}
      />
      </Tab.Navigator>
    </BackgroundWrapper>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const { currentTheme } = useTheme();

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
                title: t('diary.writeEntry'),
                headerStyle: {
                  backgroundColor: currentTheme.colors.card,
                },
                headerTintColor: currentTheme.colors.text,
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
        <Stack.Screen name="ThemeSelection" component={ThemeSelectionScreen} options={{ headerShown: false }} />
        <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} options={{ headerShown: false }} />
        <Stack.Screen name="WriteDiaryStep1" component={WriteDiaryStep1Screen} options={{ headerShown: false }} />
        <Stack.Screen name="WriteDiaryStep2" component={WriteDiaryStep2Screen} options={{ headerShown: false }} />
        <Stack.Screen name="WriteDiaryStep3" component={WriteDiaryStep3Screen} options={{ headerShown: false }} />
        <Stack.Screen name="WellnessTracking" component={WellnessTrackingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Archive" component={ArchiveScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Tasks" component={TasksScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Reminders" component={RemindersScreen} options={{ headerShown: false }} />
        <Stack.Screen name="DataBackupSettings" component={DataBackupSettingsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PrivacySecuritySettings" component={PrivacySecuritySettingsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AppSettings" component={AppSettingsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Achievements" component={AchievementsScreen} options={{ headerShown: false }} />
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
        <LanguageProvider>
          <ThemeProvider>
            <TimerProvider>
              <PomodoroProvider>
                <AuthProvider>
                  <AppNavigator />
                  <FloatingTimer />
                  <GlobalFloatingPomodoro />
                  <StatusBar style="auto" />
                </AuthProvider>
              </PomodoroProvider>
            </TimerProvider>
          </ThemeProvider>
        </LanguageProvider>
    </GestureHandlerRootView>
  );
}