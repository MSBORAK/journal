import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { DiaryEntry } from '../types';
import { isNetworkError, getNetworkErrorMessage } from '../utils/networkUtils';

const DIARY_STORAGE_KEY = 'diary_entries';

export const useDiary = (userId?: string) => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      
      // userId varsa önce Supabase'den veri çek
      if (userId) {
        try {
          const { data: supabaseEntries, error: supabaseError } = await supabase
            .from('diary_entries')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (supabaseError) {
            // Network hatası ise sessizce handle et (kullanıcıya gösterme)
            if (isNetworkError(supabaseError)) {
              console.warn('⚠️ Network error (offline mode):', supabaseError.message);
              // Network hatasında error state'ini set etme, sadece AsyncStorage'dan yükle
            } else {
              console.error('Supabase fetch error:', supabaseError);
            }
            // Hata olsa bile AsyncStorage'dan yüklemeyi dene
          } else if (supabaseEntries && supabaseEntries.length > 0) {
            // Supabase'den veri geldi, formatla ve kullan
            const formattedEntries: DiaryEntry[] = supabaseEntries.map((entry: any) => ({
              id: entry.id,
              title: entry.title,
              content: entry.content,
              mood: entry.mood,
              tags: entry.tags || [],
              date: entry.date,
              createdAt: entry.created_at,
              updatedAt: entry.updated_at,
            }));
            
            setEntries(formattedEntries);
            // AsyncStorage'a da kaydet (offline için)
            await AsyncStorage.setItem(`${DIARY_STORAGE_KEY}_${userId}`, JSON.stringify(formattedEntries));
            console.log('✅ Loaded entries from Supabase:', formattedEntries.length);
            setLoading(false);
            return;
          }
        } catch (supabaseErr) {
          // Network hatası ise sessizce handle et (kullanıcıya gösterme)
          if (isNetworkError(supabaseErr)) {
            console.warn('⚠️ Network error (offline mode):', supabaseErr);
            // Network hatasında error state'ini set etme
          } else {
            console.error('Supabase connection error:', supabaseErr);
          }
          // Supabase'e bağlanamazsa AsyncStorage'dan yükle
        }
      }
      
      // Supabase'den veri gelmediyse veya userId yoksa AsyncStorage'dan yükle
      const storageKey = userId ? `${DIARY_STORAGE_KEY}_${userId}` : DIARY_STORAGE_KEY;
      const storedEntries = await AsyncStorage.getItem(storageKey);
      
      if (storedEntries) {
        const parsedEntries = JSON.parse(storedEntries);
        const uniqueEntries = parsedEntries.filter((entry: DiaryEntry, index: number, self: DiaryEntry[]) => {
          const firstIndex = self.findIndex((e: DiaryEntry) => 
            e.id === entry.id || (e.date === entry.date && e.title === entry.title && e.content === entry.content)
          );
          return index === firstIndex;
        });
        setEntries(uniqueEntries);
        console.log('📦 Loaded entries from AsyncStorage:', uniqueEntries.length);
        // Offline modda veri yüklendi, error state'ini temizle
        setError(null);
      } else {
        setEntries([]);
        console.log('🆕 First time - starting with empty entries');
      }
    } catch (err) {
      // Network hatası ise sessizce handle et
      if (isNetworkError(err)) {
        console.warn('⚠️ Network error fetching entries (offline mode):', err);
        // Network hatasında error state'ini set etme
        setError(null);
      } else {
        console.error('Error fetching entries:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addEntry = async (entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Aynı tarihte entry var mı kontrol et
      const existingEntryIndex = entries.findIndex(e => e.date === entry.date);
      
      let updatedEntries: DiaryEntry[];
      let savedEntry: DiaryEntry;

      if (existingEntryIndex >= 0) {
        // Aynı tarihte entry varsa update et
        const existingEntry = entries[existingEntryIndex];
        
        // Supabase'de güncelle (userId varsa)
        if (userId) {
          try {
            const { data: updatedData, error: updateError } = await supabase
              .from('diary_entries')
              .update({
                title: entry.title,
                content: entry.content,
                mood: entry.mood,
                tags: entry.tags || [],
                updated_at: new Date().toISOString(),
              })
              .eq('id', existingEntry.id)
              .eq('user_id', userId)
              .select()
              .single();

            if (updateError) {
              console.error('Supabase update error:', updateError);
              if (!isNetworkError(updateError)) {
                throw updateError;
              }
              // Network hatası ise local'e kaydet
            } else if (updatedData) {
              savedEntry = {
                id: updatedData.id,
                title: updatedData.title,
                content: updatedData.content,
                mood: updatedData.mood,
                tags: updatedData.tags || [],
                date: updatedData.date,
                createdAt: updatedData.created_at,
                updatedAt: updatedData.updated_at,
              };
              updatedEntries = entries.map((e, index) => 
                index === existingEntryIndex ? savedEntry : e
              );
              setEntries(updatedEntries);
              const storageKey = userId ? `${DIARY_STORAGE_KEY}_${userId}` : DIARY_STORAGE_KEY;
              await AsyncStorage.setItem(storageKey, JSON.stringify(updatedEntries));
              console.log('✅ Entry updated in Supabase:', savedEntry.id);
              return savedEntry;
            }
          } catch (supabaseErr) {
            if (isNetworkError(supabaseErr)) {
              console.warn('⚠️ Network error updating entry, using local:', supabaseErr);
            } else {
              console.error('Supabase update failed, using local:', supabaseErr);
            }
          }
        }
        
        // Local olarak güncelle (userId yoksa veya Supabase başarısız olduysa)
        savedEntry = {
          ...existingEntry,
          ...entry,
          updatedAt: new Date().toISOString(),
        };
        updatedEntries = entries.map((e, index) => 
          index === existingEntryIndex ? savedEntry : e
        );
        console.log('✅ Entry updated locally:', savedEntry.id);
      } else {
        // Yeni entry ekle - Supabase'e kaydet (userId varsa)
        if (userId) {
          try {
            const { data: insertedData, error: insertError } = await supabase
              .from('diary_entries')
              .insert({
                user_id: userId,
                title: entry.title,
                content: entry.content,
                mood: entry.mood,
                tags: entry.tags || [],
                date: entry.date,
              })
              .select()
              .single();

            if (insertError) {
              console.error('Supabase insert error:', insertError);
              if (!isNetworkError(insertError)) {
                throw insertError;
              }
              // Network hatası ise local'e kaydet
            } else if (insertedData) {
              savedEntry = {
                id: insertedData.id,
                title: insertedData.title,
                content: insertedData.content,
                mood: insertedData.mood,
                tags: insertedData.tags || [],
                date: insertedData.date,
                createdAt: insertedData.created_at,
                updatedAt: insertedData.updated_at,
              };
              updatedEntries = [savedEntry, ...entries];
              setEntries(updatedEntries);
              await AsyncStorage.setItem(`${DIARY_STORAGE_KEY}_${userId}`, JSON.stringify(updatedEntries));
              console.log('✅ New entry added to Supabase:', savedEntry.id);
              return savedEntry;
            }
          } catch (supabaseErr) {
            if (isNetworkError(supabaseErr)) {
              console.warn('⚠️ Network error inserting entry, using local:', supabaseErr);
            } else {
              console.error('Supabase insert failed, using local ID:', supabaseErr);
            }
          }
        }
        
        // Local ID ile kaydet (userId yoksa veya Supabase başarısız olduysa)
        savedEntry = {
          id: Date.now().toString(),
          ...entry,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        updatedEntries = [savedEntry, ...entries];
        console.log('✅ New entry added locally:', savedEntry.id);
      }

      // State'i güncelle
      setEntries(updatedEntries);
      
      // AsyncStorage'a kaydet (offline için)
      const storageKey = userId ? `${DIARY_STORAGE_KEY}_${userId}` : DIARY_STORAGE_KEY;
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedEntries));
      console.log('💾 Entry saved to AsyncStorage:', savedEntry.id);
      
      return savedEntry;
    } catch (err) {
      console.error('Error adding entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to add entry');
      throw err;
    }
  };

  const updateEntry = async (id: string, updates: Partial<DiaryEntry>) => {
    try {
      const existingEntry = entries.find(e => e.id === id);
      if (!existingEntry) throw new Error('Entry not found');

      // Supabase'de güncelle (userId varsa)
      let updatedEntry: DiaryEntry;
      if (userId) {
        try {
          const { data: updatedData, error: updateError } = await supabase
            .from('diary_entries')
            .update({
              ...(updates.title !== undefined && { title: updates.title }),
              ...(updates.content !== undefined && { content: updates.content }),
              ...(updates.mood !== undefined && { mood: updates.mood }),
              ...(updates.tags !== undefined && { tags: updates.tags }),
              updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

          if (updateError) {
            console.error('Supabase update error:', updateError);
            if (!isNetworkError(updateError)) {
              throw updateError;
            }
            // Network hatası ise local'e kaydet
          } else if (updatedData) {
            updatedEntry = {
              id: updatedData.id,
              title: updatedData.title,
              content: updatedData.content,
              mood: updatedData.mood,
              tags: updatedData.tags || [],
              date: updatedData.date,
              createdAt: updatedData.created_at,
              updatedAt: updatedData.updated_at,
            };
            const updatedEntries = entries.map((entry: DiaryEntry) => 
              entry.id === id ? updatedEntry : entry
            );
            setEntries(updatedEntries);
            await AsyncStorage.setItem(`${DIARY_STORAGE_KEY}_${userId}`, JSON.stringify(updatedEntries));
            console.log('✅ Entry updated in Supabase:', id);
            return updatedEntry;
          }
        } catch (supabaseErr) {
          if (isNetworkError(supabaseErr)) {
            console.warn('⚠️ Network error updating entry, using local:', supabaseErr);
          } else {
            console.error('Supabase update failed, using local:', supabaseErr);
          }
        }
      }

      // Local olarak güncelle (userId yoksa veya Supabase başarısız olduysa)
      updatedEntry = {
        ...existingEntry,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // State'i güncelle
      const updatedEntries = entries.map((entry: DiaryEntry) => 
        entry.id === id ? updatedEntry : entry
      );
      setEntries(updatedEntries);
      
      // AsyncStorage'a kaydet
      const storageKey = userId ? `${DIARY_STORAGE_KEY}_${userId}` : DIARY_STORAGE_KEY;
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedEntries));
      console.log('✅ Entry updated locally:', id);
      
      return updatedEntry;
    } catch (err) {
      console.error('Error updating entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to update entry');
      throw err;
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      // Supabase'den sil (userId varsa)
      if (userId) {
        try {
          const { error: deleteError } = await supabase
            .from('diary_entries')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

          if (deleteError) {
            console.error('Supabase delete error:', deleteError);
            if (isNetworkError(deleteError)) {
              console.warn('⚠️ Network error deleting entry, deleting locally:', deleteError);
            }
            // Hata olsa bile local'den silmeye devam et
          } else {
            console.log('✅ Entry deleted from Supabase:', id);
          }
        } catch (supabaseErr) {
          if (isNetworkError(supabaseErr)) {
            console.warn('⚠️ Network error deleting entry, deleting locally:', supabaseErr);
          } else {
            console.error('Supabase delete failed, deleting locally:', supabaseErr);
          }
        }
      }

      // State'i güncelle
      const updatedEntries = entries.filter((entry: DiaryEntry) => entry.id !== id);
      setEntries(updatedEntries);
      
      // AsyncStorage'a kaydet
      const storageKey = userId ? `${DIARY_STORAGE_KEY}_${userId}` : DIARY_STORAGE_KEY;
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedEntries));
      console.log('💾 Entry deleted from AsyncStorage:', id);
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
  }, [fetchEntries, userId]);

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