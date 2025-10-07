import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DiaryEntry } from '../types';

const DIARY_STORAGE_KEY = 'diary_entries';

export const useDiary = (userId?: string) => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data - son 7 günden günlükler
  const getTodayDate = (daysAgo: number = 0): string => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  };

  const mockEntries: DiaryEntry[] = [
    {
      id: '1',
      title: 'Harika Bir Gün',
      content: 'Bugün çok güzel bir gün geçirdim. Yeni projeme başladım ve çok heyecanlıyım! Sabah erkenden kalktım ve işe koyuldum. Öğlen arkadaşlarla kahve içtik. Akşam yürüyüş yaptım ve kendimi çok iyi hissettim.',
      mood: 5,
      tags: ['heyecan', 'proje', 'yeni başlangıç', 'mutlu', 'başarı'],
      date: getTodayDate(0),
      createdAt: new Date(Date.now()).toISOString(),
      updatedAt: new Date(Date.now()).toISOString(),
    },
    {
      id: '2',
      title: 'Üretken Gün',
      content: 'Bugün arkadaşlarımla çok güzel vakit geçirdim. Yemek yedik, sohbet ettik. Projede iyi ilerleme kaydettim. Akşam kitap okudum ve rahatladım.',
      mood: 4,
      tags: ['arkadaşlık', 'eğlence', 'yemek', 'kitap', 'mutlu'],
      date: getTodayDate(1),
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      title: 'Yorucu Ama İyi',
      content: 'Bugün işte yoğun bir gün geçirdim. Çok yoruldum ama başardım. Akşam dinlendim ve yarına hazırlandım.',
      mood: 4,
      tags: ['iş', 'yorgun', 'başarı'],
      date: getTodayDate(2),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      title: 'Rahat Bir Gün',
      content: 'Bugün evde dinlendim. Film izledim, kitap okudum. Kendime zaman ayırdım.',
      mood: 4,
      tags: ['dinlenme', 'film', 'kitap', 'rahatlama'],
      date: getTodayDate(3),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      title: 'Motivasyon Günü',
      content: 'Bugün çok motive oldum. Yeni hedefler belirledim ve planlar yaptım. Gelecek hakkında heyecanlıyım.',
      mood: 5,
      tags: ['motivasyon', 'hedefler', 'heyecan', 'mutlu'],
      date: getTodayDate(4),
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '6',
      title: 'Normal Bir Gün',
      content: 'Bugün işte normal bir gün geçirdim. Rutin işlerimi yaptım. Akşam hafif bir egzersiz yaptım.',
      mood: 3,
      tags: ['iş', 'rutin', 'egzersiz'],
      date: getTodayDate(5),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '7',
      title: 'Keyifli Hafta Sonu',
      content: 'Bugün hafta sonu olduğu için ailemle vakit geçirdim. Piknik yaptık, doğada yürüdük. Çok güzel bir gündü.',
      mood: 5,
      tags: ['aile', 'hafta sonu', 'piknik', 'doğa', 'mutlu'],
      date: getTodayDate(6),
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const fetchEntries = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // AsyncStorage'dan veri yükle
      const storedEntries = await AsyncStorage.getItem(`${DIARY_STORAGE_KEY}_${userId}`);
      
      if (storedEntries) {
        // Kaydedilmiş veriler varsa onları kullan
        const parsedEntries = JSON.parse(storedEntries);
        setEntries(parsedEntries);
        console.log('Loaded entries from AsyncStorage:', parsedEntries.length);
      } else {
        // İlk kullanımda mock data'yı yükle ve kaydet
        setEntries(mockEntries);
        await AsyncStorage.setItem(`${DIARY_STORAGE_KEY}_${userId}`, JSON.stringify(mockEntries));
        console.log('First time - loaded mock entries:', mockEntries.length);
      }
    } catch (err) {
      console.error('Error fetching entries:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async (entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!userId) throw new Error('User not authenticated');

    try {
      const newEntry: DiaryEntry = {
        id: Date.now().toString(),
        ...entry,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // State'i güncelle
      const updatedEntries = [newEntry, ...entries];
      setEntries(updatedEntries);
      
      // AsyncStorage'a kaydet
      await AsyncStorage.setItem(`${DIARY_STORAGE_KEY}_${userId}`, JSON.stringify(updatedEntries));
      console.log('Entry saved to AsyncStorage:', newEntry.id);
      
      return newEntry;
    } catch (err) {
      console.error('Error adding entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to add entry');
      throw err;
    }
  };

  const updateEntry = async (id: string, updates: Partial<DiaryEntry>) => {
    if (!userId) throw new Error('User not authenticated');
    
    try {
      const updatedEntry: DiaryEntry = {
        ...entries.find(e => e.id === id)!,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // State'i güncelle
      const updatedEntries = entries.map((entry: DiaryEntry) => 
        entry.id === id ? updatedEntry : entry
      );
      setEntries(updatedEntries);
      
      // AsyncStorage'a kaydet
      await AsyncStorage.setItem(`${DIARY_STORAGE_KEY}_${userId}`, JSON.stringify(updatedEntries));
      console.log('Entry updated in AsyncStorage:', id);
      
      return updatedEntry;
    } catch (err) {
      console.error('Error updating entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to update entry');
      throw err;
    }
  };

  const deleteEntry = async (id: string) => {
    if (!userId) throw new Error('User not authenticated');
    
    try {
      // State'i güncelle
      const updatedEntries = entries.filter((entry: DiaryEntry) => entry.id !== id);
      setEntries(updatedEntries);
      
      // AsyncStorage'a kaydet
      await AsyncStorage.setItem(`${DIARY_STORAGE_KEY}_${userId}`, JSON.stringify(updatedEntries));
      console.log('Entry deleted from AsyncStorage:', id);
    } catch (err) {
      console.error('Error deleting entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
      throw err;
    }
  };

  const getEntryByDate = (date: string) => {
    return entries.find((entry: DiaryEntry) => entry.date === date);
  };

  const getEntriesByTag = (tag: string) => {
    return entries.filter((entry: DiaryEntry) => entry.tags.includes(tag));
  };

  const getEntriesByMood = (mood: number) => {
    return entries.filter((entry: DiaryEntry) => entry.mood === mood);
  };

  const getStreak = () => {
    if (entries.length === 0) return 0;

    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      entryDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  useEffect(() => {
    fetchEntries();
  }, [userId]);

  return {
    entries,
    loading,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntryByDate,
    getEntriesByTag,
    getEntriesByMood,
    getStreak,
    refetch: fetchEntries,
  };
};