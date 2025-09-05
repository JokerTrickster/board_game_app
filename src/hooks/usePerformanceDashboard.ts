import { useState, useCallback } from 'react';
import { DevSettings } from 'react-native';

export interface PerformanceDashboardControls {
  isVisible: boolean;
  show: () => void;
  hide: () => void;
  toggle: () => void;
}

/**
 * Hook for managing performance dashboard visibility
 * Automatically adds a dev menu item in debug builds
 */
export const usePerformanceDashboard = (): PerformanceDashboardControls => {
  const [isVisible, setIsVisible] = useState(false);

  const show = useCallback(() => setIsVisible(true), []);
  const hide = useCallback(() => setIsVisible(false), []);
  const toggle = useCallback(() => setIsVisible(prev => !prev), []);

  // Add dev menu item in debug builds
  if (__DEV__) {
    try {
      DevSettings.addMenuItem('Performance Dashboard', toggle);
    } catch (error) {
      // Silently fail if DevSettings is not available
      console.warn('Could not add performance dashboard to dev menu:', error);
    }
  }

  return {
    isVisible,
    show,
    hide,
    toggle,
  };
};
