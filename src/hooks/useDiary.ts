import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DiaryEntry } from '../types';

const DIARY_STORAGE_KEY = 'diary_entries';

export const useDiary = (userId?: string) => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // AsyncStorage'dan veri yükle
      const storedEntries = await AsyncStorage.getItem(`${DIARY_STORAGE_KEY}_${userId}`);
      
      if (storedEntries) {
        // Kaydedilmiş veriler varsa onları kullan
        const parsedEntries = JSON.parse(storedEntries);
        // Duplicate entries'i filtrele (aynı tarih ve benzer içerik)
        const uniqueEntries = parsedEntries.filter((entry: DiaryEntry, index: number, self: DiaryEntry[]) => {
          const firstIndex = self.findIndex((e: DiaryEntry) => 
            e.id === entry.id || (e.date === entry.date && e.title === entry.title && e.content === entry.content)
          );
          return index === firstIndex;
        });
        setEntries(uniqueEntries);
        console.log('Loaded entries from AsyncStorage:', uniqueEntries.length);
      } else {
        // İlk kullanımda boş array ile başla
        setEntries([]);
        console.log('First time - starting with empty entries');
      }
    } catch (err) {
      console.error('Error fetching entries:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addEntry = async (entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!userId) throw new Error('User not authenticated');

    try {
      // Aynı tarihte entry var mı kontrol et
      const existingEntryIndex = entries.findIndex(e => e.date === entry.date);
      
      let updatedEntries: DiaryEntry[];
      let savedEntry: DiaryEntry;

      if (existingEntryIndex >= 0) {
        // Aynı tarihte entry varsa update et
        const existingEntry = entries[existingEntryIndex];
        savedEntry = {
          ...existingEntry,
          ...entry,
          updatedAt: new Date().toISOString(),
        };
        updatedEntries = entries.map((e, index) => 
          index === existingEntryIndex ? savedEntry : e
        );
        console.log('Entry updated (same date):', savedEntry.id);
      } else {
        // Yeni entry ekle
        savedEntry = {
          id: Date.now().toString(),
          ...entry,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        updatedEntries = [savedEntry, ...entries];
        console.log('New entry added:', savedEntry.id);
      }

      // State'i güncelle
      setEntries(updatedEntries);
      
      // AsyncStorage'a kaydet
      await AsyncStorage.setItem(`${DIARY_STORAGE_KEY}_${userId}`, JSON.stringify(updatedEntries));
      console.log('Entry saved to AsyncStorage:', savedEntry.id);
      
      return savedEntry;
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
  }, [fetchEntries]);

  // refetch fonksiyonunu useCallback ile sarmalayarak stable referans sağla
  const refetch = useCallback(async () => {
    await fetchEntries();
    // fetchEntries zaten setEntries çağırıyor, bu yüzden entries state'i güncellenecek
    // Ama bu fonksiyon çağrıldıktan sonra entries'in güncel olması için
    // fetchEntries'in tamamlanmasını beklemek yeterli
  }, [fetchEntries]);

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
    refetch,
  };
};