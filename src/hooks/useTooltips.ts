import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  TooltipData, 
  getTooltipsForScreen, 
  isTooltipShown, 
  markTooltipAsShown 
} from '../services/tooltipService';

export interface TooltipManager {
  currentTooltip: TooltipData | null;
  showTooltip: (tooltip: TooltipData, targetPosition?: { x: number; y: number; width: number; height: number }) => void;
  hideTooltip: () => void;
  nextTooltip: () => void;
  isVisible: boolean;
  targetPosition: { x: number; y: number; width: number; height: number } | undefined;
}

export function useTooltips(screenName: string): TooltipManager {
  const { user } = useAuth();
  const [currentTooltip, setCurrentTooltip] = useState<TooltipData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [targetPosition, setTargetPosition] = useState<{ x: number; y: number; width: number; height: number } | undefined>();
  const [pendingTooltips, setPendingTooltips] = useState<TooltipData[]>([]);
  const currentIndex = useRef(0);

  useEffect(() => {
    const checkAndShowTooltips = async () => {
      const screenTooltips = getTooltipsForScreen(screenName);
      const unshownTooltips: TooltipData[] = [];

      for (const tooltip of screenTooltips) {
        const shown = await isTooltipShown(tooltip.id, user?.uid);
        if (!shown) {
          unshownTooltips.push(tooltip);
        }
      }

      if (unshownTooltips.length > 0) {
        setPendingTooltips(unshownTooltips);
        // Show first tooltip after a short delay
        setTimeout(() => {
          showTooltip(unshownTooltips[0]);
        }, 1500);
      }
    };

    checkAndShowTooltips();
  }, [screenName, user?.uid]);

  const showTooltip = (tooltip: TooltipData, position?: { x: number; y: number; width: number; height: number }) => {
    setCurrentTooltip(tooltip);
    setTargetPosition(position);
    setIsVisible(true);
  };

  const hideTooltip = async () => {
    if (currentTooltip) {
      await markTooltipAsShown(currentTooltip.id, user?.uid);
    }
    setIsVisible(false);
    setCurrentTooltip(null);
    setTargetPosition(undefined);
  };

  const nextTooltip = async () => {
    // Mark current tooltip as shown first
    if (currentTooltip) {
      await markTooltipAsShown(currentTooltip.id, user?.uid);
    }
    
    // Hide current tooltip
    setIsVisible(false);
    setCurrentTooltip(null);
    setTargetPosition(undefined);
    
    // Show next tooltip after a short delay
    setTimeout(() => {
      const nextIndex = currentIndex.current + 1;
      if (nextIndex < pendingTooltips.length) {
        currentIndex.current = nextIndex;
        showTooltip(pendingTooltips[nextIndex]);
      } else {
        setPendingTooltips([]);
        currentIndex.current = 0;
      }
    }, 300);
  };

  return {
    currentTooltip,
    showTooltip,
    hideTooltip,
    nextTooltip,
    isVisible,
    targetPosition,
  };
}
