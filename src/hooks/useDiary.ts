import { useState, useEffect } from 'react';
import { DiaryEntry } from '../types';

export const useDiary = (userId?: string) => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data
  const mockEntries: DiaryEntry[] = [
    {
      id: '1',
      title: 'İlk Günlük',
      content: 'Bugün çok güzel bir gün geçirdim. Yeni projeme başladım ve çok heyecanlıyım!',
      mood: 4,
      tags: ['heyecan', 'proje', 'yeni başlangıç'],
      date: '2024-01-15',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      title: 'Harika Bir Gün',
      content: 'Bugün arkadaşlarımla çok güzel vakit geçirdim. Yemek yedik, sohbet ettik.',
      mood: 5,
      tags: ['arkadaşlık', 'eğlence', 'yemek'],
      date: '2024-01-14',
      createdAt: '2024-01-14T18:30:00Z',
      updatedAt: '2024-01-14T18:30:00Z',
    },
    {
      id: '3',
      title: 'Normal Bir Gün',
      content: 'Bugün işte normal bir gün geçirdim. Özel bir şey olmadı.',
      mood: 2,
      tags: ['iş', 'rutin'],
      date: '2024-01-13',
      createdAt: '2024-01-13T20:00:00Z',
      updatedAt: '2024-01-13T20:00:00Z',
    },
  ];

  const fetchEntries = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      // Mock data - no delay needed for development
      setEntries(mockEntries);
    } catch (err) {
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

      setEntries((prev: DiaryEntry[]) => [newEntry, ...prev]);
      return newEntry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add entry');
      throw err;
    }
  };

  const updateEntry = async (id: string, updates: Partial<DiaryEntry>) => {
    try {
      const updatedEntry: DiaryEntry = {
        ...entries.find(e => e.id === id)!,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      setEntries((prev: DiaryEntry[]) => prev.map((entry: DiaryEntry) => 
        entry.id === id ? updatedEntry : entry
      ));
      return updatedEntry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update entry');
      throw err;
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      setEntries((prev: DiaryEntry[]) => prev.filter((entry: DiaryEntry) => entry.id !== id));
    } catch (err) {
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