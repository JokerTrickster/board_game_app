import { AccessibilityInfo, Vibration, Platform } from 'react-native';
import { ACCESSIBILITY_CONSTANTS } from '../constants/accessibility';

/**
 * Announce message to screen reader users
 */
export const announceForAccessibility = (message: string) => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    AccessibilityInfo.announceForAccessibility?.(message);
  } else {
    console.log(`Screen Reader: ${message}`);
  }
};

/**
 * Check if screen reader is currently active
 */
export const isScreenReaderEnabled = async (): Promise<boolean> => {
  try {
    return await AccessibilityInfo.isScreenReaderEnabled();
  } catch (error) {
    console.error('Failed to check screen reader status:', error);
    return false;
  }
};

/**
 * Check if user has enabled reduced motion in system settings
 */
export const isReduceMotionEnabled = async (): Promise<boolean> => {
  try {
    return await AccessibilityInfo.isReduceMotionEnabled?.() ?? false;
  } catch (error) {
    console.error('Failed to check reduce motion setting:', error);
    return false;
  }
};

/**
 * Check if high contrast is enabled in system settings
 */
export const isHighTextContrastEnabled = async (): Promise<boolean> => {
  try {
    return await AccessibilityInfo.isHighTextContrastEnabled?.() ?? false;
  } catch (error) {
    console.error('Failed to check high contrast setting:', error);
    return false;
  }
};

/**
 * Provide haptic feedback for accessibility actions
 */
export const provideHapticFeedback = (type: 'success' | 'error' | 'warning' | 'light' = 'light') => {
  try {
    switch (type) {
      case 'success':
        Vibration.vibrate([0, 50, 50, 50]); // Short, pause, short, pause, short
        break;
      case 'error':
        Vibration.vibrate([0, 100, 50, 100]); // Long, pause, long
        break;
      case 'warning':
        Vibration.vibrate([0, 75]); // Medium vibration
        break;
      case 'light':
      default:
        Vibration.vibrate(25); // Light tap
        break;
    }
  } catch (error) {
    console.error('Failed to provide haptic feedback:', error);
  }
};

/**
 * Get accessibility props for game feedback (correct/incorrect answers)
 */
export const getGameFeedbackAccessibility = (type: 'correct' | 'incorrect' | 'hint') => {
  const indicator = ACCESSIBILITY_CONSTANTS.FEEDBACK_INDICATORS[type.toUpperCase() as keyof typeof ACCESSIBILITY_CONSTANTS.FEEDBACK_INDICATORS];

  return {
    accessible: true,
    accessibilityRole: 'text' as const,
    accessibilityLabel: indicator.accessibilityLabel,
    accessibilityLiveRegion: 'assertive' as const,
  };
};

/**
 * Get accessibility props for user indicators (USER1/USER2)
 */
export const getUserIndicatorAccessibility = (userType: 'USER1' | 'USER2', count?: number) => {
  const indicator = ACCESSIBILITY_CONSTANTS.USER_INDICATORS[userType];
  const countText = count !== undefined ? ` ${count}개` : '';

  return {
    accessible: true,
    accessibilityRole: 'text' as const,
    accessibilityLabel: `${indicator.accessibilityLabel}${countText}`,
  };
};

/**
 * Ensure minimum touch target size for accessibility
 */
export const ensureMinimumTouchTarget = (size: number): number => {
  return Math.max(size, ACCESSIBILITY_CONSTANTS.TOUCH_TARGETS.MINIMUM);
};

/**
 * Get touch target size based on accessibility settings
 */
export const getTouchTargetSize = async (baseSize: number): Promise<number> => {
  const isScreenReaderActive = await isScreenReaderEnabled();
  if (isScreenReaderActive) {
    return Math.max(baseSize, ACCESSIBILITY_CONSTANTS.TOUCH_TARGETS.LARGE);
  }
  return Math.max(baseSize, ACCESSIBILITY_CONSTANTS.TOUCH_TARGETS.RECOMMENDED);
};

/**
 * Generate accessibility hint for interactive elements
 */
export const generateAccessibilityHint = (
  action: string,
  context?: string,
  condition?: boolean
): string => {
  let hint = `터치하여 ${action}`;

  if (context) {
    hint += ` ${context}`;
  }

  if (condition === false) {
    hint = `현재 사용할 수 없습니다. ${hint}하려면 조건을 만족해야 합니다`;
  }

  return hint;
};

/**
 * Create accessible button props with proper labeling
 */
export interface AccessibleButtonProps {
  label: string;
  hint?: string;
  disabled?: boolean;
  count?: number;
  role?: 'button' | 'link' | 'tab';
}

export const createAccessibleButtonProps = ({
  label,
  hint,
  disabled = false,
  count,
  role = 'button',
}: AccessibleButtonProps) => {
  const countText = count !== undefined ? ` ${count}개` : '';
  const accessibilityLabel = `${label}${countText}`;

  let accessibilityHint = hint;
  if (disabled) {
    accessibilityHint = '현재 사용할 수 없는 상태입니다';
  }

  return {
    accessible: true,
    accessibilityRole: role,
    accessibilityLabel,
    accessibilityHint,
    accessibilityState: {
      disabled,
    },
  };
};

/**
 * Create accessible input props for form elements
 */
export interface AccessibleInputProps {
  label: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  value?: string;
}

export const createAccessibleInputProps = ({
  label,
  placeholder,
  required = false,
  error,
  value,
}: AccessibleInputProps) => {
  let accessibilityLabel = label;
  if (required) {
    accessibilityLabel += ', 필수 항목';
  }

  let accessibilityHint = placeholder ? `${placeholder}을 입력하세요` : '내용을 입력하세요';
  if (error) {
    accessibilityHint = `오류: ${error}`;
  }

  const accessibilityValue = value ? { text: value } : undefined;

  return {
    accessible: true,
    accessibilityLabel,
    accessibilityHint,
    accessibilityValue,
    accessibilityState: {
      invalid: !!error,
    },
  };
};

/**
 * Debounce accessibility announcements to prevent spam
 */
let announcementTimeout: NodeJS.Timeout | null = null;

export const debouncedAnnounce = (message: string, delay: number = 500) => {
  if (announcementTimeout) {
    clearTimeout(announcementTimeout);
  }

  announcementTimeout = setTimeout(() => {
    announceForAccessibility(message);
    announcementTimeout = null;
  }, delay);
};

/**
 * Format time for accessibility announcements
 */
export const formatTimeForAccessibility = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}초`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) {
    return `${minutes}분`;
  }

  return `${minutes}분 ${remainingSeconds}초`;
};

/**
 * Create accessible timer announcement
 */
export const announceTimeRemaining = (seconds: number) => {
  const timeText = formatTimeForAccessibility(seconds);

  if (seconds <= 10) {
    announceForAccessibility(`남은 시간 ${timeText}`);
    provideHapticFeedback('warning');
  } else if (seconds % 30 === 0) { // Every 30 seconds
    debouncedAnnounce(`남은 시간 ${timeText}`, 1000);
  }
};
