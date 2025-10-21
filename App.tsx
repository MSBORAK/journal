import React, { useEffect, useMemo, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './src/contexts/LanguageContext';
import { TimerProvider } from './src/contexts/TimerContext';
import { PomodoroProvider } from './src/contexts/PomodoroContext';
import GlobalFloatingPomodoro from './src/components/GlobalFloatingPomodoro';
import BackgroundWrapper from './src/components/BackgroundWrapper';
// import { FontProvider } from './src/contexts/FontContext'; // Kaldırıldı
import { Ionicons } from '@expo/vector-icons';
import { scheduleMotivationNotifications, requestNotificationPermission, scheduleSmartNotifications } from './src/services/motivationNotificationService';
import { recordUserActivity } from './src/services/userActivityService';
import { isOnboardingCompleted } from './src/services/onboardingService';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
// import './global.css'; // Disabled for now

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

// Type definitions for navigation
type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
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
  Mindfulness: undefined;
  HelpGuide: undefined;
  DiaryDetail: { entry: any };
};

type TabParamList = {
  Dashboard: undefined;
  DreamsGoals: undefined;
  History: undefined;
  Statistics: undefined;
  Tasks: undefined;
  Settings: undefined;
};

// Screens
import AuthScreen from './src/screens/AuthScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import WriteDiaryScreen from './src/screens/WriteDiaryScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import DiaryDetailScreen from './src/screens/DiaryDetailScreen';
import StatisticsScreen from './src/screens/StatisticsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ThemeSelectionScreen from './src/screens/ThemeSelectionScreen';
import LanguageSelectionScreen from './src/screens/LanguageSelectionScreen';
import WriteDiaryStep1Screen from './src/screens/WriteDiaryStep1Screen';
import WriteDiaryStep2Screen from './src/screens/WriteDiaryStep2Screen';
import WriteDiaryStep3Screen from './src/screens/WriteDiaryStep3Screen';
import WellnessTrackingScreen from './src/screens/WellnessTrackingScreen';
import ArchiveScreen from './src/screens/ArchiveScreen';
import TasksScreen from './src/screens/TasksScreen';
import TasksAndRemindersScreen from './src/screens/TasksAndRemindersScreen';
import RemindersScreen from './src/screens/RemindersScreen';
import DreamsGoalsScreen from './src/screens/DreamsGoalsScreen';
import DataBackupSettingsScreen from './src/screens/DataBackupSettingsScreen';
import AccountSettingsScreen from './src/screens/AccountSettingsScreen';
import PrivacySecuritySettingsScreen from './src/screens/PrivacySecuritySettingsScreen';
import AppSettingsScreen from './src/screens/AppSettingsScreen';
import NotificationSettingsScreen from './src/screens/NotificationSettingsScreen';
import AchievementsScreen from './src/screens/AchievementsScreen';
import MindfulnessScreen from './src/screens/MindfulnessScreen';
import HelpGuideScreen from './src/screens/HelpGuideScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
  
  // Tab icon'larını memoize et
  const renderTabIcon = useCallback((name: string, focused: boolean, color: string, size: number) => {
    const iconProps = { color, size: size + 4 };
    switch (name) {
      case 'Dashboard':
        return <Ionicons name={focused ? "home" : "home-outline"} {...iconProps} />;
      case 'DreamsGoals':
        return <Ionicons name={focused ? "star" : "star-outline"} {...iconProps} />;
      case 'Statistics':
        return <Ionicons name={focused ? "stats-chart" : "stats-chart-outline"} {...iconProps} />;
      case 'History':
        return <Ionicons name={focused ? "calendar" : "calendar-outline"} {...iconProps} />;
      case 'Tasks':
        return <Ionicons name={focused ? "checkmark-circle" : "checkmark-circle-outline"} {...iconProps} />;
      case 'Settings':
        return <Ionicons name={focused ? "settings" : "settings-outline"} {...iconProps} />;
      default:
        return <Ionicons name="help-outline" {...iconProps} />;
    }
  }, []);
  
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
            elevation: 8,
            shadowColor: currentTheme.colors.shadow,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            paddingBottom: 20,
            paddingTop: 12,
            height: 90,
            borderTopColor: currentTheme.colors.border + '33',
          },
          tabBarItemStyle: {
            paddingVertical: 4,
            paddingHorizontal: 2,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: 2,
            marginBottom: 2,
          },
          tabBarActiveTintColor: currentTheme.colors.text,
          tabBarInactiveTintColor: currentTheme.colors.text + '99',
          tabBarIconStyle: {
            marginBottom: 4,
          },
        }}
      >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: t('dashboard.title'),
          tabBarIcon: ({ color, size, focused }) => renderTabIcon('Dashboard', focused, color, size),
        }}
      />
      <Tab.Screen
        name="DreamsGoals"
        component={DreamsGoalsScreen}
        options={{
          title: 'Hayaller',
          tabBarIcon: ({ color, size, focused }) => renderTabIcon('DreamsGoals', focused, color, size),
        }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          title: 'İstatistikler',
          tabBarIcon: ({ color, size, focused }) => renderTabIcon('Statistics', focused, color, size),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: t('history.title'),
          tabBarIcon: ({ color, size, focused }) => renderTabIcon('History', focused, color, size),
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksAndRemindersScreen}
        options={{
          title: 'Görevler',
          tabBarIcon: ({ color, size, focused }) => renderTabIcon('Tasks', focused, color, size),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: t('settings.title'),
          tabBarIcon: ({ color, size, focused }) => renderTabIcon('Settings', focused, color, size),
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
  const [showOnboarding, setShowOnboarding] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkOnboarding = async () => {
      if (user && !loading) {
        const completed = await isOnboardingCompleted(user.uid);
        setShowOnboarding(!completed);
      } else if (!user && !loading) {
        setShowOnboarding(false);
      }
    };
    
    checkOnboarding();
  }, [user, loading]);

  if (loading || showOnboarding === null) {
    return null; // Loading screen can be added here
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          // Performans için animasyonları basitleştir
          cardStyleInterpolator: ({ current }) => ({
            cardStyle: {
              opacity: current.progress,
            },
          }),
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 200, // Daha hızlı geçiş
              },
            },
            close: {
              animation: 'timing',
              config: {
                duration: 150, // Daha hızlı geçiş
              },
            },
          },
        }}
      >
        {showOnboarding ? (
          <Stack.Screen name="Onboarding">
            {() => <OnboardingScreen onComplete={handleOnboardingComplete} />}
          </Stack.Screen>
        ) : user ? (
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
        <Stack.Screen name="DataBackupSettings" component={DataBackupSettingsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PrivacySecuritySettings" component={PrivacySecuritySettingsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AppSettings" component={AppSettingsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Achievements" component={AchievementsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Mindfulness" component={MindfulnessScreen} options={{ headerShown: false }} />
        <Stack.Screen name="HelpGuide" component={HelpGuideScreen} options={{ headerShown: false }} />
        <Stack.Screen name="DiaryDetail" component={DiaryDetailScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <LanguageProvider>
          <ThemeProvider>
            <TimerProvider>
              <PomodoroProvider>
                <AuthProvider>
                  <AppNavigator />
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