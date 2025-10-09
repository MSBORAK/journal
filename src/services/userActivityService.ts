import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_ACTIVITY_KEY = 'last_user_activity';
const TASK_REMINDER_KEY = 'task_reminder_scheduled';

interface UserActivity {
  lastAppLaunch: string;
  lastTaskCreated?: string;
  pendingTaskReminders: string[];
}

// Son aktiviteyi kaydet
export const recordUserActivity = async (activityType: 'app_launch' | 'task_created'): Promise<void> => {
  try {
    const now = new Date().toISOString();
    const stored = await AsyncStorage.getItem(LAST_ACTIVITY_KEY);
    
    let activity: UserActivity = stored ? JSON.parse(stored) : {
      lastAppLaunch: now,
      pendingTaskReminders: []
    };
    
    if (activityType === 'app_launch') {
      activity.lastAppLaunch = now;
    } else if (activityType === 'task_created') {
      activity.lastTaskCreated = now;
      // 2 saat sonra görev hatırlatıcısı zamanla
      await scheduleTaskReminder();
    }
    
    await AsyncStorage.setItem(LAST_ACTIVITY_KEY, JSON.stringify(activity));
    console.log(`✅ User activity recorded: ${activityType}`);
  } catch (error) {
    console.error('❌ Error recording user activity:', error);
  }
};

// Son aktiviteyi al
export const getLastActivity = async (): Promise<UserActivity | null> => {
  try {
    const stored = await AsyncStorage.getItem(LAST_ACTIVITY_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('❌ Error getting last activity:', error);
    return null;
  }
};

// Kullanıcı ne kadar süredir gelmemiş kontrol et
export const getInactiveDays = async (): Promise<number> => {
  try {
    const activity = await getLastActivity();
    if (!activity) return 0;
    
    const lastLaunch = new Date(activity.lastAppLaunch);
    const now = new Date();
    const diffTime = now.getTime() - lastLaunch.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
    console.error('❌ Error calculating inactive days:', error);
    return 0;
  }
};

// Görev hatırlatıcısı zamanla
const scheduleTaskReminder = async (): Promise<void> => {
  try {
    const { sendTaskReminderNotification } = await import('./motivationNotificationService');
    
    // 2 saat sonra hatırlat
    const reminderTime = new Date();
    reminderTime.setHours(reminderTime.getHours() + 2);
    
    await AsyncStorage.setItem(TASK_REMINDER_KEY, reminderTime.toISOString());
    console.log('✅ Task reminder scheduled for 2 hours later');
  } catch (error) {
    console.error('❌ Error scheduling task reminder:', error);
  }
};

// Zamanlanmış görev hatırlatıcısını kontrol et
export const checkScheduledTaskReminder = async (): Promise<void> => {
  try {
    const reminderTimeStr = await AsyncStorage.getItem(TASK_REMINDER_KEY);
    if (!reminderTimeStr) return;
    
    const reminderTime = new Date(reminderTimeStr);
    const now = new Date();
    
    // Hatırlatma zamanı geldi mi?
    if (now >= reminderTime) {
      const { sendTaskReminderNotification } = await import('./motivationNotificationService');
      await sendTaskReminderNotification();
      await AsyncStorage.removeItem(TASK_REMINDER_KEY);
      console.log('✅ Scheduled task reminder sent');
    }
  } catch (error) {
    console.error('❌ Error checking scheduled task reminder:', error);
  }
};

// Kullanıcı aktivite kontrolü ve bildirim gönderimi
export const checkUserActivityAndNotify = async (): Promise<void> => {
  try {
    const inactiveDays = await getInactiveDays();
    
    // Eğer 1 gün veya daha fazla gelmemişse
    if (inactiveDays >= 1) {
      const { sendMissingUserNotification } = await import('./motivationNotificationService');
      
      // Sadece belirli günlerde gönder (spam olmasın)
      const shouldNotify = inactiveDays === 1 || inactiveDays === 3 || inactiveDays === 7 || inactiveDays % 7 === 0;
      
      if (shouldNotify) {
        await sendMissingUserNotification();
        console.log(`✅ Missing user notification sent for ${inactiveDays} days inactive`);
      }
    }
    
    // Zamanlanmış görev hatırlatıcısını kontrol et
    await checkScheduledTaskReminder();
  } catch (error) {
    console.error('❌ Error checking user activity:', error);
  }
};
