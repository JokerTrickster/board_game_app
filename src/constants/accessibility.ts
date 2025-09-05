/**
 * Accessibility constants and configurations for improved user experience
 */

export const ACCESSIBILITY_CONSTANTS = {
  // Minimum touch target sizes (in dp/pt)
  TOUCH_TARGETS: {
    MINIMUM: 44,           // iOS/Android minimum
    RECOMMENDED: 48,       // Recommended comfortable size
    LARGE: 56,            // Large touch targets for accessibility
  },

  // High contrast theme colors with 4.5:1 contrast ratio
  HIGH_CONTRAST_THEME: {
    background: '#000000',
    surface: '#1C1C1C',
    text: '#FFFFFF',
    accent: '#FFFF00',
    error: '#FF4444',
    success: '#00FF00',
    warning: '#FFA500',
    info: '#00BFFF',
  },

  // Visual indicators for different users (combining color, pattern, and shape)
  USER_INDICATORS: {
    USER1: {
      color: '#4CAF50',      // Green
      icon: '●',             // Solid circle
      pattern: 'solid',      // Solid pattern
      shape: 'circle',       // Circle shape
      accessibilityLabel: '내 선택',
      borderStyle: 'solid' as 'solid',
    },
    USER2: {
      color: '#2196F3',      // Blue
      icon: '◆',             // Diamond
      pattern: 'dashed',     // Dashed pattern
      shape: 'diamond',      // Diamond shape
      accessibilityLabel: '상대방 선택',
      borderStyle: 'dashed' as 'dashed',
    }
  },

  // Game feedback indicators (not relying only on color)
  FEEDBACK_INDICATORS: {
    CORRECT: {
      color: '#4CAF50',
      icon: '✓',
      shape: 'check',
      accessibilityLabel: '정답',
      soundFeedback: 'correct',
      hapticFeedback: 'success',
    },
    INCORRECT: {
      color: '#F44336',
      icon: '✗',
      shape: 'x',
      accessibilityLabel: '오답',
      soundFeedback: 'incorrect',
      hapticFeedback: 'error',
    },
    HINT: {
      color: '#FF9800',
      icon: '?',
      shape: 'question',
      accessibilityLabel: '힌트',
      soundFeedback: 'hint',
      hapticFeedback: 'light',
    }
  },

  // Screen reader announcements
  ANNOUNCEMENTS: {
    GAME_START: '게임이 시작되었습니다. 이미지를 터치하여 다른 부분을 찾아보세요.',
    CORRECT_ANSWER: '정답입니다!',
    WRONG_ANSWER: '틀렸습니다. 다시 시도해보세요.',
    HINT_USED: '힌트를 사용했습니다. 파란색 원으로 표시된 영역을 확인하세요.',
    TIMER_STOP: '타이머가 5초간 정지되었습니다.',
    GAME_COMPLETE: '게임이 완료되었습니다.',
    LIFE_LOST: '생명이 하나 줄었습니다.',
    NO_ITEMS: '사용할 수 있는 아이템이 없습니다.',
  },

  // Keyboard navigation
  KEYBOARD_NAVIGATION: {
    TAB_ORDER: [
      'gameImage',
      'hintButton',
      'timerButton', 
      'zoomInButton',
      'zoomOutButton',
      'menuButton',
    ],
  },

  // Accessibility roles and states
  ROLES: {
    BUTTON: 'button' as 'button',
    IMAGE: 'image' as 'image',
    TEXT: 'text' as 'text',
    CHECKBOX: 'checkbox' as 'checkbox',
    SLIDER: 'slider' as 'slider',
    ALERT: 'alert' as 'alert',
  },
} as const;

/**
 * Get user indicator with accessibility support
 */
export const getUserIndicator = (userType: 'USER1' | 'USER2') => {
  return ACCESSIBILITY_CONSTANTS.USER_INDICATORS[userType];
};

/**
 * Get feedback indicator with accessibility support
 */
export const getFeedbackIndicator = (type: 'CORRECT' | 'INCORRECT' | 'HINT') => {
  return ACCESSIBILITY_CONSTANTS.FEEDBACK_INDICATORS[type];
};

/**
 * Announce message to screen reader
 */
export const announceToScreenReader = (message: string) => {
  // This will be implemented with accessibility service
  console.log(`Screen Reader: ${message}`);
  // TODO: Implement with AccessibilityInfo.announceForAccessibility(message)
};