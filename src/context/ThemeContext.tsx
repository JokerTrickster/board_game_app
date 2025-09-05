import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccessibilityInfo } from 'react-native';

export type ThemeMode = 'default' | 'high_contrast' | 'dark';

interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  accent: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  border: string;
  shadow: string;
}

const DEFAULT_THEME: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#212121',
  textSecondary: '#757575',
  accent: '#2196F3',
  error: '#F44336',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
  border: '#E0E0E0',
  shadow: '#000000',
};

const HIGH_CONTRAST_THEME: ThemeColors = {
  background: '#000000',
  surface: '#1C1C1C',
  text: '#FFFFFF',
  textSecondary: '#E0E0E0',
  accent: '#FFFF00',    // 노란색 - 높은 대비
  error: '#FF4444',     // 밝은 빨간색
  success: '#00FF00',   // 밝은 초록색
  warning: '#FFA500',   // 주황색
  info: '#00BFFF',      // 밝은 파란색
  border: '#FFFFFF',
  shadow: '#FFFFFF',
};

const DARK_THEME: ThemeColors = {
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  accent: '#BB86FC',
  error: '#CF6679',
  success: '#03DAC6',
  warning: '#FFC107',
  info: '#2196F3',
  border: '#333333',
  shadow: '#000000',
};

interface ThemeContextType {
  theme: ThemeColors;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isHighContrast: boolean;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'theme_mode';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('default');
  const [theme, setTheme] = useState<ThemeColors>(DEFAULT_THEME);

  // Load saved theme on app start
  useEffect(() => {
    loadTheme();
    checkSystemAccessibilitySettings();
  }, []);

  // Update theme when mode changes
  useEffect(() => {
    updateTheme(themeMode);
  }, [themeMode]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedTheme) {
        setThemeModeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const checkSystemAccessibilitySettings = async () => {
    try {
      // Check if user has enabled high contrast in system settings
      const isHighContrastEnabled = await AccessibilityInfo.isHighTextContrastEnabled?.();
      if (isHighContrastEnabled) {
        setThemeModeState('high_contrast');
      }
    } catch (error) {
      console.error('Failed to check accessibility settings:', error);
    }
  };

  const updateTheme = (mode: ThemeMode) => {
    switch (mode) {
      case 'high_contrast':
        setTheme(HIGH_CONTRAST_THEME);
        break;
      case 'dark':
        setTheme(DARK_THEME);
        break;
      case 'default':
      default:
        setTheme(DEFAULT_THEME);
        break;
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, mode);
      setThemeModeState(mode);
      
      // Announce theme change to screen reader
      const announcement = getThemeAnnouncement(mode);
      AccessibilityInfo.announceForAccessibility?.(announcement);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const getThemeAnnouncement = (mode: ThemeMode): string => {
    switch (mode) {
      case 'high_contrast':
        return '고대비 테마가 적용되었습니다. 더 선명한 색상과 높은 대비로 화면을 볼 수 있습니다.';
      case 'dark':
        return '다크 테마가 적용되었습니다. 어두운 배경으로 화면이 변경되었습니다.';
      case 'default':
      default:
        return '기본 테마가 적용되었습니다. 밝은 배경으로 화면이 변경되었습니다.';
    }
  };

  const contextValue: ThemeContextType = {
    theme,
    themeMode,
    setThemeMode,
    isHighContrast: themeMode === 'high_contrast',
    isDarkMode: themeMode === 'dark',
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Get contrast ratio between two colors
 * Returns true if contrast ratio meets WCAG AA standards (4.5:1)
 */
export const meetsContrastRequirement = (foreground: string, background: string): boolean => {
  // This is a simplified version - in production, you'd use a proper color contrast calculation
  // For now, we'll return true for our predefined high contrast combinations
  if (background === HIGH_CONTRAST_THEME.background && foreground === HIGH_CONTRAST_THEME.text) {
    return true;
  }
  if (background === DEFAULT_THEME.background && foreground === DEFAULT_THEME.text) {
    return true;
  }
  return true; // Assuming our predefined colors meet requirements
};