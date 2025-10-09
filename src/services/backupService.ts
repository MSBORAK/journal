import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BackupData {
  entries: any[];
  profile: any;
  settings: any;
  timestamp: string;
}

export const backupToCloud = async (userId: string): Promise<boolean> => {
  try {
    // 1. Günlük verilerini al
    const { data: entries } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', userId);

    // 2. Profil bilgilerini al
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // 3. Yedek verisini hazırla
    const backupData: BackupData = {
      entries: entries || [],
      profile: profile || null,
      settings: {
        // Ayarlar buraya eklenebilir
        backup_date: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    // 4. Supabase Storage'a yedekle
    const fileName = `backup_${userId}_${Date.now()}.json`;
    const { error } = await supabase.storage
      .from('backups')
      .upload(fileName, JSON.stringify(backupData), {
        contentType: 'application/json',
      });

    if (error) {
      console.error('Backup upload error:', error);
      return false;
    }

    console.log('Backup successful:', fileName);
    return true;
  } catch (error) {
    console.error('Backup error:', error);
    return false;
  }
};

export const restoreFromCloud = async (userId: string): Promise<boolean> => {
  try {
    // Son yedeği bul
    const { data: files } = await supabase.storage
      .from('backups')
      .list(userId, {
        sortBy: { column: 'created_at', order: 'desc' },
        limit: 1,
      });

    if (!files || files.length === 0) {
      throw new Error('No backup found');
    }

    // Yedek dosyasını indir
    const { data, error } = await supabase.storage
      .from('backups')
      .download(files[0].name);

    if (error) {
      throw error;
    }

    // JSON'u parse et
    const text = await data.text();
    const backupData: BackupData = JSON.parse(text);

    // Verileri geri yükle
    if (backupData.entries && backupData.entries.length > 0) {
      // Mevcut verileri sil
      await supabase
        .from('diary_entries')
        .delete()
        .eq('user_id', userId);

      // Yeni verileri ekle
      const { error: insertError } = await supabase
        .from('diary_entries')
        .insert(backupData.entries);

      if (insertError) {
        throw insertError;
      }
    }

    console.log('Restore successful');
    return true;
  } catch (error) {
    console.error('Restore error:', error);
    return false;
  }
};

export const clearAllData = async (userId: string): Promise<boolean> => {
  try {
    // Günlük verilerini sil
    await supabase
      .from('diary_entries')
      .delete()
      .eq('user_id', userId);

    // Profil bilgilerini sil
    await supabase
      .from('profiles')
      .delete()
      .eq('user_id', userId);

    console.log('All data cleared');
    return true;
  } catch (error) {
    console.error('Clear data error:', error);
    return false;
  }
};

export const downloadUserData = async (userId: string): Promise<string | null> => {
  try {
    // 1. Günlük verilerini al
    const { data: entries } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', userId);

    // 2. Profil bilgilerini al
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // 3. Local storage'dan ayarları al
    const settings = {
      reminderTime: await AsyncStorage.getItem('reminderTime'),
      notificationsEnabled: await AsyncStorage.getItem('notificationsEnabled'),
      selectedTheme: await AsyncStorage.getItem('selectedTheme'),
    };

    // 4. Tüm verileri birleştir
    const userData = {
      profile,
      entries: entries || [],
      settings,
      exportDate: new Date().toISOString(),
      userId,
    };

    // 5. JSON string olarak döndür
    return JSON.stringify(userData, null, 2);
  } catch (error) {
    console.error('Error downloading user data:', error);
    return null;
  }
};
