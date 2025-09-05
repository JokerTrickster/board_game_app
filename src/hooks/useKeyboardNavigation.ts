import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, findNodeHandle, Platform } from 'react-native';

interface FocusableElement {
  id: string;
  ref: React.RefObject<any>;
  accessibilityLabel?: string;
}

interface KeyboardNavigationOptions {
  elements: FocusableElement[];
  initialFocusIndex?: number;
  onFocusChange?: (index: number, element: FocusableElement) => void;
  enableArrowNavigation?: boolean;
  enableTabNavigation?: boolean;
}

export const useKeyboardNavigation = ({
  elements,
  initialFocusIndex = 0,
  onFocusChange,
  enableArrowNavigation = true,
  enableTabNavigation = true,
}: KeyboardNavigationOptions) => {
  const [currentFocusIndex, setCurrentFocusIndex] = useState(initialFocusIndex);
  const [isKeyboardNavigationActive, setIsKeyboardNavigationActive] = useState(false);

  // Check if screen reader is active
  useEffect(() => {
    checkScreenReaderStatus();

    const listener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      checkScreenReaderStatus
    );

    return () => {
      if (Platform.OS === 'ios') {
        listener?.remove();
      } else {
        // Android uses different cleanup
        listener && typeof listener === 'function' && listener();
      }
    };
  }, []);

  const checkScreenReaderStatus = async () => {
    try {
      const isScreenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      setIsKeyboardNavigationActive(isScreenReaderEnabled);
    } catch (error) {
      console.error('Failed to check screen reader status:', error);
    }
  };

  // Focus management
  const focusElement = (index: number) => {
    if (index < 0 || index >= elements.length) {return;}

    const element = elements[index];
    if (element.ref.current) {
      try {
        // Set accessibility focus
        const reactTag = findNodeHandle(element.ref.current);
        if (reactTag) {
          AccessibilityInfo.setAccessibilityFocus?.(reactTag);
        }

        // Update current focus index
        setCurrentFocusIndex(index);

        // Callback for focus change
        if (onFocusChange) {
          onFocusChange(index, element);
        }

        // Announce focused element to screen reader
        if (element.accessibilityLabel) {
          AccessibilityInfo.announceForAccessibility?.(
            `${element.accessibilityLabel}에 포커스됨`
          );
        }
      } catch (error) {
        console.error('Failed to focus element:', error);
      }
    }
  };

  // Navigation functions
  const focusNext = () => {
    const nextIndex = (currentFocusIndex + 1) % elements.length;
    focusElement(nextIndex);
  };

  const focusPrevious = () => {
    const prevIndex = currentFocusIndex === 0 ? elements.length - 1 : currentFocusIndex - 1;
    focusElement(prevIndex);
  };

  const focusFirst = () => {
    focusElement(0);
  };

  const focusLast = () => {
    focusElement(elements.length - 1);
  };

  // Handle keyboard events (for external keyboard support)
  const handleKeyPress = (event: any) => {
    if (!isKeyboardNavigationActive) {return false;}

    const { key } = event.nativeEvent || event;

    switch (key) {
      case 'Tab':
        if (enableTabNavigation) {
          if (event.shiftKey) {
            focusPrevious();
          } else {
            focusNext();
          }
          return true;
        }
        break;

      case 'ArrowDown':
      case 'ArrowRight':
        if (enableArrowNavigation) {
          focusNext();
          return true;
        }
        break;

      case 'ArrowUp':
      case 'ArrowLeft':
        if (enableArrowNavigation) {
          focusPrevious();
          return true;
        }
        break;

      case 'Home':
        focusFirst();
        return true;

      case 'End':
        focusLast();
        return true;

      case 'Enter':
      case ' ': // Space key
        // Activate current focused element
        const currentElement = elements[currentFocusIndex];
        if (currentElement?.ref.current?.onPress) {
          currentElement.ref.current.onPress();
          return true;
        }
        break;
    }

    return false;
  };

  // Initialize focus on first element
  useEffect(() => {
    if (isKeyboardNavigationActive && elements.length > 0) {
      focusElement(initialFocusIndex);
    }
  }, [isKeyboardNavigationActive, elements.length]);

  return {
    currentFocusIndex,
    isKeyboardNavigationActive,
    focusElement,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    handleKeyPress,

    // Accessibility helpers
    getAccessibilityProps: (index: number) => ({
      accessible: true,
      accessibilityState: {
        selected: index === currentFocusIndex,
      },
      // Add tab index equivalent for React Native
      ...(Platform.OS === 'web' && {
        tabIndex: index === currentFocusIndex ? 0 : -1,
      }),
    }),
  };
};

/**
 * Custom hook for managing focus trap (keeping focus within a specific area)
 */
export const useFocusTrap = (isActive: boolean, elements: FocusableElement[]) => {
  const navigation = useKeyboardNavigation({
    elements,
    enableTabNavigation: true,
    enableArrowNavigation: false,
  });

  useEffect(() => {
    if (isActive && elements.length > 0) {
      // Focus first element when trap becomes active
      navigation.focusFirst();
    }
  }, [isActive]);

  const handleKeyPress = (event: any) => {
    if (!isActive) {return false;}

    const handled = navigation.handleKeyPress(event);

    // Prevent focus from escaping the trap
    if (handled) {
      event.preventDefault?.();
      event.stopPropagation?.();
    }

    return handled;
  };

  return {
    ...navigation,
    handleKeyPress,
  };
};
