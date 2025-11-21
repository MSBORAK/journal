import React, { useEffect, useMemo, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Linking } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
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
import { scheduleAllNotifications, requestNotificationPermissions } from './src/services/notificationService';
import * as Notifications from 'expo-notifications';
import { recordUserActivity } from './src/services/userActivityService';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { DMSerifText_400Regular } from '@expo-google-fonts/dm-serif-text';
import { BodoniModa_400Regular, BodoniModa_700Bold } from '@expo-google-fonts/bodoni-moda';
import * as SplashScreen from 'expo-splash-screen';
// import './global.css'; // Disabled for now

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

// Type definitions for navigation
type RootStackParamList = {
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
  Journal: undefined;
  DreamsGoals: undefined;
  Tasks: undefined;
  Analytics: undefined;
};

// Screens
import DashboardScreen from './src/screens/DashboardScreen';
import WriteDiaryScreen from './src/screens/WriteDiaryScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import DiaryDetailScreen from './src/screens/DiaryDetailScreen';
import StatisticsScreen from './src/screens/StatisticsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import JournalScreen from './src/screens/JournalScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
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
import InsightsScreen from './src/screens/InsightsScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { t } = useLanguage();
  
  // Tab icon'larını memoize et
  const renderTabIcon = useCallback((name: string, focused: boolean, color: string, size: number) => {
    const iconProps = { color, size: size + 4 };
    switch (name) {
      case 'Dashboard':
        return <Ionicons name={focused ? "home" : "home-outline"} {...iconProps} />;
      case 'Journal':
        return <Ionicons name={focused ? "book" : "book-outline"} {...iconProps} />;
      case 'DreamsGoals':
        return <Ionicons name={focused ? "star" : "star-outline"} {...iconProps} />;
      case 'Tasks':
        return <Ionicons name={focused ? "checkmark-circle" : "checkmark-circle-outline"} {...iconProps} />;
      case 'Analytics':
        return <Ionicons name={focused ? "analytics" : "analytics-outline"} {...iconProps} />;
      default:
        return <Ionicons name="help-outline" {...iconProps} />;
    }
  }, []);
  
  // Bildirimleri başlat
  useEffect(() => {
    const initNotifications = async () => {
      try {
        const hasPermission = await requestNotificationPermissions();
        if (hasPermission) {
          // Tek merkezi scheduler ile tüm bildirimleri planla
          await scheduleAllNotifications(user?.uid);
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
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          // Tab geçişlerini hızlandır - lazy loading'i kapat (tüm tab'lar önceden yüklensin)
          lazy: false,
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
          title: t('navigation.dashboard'),
          tabBarIcon: ({ color, size, focused }) => renderTabIcon('Dashboard', focused, color, size),
        }}
      />
      <Tab.Screen
        name="Journal"
        component={JournalScreen}
        options={{
          title: t('navigation.journal') || 'Günlük',
          tabBarIcon: ({ color, size, focused }) => renderTabIcon('Journal', focused, color, size),
        }}
      />
      <Tab.Screen
        name="DreamsGoals"
        component={DreamsGoalsScreen}
        options={{
          title: t('navigation.dreams') || 'Hedefler',
          tabBarIcon: ({ color, size, focused }) => renderTabIcon('DreamsGoals', focused, color, size),
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksAndRemindersScreen}
        options={{
          title: t('navigation.tasks'),
          tabBarIcon: ({ color, size, focused }) => renderTabIcon('Tasks', focused, color, size),
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          title: t('navigation.analytics') || 'Analiz',
          tabBarIcon: ({ color, size, focused }) => renderTabIcon('Analytics', focused, color, size),
        }}
      />
      </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  const navigationRef = useNavigationContainerRef<RootStackParamList>();

  // Notification response handler (CTA)
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('📱 Notification tapped:', data);
      
      if (data?.action && data?.screen) {
        // Navigate to the specified screen
        if (data.action === 'openMindfulness' || data.action === 'openBreathing') {
          navigationRef.current?.navigate('Mindfulness' as never);
        }
      }
    });

    return () => subscription.remove();
  }, [navigationRef]);

  // Deep linking configuration
  const linking = {
    prefixes: ['rhythm://'],
    config: {
      screens: {},
    },
    async getInitialURL() {
      const url = await Linking.getInitialURL();
      console.log('🔗 App - Initial URL:', url);
      return url;
    },
    subscribe(listener: (url: string) => void) {
      const onReceiveURL = ({ url }: { url: string }) => {
        console.log('🔗 App - Deep link received:', url);
        listener(url);
      };
      const subscription = Linking.addEventListener('url', onReceiveURL);
      Linking.getInitialURL().then((url) => {
        if (url) {
          console.log('🔗 App - Initial URL found:', url);
          listener(url);
        }
      });
      return () => {
        subscription.remove();
      };
    },
  };

  // Loading kontrolü
  if (loading) {
    return null;
  }

  // Optimized transition config for faster navigation
  const transitionConfig = {
    transitionSpec: {
      open: {
        animation: 'timing' as const,
        config: {
          duration: 200, // Daha hızlı geçiş (default 300ms)
        },
      },
      close: {
        animation: 'timing' as const,
        config: {
          duration: 200, // Daha hızlı geçiş (default 300ms)
        },
      },
    },
    cardStyleInterpolator: ({ current, layouts }: any) => {
      return {
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width, 0],
              }),
            },
          ],
        },
      };
    },
  };

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          ...transitionConfig,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      >
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
                ...transitionConfig,
              }}
            />
            <Stack.Screen 
              name="ThemeSelection" 
              component={ThemeSelectionScreen} 
              options={{ headerShown: false, ...transitionConfig }} 
            />
            <Stack.Screen 
              name="LanguageSelection" 
              component={LanguageSelectionScreen} 
              options={{ headerShown: false, ...transitionConfig }} 
            />
            <Stack.Screen 
              name="WriteDiaryStep1" 
              component={WriteDiaryStep1Screen} 
              options={{ headerShown: false, ...transitionConfig }} 
            />
            <Stack.Screen 
              name="WriteDiaryStep2" 
              component={WriteDiaryStep2Screen} 
              options={{ headerShown: false, ...transitionConfig }} 
            />
            <Stack.Screen 
              name="WriteDiaryStep3" 
              component={WriteDiaryStep3Screen} 
              options={{ headerShown: false, ...transitionConfig }} 
            />
            <Stack.Screen 
              name="WellnessTracking" 
              component={WellnessTrackingScreen} 
              options={{ headerShown: false, ...transitionConfig }} 
            />
            <Stack.Screen 
              name="Archive" 
              component={ArchiveScreen} 
              options={{ headerShown: false, ...transitionConfig }} 
            />
            <Stack.Screen 
              name="Tasks" 
              component={TasksScreen} 
              options={{ headerShown: false, ...transitionConfig }} 
            />
            <Stack.Screen 
              name="DataBackupSettings" 
              component={DataBackupSettingsScreen} 
              options={{ headerShown: false, ...transitionConfig }} 
            />
            <Stack.Screen 
              name="AccountSettings" 
              component={AccountSettingsScreen} 
              options={{ headerShown: false, ...transitionConfig }} 
            />
            <Stack.Screen 
              name="PrivacySecuritySettings" 
              component={PrivacySecuritySettingsScreen} 
              options={{ headerShown: false, ...transitionConfig }} 
            />
            <Stack.Screen 
              name="AppSettings" 
              component={AppSettingsScreen} 
              options={{ headerShown: false, ...transitionConfig }} 
            />
            <Stack.Screen 
              name="NotificationSettings" 
              component={NotificationSettingsScreen} 
              options={{ headerShown: false, ...transitionConfig }} 
            />
            <Stack.Screen 
              name="Achievements" 
              component={AchievementsScreen} 
              options={{ headerShown: false, ...transitionConfig }} 
            />
            <Stack.Screen 
              name="Mindfulness" 
              component={MindfulnessScreen} 
              options={{ headerShown: false, ...transitionConfig }} 
            />
            <Stack.Screen 
              name="HelpGuide" 
              component={HelpGuideScreen} 
              options={{ headerShown: false, ...transitionConfig }} 
            />
            <Stack.Screen 
              name="DiaryDetail" 
              component={DiaryDetailScreen} 
              options={{ headerShown: false, ...transitionConfig }} 
            />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    DMSerifText_400Regular,
    BodoniModa_400Regular,
    BodoniModa_700Bold,
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