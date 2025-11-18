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
import { recordUserActivity } from './src/services/userActivityService';
import { isOnboardingCompleted, setOnboardingCompleted } from './src/services/onboardingService';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
// import './global.css'; // Disabled for now

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

// Type definitions for navigation
type RootStackParamList = {
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
  Statistics: undefined;
  Insights: undefined;
  History: undefined;
  Tasks: undefined;
  Settings: undefined;
};

// Screens
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
      case 'DreamsGoals':
        return <Ionicons name={focused ? "star" : "star-outline"} {...iconProps} />;
      case 'Statistics':
        return <Ionicons name={focused ? "stats-chart" : "stats-chart-outline"} {...iconProps} />;
      case 'Insights':
        return <Ionicons name={focused ? "bulb" : "bulb-outline"} {...iconProps} />;
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
        name="DreamsGoals"
        component={DreamsGoalsScreen}
        options={{
          title: t('navigation.dreams'),
          tabBarIcon: ({ color, size, focused }) => renderTabIcon('DreamsGoals', focused, color, size),
        }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          title: t('navigation.statistics'),
          tabBarIcon: ({ color, size, focused }) => renderTabIcon('Statistics', focused, color, size),
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          title: t('navigation.insights'),
          tabBarIcon: ({ color, size, focused }) => renderTabIcon('Insights', focused, color, size),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: t('navigation.history'),
          tabBarIcon: ({ color, size, focused }) => renderTabIcon('History', focused, color, size),
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
        name="Settings"
        component={SettingsScreen}
        options={{
          title: t('navigation.settings'),
          tabBarIcon: ({ color, size, focused }) => renderTabIcon('Settings', focused, color, size),
        }}
      />
      </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  const [showOnboarding, setShowOnboarding] = React.useState<boolean | null>(null);
  const [onboardingLoading, setOnboardingLoading] = React.useState<boolean>(true);
  const hasCheckedOnboarding = React.useRef<boolean>(false);
  const navigationRef = useNavigationContainerRef<RootStackParamList>();

  // Render öncesi log - useEffect hook'u her zaman aynı sırada çağrılmalı
  React.useEffect(() => {
    if (showOnboarding !== null && !loading && !onboardingLoading) {
      if (showOnboarding) {
        console.log('📱 [AppNavigator] Rendering ONBOARDING navigator');
      } else {
        console.log('📱 [AppNavigator] Rendering MAIN TABS navigator');
      }
    }
  }, [showOnboarding, loading, onboardingLoading]);

  // Onboarding sadece 1 kez kontrol edilecek - Nihai Garantili Çözüm
  // ✅ hasCheckedOnboarding kontrolü ile sadece bir kez çalışır
  // ✅ loading ve user dependency'leri var ama hasCheckedOnboarding kontrolü ile skip edilir
  React.useEffect(() => {
    console.log('🔄 [AppNavigator] useEffect TRIGGERED', {
      hasChecked: hasCheckedOnboarding.current,
      loading,
      userId: user?.uid,
      showOnboarding,
      timestamp: new Date().toISOString(),
    });

    // Eğer zaten kontrol edildiyse, hiçbir şey yapma
    if (hasCheckedOnboarding.current) {
      console.log('⏩ [AppNavigator] Already checked onboarding, skipping useEffect');
      return;
    }

    // Loading bitene kadar bekle
    if (loading) {
      console.log('⏳ [AppNavigator] Still loading, waiting...', { loading });
      return;
    }

    let isMounted = true;

    const checkOnboarding = async () => {
      console.log('🔍 [AppNavigator] checkOnboarding called', {
        hasChecked: hasCheckedOnboarding.current,
        loading,
        userId: user?.uid,
        showOnboarding,
      });

      // Eğer zaten kontrol edildiyse, skip et (double check)
      if (hasCheckedOnboarding.current) {
        console.log('⏩ [AppNavigator] Already checked, skipping');
        return;
      }

      try {
        // Önce user-specific key'i kontrol et, sonra genel key'i
        let completed = false;
        
        if (user?.uid) {
          console.log('👤 [AppNavigator] Checking user-specific onboarding:', user.uid);
          completed = await isOnboardingCompleted(user.uid);
          console.log('📊 [AppNavigator] User-specific result:', completed);
          // Eğer user-specific key yoksa, genel key'i kontrol et (eski anonim kullanıcılar için)
          if (!completed) {
            console.log('🔍 [AppNavigator] Checking general onboarding key');
            completed = await isOnboardingCompleted();
            console.log('📊 [AppNavigator] General key result:', completed);
          }
        } else {
          // User yoksa genel key'i kontrol et (anonim kullanıcı oluşturulana kadar)
          console.log('👤 [AppNavigator] No user, checking general onboarding key');
          completed = await isOnboardingCompleted();
          console.log('📊 [AppNavigator] General key result:', completed);
        }
        
        if (isMounted && !hasCheckedOnboarding.current) {
          console.log(`📋 [AppNavigator] Onboarding check → ${completed ? 'completed' : 'not completed'}`);
          console.log(`🎯 [AppNavigator] Setting showOnboarding to: ${!completed}`);
          setShowOnboarding(!completed);
          setOnboardingLoading(false);
          hasCheckedOnboarding.current = true; // 🔒 Artık tekrar kontrol yapılmaz
          console.log('✅ [AppNavigator] Onboarding check completed, hasCheckedOnboarding = true');
        }
      } catch (error) {
        console.error('❌ [AppNavigator] Error checking onboarding:', error);
        if (isMounted && !hasCheckedOnboarding.current) {
          setShowOnboarding(true);
          setOnboardingLoading(false);
          hasCheckedOnboarding.current = true;
        }
      }
    };

    checkOnboarding();

    return () => {
      isMounted = false;
    };
  }, [loading]); // ✅ SADECE loading değiştiğinde - user?.uid dependency'si kaldırıldı çünkü user değiştiğinde tekrar kontrol yapmaya gerek yok

  // ✅ Onboarding tamamlanınca
  const handleOnboardingComplete = async () => {
    console.log('🎉 [AppNavigator] handleOnboardingComplete called', {
      userId: user?.uid,
      currentShowOnboarding: showOnboarding,
      hasChecked: hasCheckedOnboarding.current,
    });

    // ÖNCE hasCheckedOnboarding'ı set et ki useEffect hiçbir şey yapmasın
    hasCheckedOnboarding.current = true;
    console.log('🔒 [AppNavigator] Setting hasCheckedOnboarding = true (FIRST)');

    try {
      // AsyncStorage'a kaydet
      if (user?.uid) {
        console.log('💾 [AppNavigator] Saving onboarding completed for user:', user.uid);
        await setOnboardingCompleted(user.uid);
      } else {
        console.log('💾 [AppNavigator] Saving onboarding completed (general key)');
        await setOnboardingCompleted();
      }
      
      // AsyncStorage'a yazılması için kısa bir delay
      console.log('⏳ [AppNavigator] Waiting 100ms for AsyncStorage write...');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // State'i BATCH olarak güncelle - React'in state batching'i kullan
      // Bu sayede tek bir re-render olur ve flash olmaz
      console.log('🚪 [AppNavigator] Setting showOnboarding = false and onboardingLoading = false');
      React.startTransition(() => {
        setShowOnboarding(false);
        setOnboardingLoading(false);
      });
      
      console.log('✅ [AppNavigator] Onboarding tamamlandı, dashboard açılıyor...', {
        showOnboarding: false,
        hasChecked: hasCheckedOnboarding.current,
      });
    } catch (error) {
      console.error('❌ [AppNavigator] Hata onboarding tamamlanırken:', error);
      // Hata olsa bile onboarding'i kapat
      React.startTransition(() => {
        setShowOnboarding(false);
        setOnboardingLoading(false);
      });
    }
  };

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

  // Loading durumunda veya onboarding kontrolü yapılırken boş ekran göster
  // AMA hook'lar her zaman çağrılmalı, bu yüzden conditional return YOK
  const shouldShowLoading = loading || onboardingLoading || showOnboarding === null;
  
  if (shouldShowLoading) {
    console.log('⏸️ [AppNavigator] Loading state - not rendering', {
      loading,
      onboardingLoading,
      showOnboarding,
    });
  } else {
    console.log('🎬 [AppNavigator] Rendering navigator', {
      showOnboarding,
      hasChecked: hasCheckedOnboarding.current,
      userId: user?.uid,
    });
  }

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      {shouldShowLoading ? (
        // Loading durumunda boş ekran - ama hook'lar zaten çağrıldı
        null
      ) : showOnboarding ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Onboarding">
            {() => <OnboardingScreen onComplete={handleOnboardingComplete} />}
          </Stack.Screen>
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
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
        </Stack.Navigator>
      )}
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