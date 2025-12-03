import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HealthData } from '../types';

const HEALTH_STORAGE_KEY = 'health_data';

export const useHealth = (userId: string | undefined) => {
  const [healthData, setHealthData] = useState<{ [date: string]: HealthData }>({});
  const [loading, setLoading] = useState(true);

  // Load health data from AsyncStorage
  const loadHealthData = async () => {
    try {
      setLoading(true);
      // userId varsa user-specific key, yoksa global key kullan
      const storageKey = userId ? `${HEALTH_STORAGE_KEY}_${userId}` : HEALTH_STORAGE_KEY;
      const storedData = await AsyncStorage.getItem(storageKey);
      
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setHealthData(parsedData);
        console.log('Loaded health data from AsyncStorage');
      } else {
        setHealthData({});
        console.log('First time - starting with empty health data');
      }
    } catch (error) {
      console.error('Error loading health data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and when userId changes
  useEffect(() => {
    loadHealthData();
  }, [userId]);

  // Save health data for a specific date
  const saveHealthData = async (date: string, data: Omit<HealthData, 'date'>) => {
    try {
      const newHealthData: HealthData = {
        date,
        ...data,
      };

      const updatedData = {
        ...healthData,
        [date]: newHealthData,
      };

      // userId varsa user-specific key, yoksa global key kullan
      const storageKey = userId ? `${HEALTH_STORAGE_KEY}_${userId}` : HEALTH_STORAGE_KEY;
      console.log('Saving to AsyncStorage:', storageKey, updatedData);
      setHealthData(updatedData);
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedData));
      console.log('Health data saved for date:', date, 'data:', newHealthData);
      
      return newHealthData;
    } catch (error) {
      console.error('Error saving health data:', error);
      throw error;
    }
  };

  // Get health data for a specific date
  const getHealthDataByDate = (date: string): HealthData | null => {
    return healthData[date] || null;
  };

  // Get today's health data
  const getTodayHealthData = (): HealthData | null => {
    const today = new Date().toISOString().split('T')[0];
    const data = getHealthDataByDate(today);
    console.log('getTodayHealthData called for date:', today, 'result:', data);
    return data;
  };

  // Calculate wellness score (0-100)
  const calculateWellnessScore = (data: HealthData): number => {
    const waterScore = Math.round(Math.min((data.water / 12) * 100, 100)); // 12 bardak hedef
    const exerciseScore = Math.round(Math.min((data.exercise / 120) * 100, 100)); // 120 dakika hedef
    const sleepScore = Math.round(Math.min((data.sleep / 12) * 100, 100)); // 12 saat hedef
    const meditationScore = Math.round(Math.min((data.meditation / 60) * 100, 100)); // 60 dakika hedef

    return Math.round((waterScore + exerciseScore + sleepScore + meditationScore) / 4);
  };

  // Get wellness score for today
  const getTodayWellnessScore = (): number => {
    const todayData = getTodayHealthData();
    if (!todayData) return 0;
    return calculateWellnessScore(todayData);
  };

  // Get weekly average
  const getWeeklyAverage = (): { water: number; exercise: number; sleep: number; meditation: number } => {
    const today = new Date();
    const weekData: HealthData[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const data = getHealthDataByDate(dateStr);
      if (data) weekData.push(data);
    }

    if (weekData.length === 0) {
      return { water: 0, exercise: 0, sleep: 0, meditation: 0 };
    }

    const totals = weekData.reduce(
      (acc, data) => ({
        water: acc.water + data.water,
        exercise: acc.exercise + data.exercise,
        sleep: acc.sleep + data.sleep,
        meditation: acc.meditation + data.meditation,
      }),
      { water: 0, exercise: 0, sleep: 0, meditation: 0 }
    );

    return {
      water: Math.round(totals.water / weekData.length),
      exercise: Math.round(totals.exercise / weekData.length),
      sleep: Math.round(totals.sleep / weekData.length),
      meditation: Math.round(totals.meditation / weekData.length),
    };
  };

  useEffect(() => {
    loadHealthData();
  }, [userId]);

  return {
    healthData,
    loading,
    saveHealthData,
    getHealthDataByDate,
    getTodayHealthData,
    calculateWellnessScore,
    getTodayWellnessScore,
    getWeeklyAverage,
  };
};

