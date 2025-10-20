import AsyncStorage from '@react-native-async-storage/async-storage';

export const debugStorage = async () => {
  try {
    console.log('=== DEBUG STORAGE ===');
    
    const tasks = await AsyncStorage.getItem('daily_tasks');
    console.log('Tasks:', tasks);
    
    const reminders = await AsyncStorage.getItem('daily_reminders');
    console.log('Reminders:', reminders);
    
    const theme = await AsyncStorage.getItem('selected_theme');
    console.log('Theme:', theme);
    
    const language = await AsyncStorage.getItem('selected_language');
    console.log('Language:', language);
    
    console.log('=== END DEBUG ===');
  } catch (error) {
    console.error('Debug storage error:', error);
  }
};
