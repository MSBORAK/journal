import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { HealthData } from '../types';
import { isNetworkError } from '../utils/networkUtils';

const HEALTH_STORAGE_KEY = 'health_data';

export const useHealth = (userId: string | undefined) => {
  const [healthData, setHealthData] = useState<{ [date: string]: HealthData }>({});
  const [loading, setLoading] = useState(true);

  // Load health data from Supabase or AsyncStorage
  const loadHealthData = useCallback(async () => {
    try {
      setLoading(true);
      
      // userId varsa önce Supabase'den veri çek
      if (userId) {
        try {
          const { data: supabaseData, error: supabaseError } = await supabase
            .from('wellness_checks')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false });

          if (!supabaseError && supabaseData && supabaseData.length > 0) {
            // Supabase'den veri geldi, formatla ve kullan
            const formattedData: { [date: string]: HealthData } = {};
            supabaseData.forEach((check: any) => {
              formattedData[check.date] = {
                date: check.date,
                water: check.water_glasses || 0,
                exercise: check.exercise_minutes || 0,
                sleep: 0, // wellness_checks'te sleep yok, HealthData'da var
                meditation: 0, // wellness_checks'te meditation yok, HealthData'da var
              };
            });
            
            setHealthData(formattedData);
            await AsyncStorage.setItem(`${HEALTH_STORAGE_KEY}_${userId}`, JSON.stringify(formattedData));
            console.log('✅ Loaded health data from Supabase:', Object.keys(formattedData).length, 'days');
            setLoading(false);
            return;
          } else if (supabaseError && !isNetworkError(supabaseError)) {
            console.error('Supabase fetch error:', supabaseError);
          }
        } catch (supabaseErr) {
          if (isNetworkError(supabaseErr)) {
            console.warn('⚠️ Network error loading from Supabase, using local:', supabaseErr);
          } else {
            console.error('Supabase load error:', supabaseErr);
          }
        }
      }
      
      // Supabase'den veri gelmediyse veya userId yoksa AsyncStorage'dan yükle
      const storageKey = userId ? `${HEALTH_STORAGE_KEY}_${userId}` : HEALTH_STORAGE_KEY;
      const storedData = await AsyncStorage.getItem(storageKey);
      
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setHealthData(parsedData);
        console.log('📦 Loaded health data from AsyncStorage:', Object.keys(parsedData).length, 'days');
      } else {
        setHealthData({});
        console.log('🆕 First time - starting with empty health data');
      }
    } catch (error) {
      console.error('Error loading health data:', error);
      setHealthData({});
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load data on mount and when userId changes
  useEffect(() => {
    loadHealthData();
  }, [loadHealthData]);

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

      // Supabase'e kaydet (userId varsa)
      if (userId) {
        try {
          // wellness_checks tablosuna kaydet (water_glasses ve exercise_minutes var)
          const { error: upsertError } = await supabase
            .from('wellness_checks')
            .upsert({
              user_id: userId,
              date: date,
              water_glasses: data.water || 0,
              exercise_minutes: data.exercise || 0,
              // wellness_checks'te sleep ve meditation yok, sadece water ve exercise var
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'user_id,date'
            });

          if (upsertError) {
            if (!isNetworkError(upsertError)) {
              console.error('Supabase upsert error:', upsertError);
            }
          } else {
            console.log('✅ Health data saved to Supabase for date:', date);
          }
        } catch (supabaseErr) {
          if (isNetworkError(supabaseErr)) {
            console.warn('⚠️ Network error saving to Supabase, using local:', supabaseErr);
          } else {
            console.error('Supabase save error:', supabaseErr);
          }
        }
      }

      // Her zaman AsyncStorage'a da kaydet (offline için)
      const storageKey = userId ? `${HEALTH_STORAGE_KEY}_${userId}` : HEALTH_STORAGE_KEY;
      setHealthData(updatedData);
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedData));
      console.log('💾 Health data saved locally for date:', date);
      
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

