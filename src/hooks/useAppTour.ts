import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  getTourSteps,
  TourStep,
  isTourCompleted,
  setTourCompleted,
  getTourStep,
  setTourStep,
} from '../services/tourService';

export const useAppTour = (navigation: any, currentScreen: string) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [tourVisible, setTourVisible] = useState(false);
  const [currentTourStep, setCurrentTourStep] = useState(0);

  // Tour adımlarını i18n ile çevir
  const tourSteps = getTourSteps(t);

  useEffect(() => {
    checkTourStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, currentScreen]); // User veya ekran değiştiğinde kontrol et

  const checkTourStatus = async () => {
    try {
      const completed = await isTourCompleted(user?.uid);
      if (completed) {
        // Tour tamamlandıysa hiçbir şey yapma
        return;
      }

      const step = await getTourStep(user?.uid);
      setCurrentTourStep(step);
      
      // Eğer Dashboard ekranındaysak ve tour başlamadıysa başlat
      if (currentScreen === 'Dashboard' && step === 0) {
        setTimeout(() => {
          setTourVisible(true);
        }, 1500); // 1.5 saniye bekle (kullanıcı ekranı görsün)
      } else if (step > 0 && step < tourSteps.length) {
        // Tour başlamış ama tamamlanmamış
        const stepData = tourSteps[step];
        // Eğer doğru ekrandaysak tour'u göster, yoksa beklemeli (otomatik navigate yok)
        if (stepData.screen === currentScreen) {
          setTimeout(() => {
            setTourVisible(true);
          }, 500);
        }
        // Doğru ekranda değilsek otomatik navigate YAPMA - kullanıcı "İleri" dediğinde yapılacak
      }
    } catch (error) {
      console.error('Error checking tour status:', error);
    }
  };

  const handleNext = async () => {
    if (currentTourStep < tourSteps.length - 1) {
      const nextStep = currentTourStep + 1;
      setCurrentTourStep(nextStep);
      await setTourStep(nextStep, user?.uid);
      
      const nextStepData = tourSteps[nextStep];
      
      // Eğer bir sonraki adım farklı bir ekrandaysa, o ekrana git
      if (nextStepData.nextScreen && nextStepData.nextScreen !== currentScreen) {
        setTourVisible(false);
        // Biraz bekle, sonra navigate et
        setTimeout(() => {
          navigation.navigate(nextStepData.nextScreen as any);
          // Navigate sonrası tour'u göster (sadece doğru ekrandaysa)
          setTimeout(() => {
            // Doğru ekrandaysak tour'u göster
            if (nextStepData.screen === nextStepData.nextScreen) {
              setTourVisible(true);
            }
          }, 800);
        }, 200);
      } else {
        // Aynı ekranda kalıyorsak tour'u hemen göster
        setTourVisible(true);
      }
    } else {
      // Tour tamamlandı
      await setTourCompleted(user?.uid);
      setTourVisible(false);
    }
  };

  const handleSkip = async () => {
    await setTourCompleted(user?.uid);
    setTourVisible(false);
  };

  const handleComplete = async () => {
    await setTourCompleted(user?.uid);
    setTourVisible(false);
  };

  const startTour = async () => {
    setCurrentTourStep(0);
    await setTourStep(0, user?.uid);
    setTourVisible(true);
  };

  return {
    tourVisible,
    currentTourStep,
    totalSteps: tourSteps.length,
    currentStep: tourSteps[currentTourStep],
    handleNext,
    handleSkip,
    handleComplete,
    startTour,
  };
};

