import { useState, useEffect, useCallback } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import { getDeviceInfo, getDeviceCategory, getOrientation, DeviceCategory, Orientation } from '../utils/deviceDetection';
import { responsive, breakpoints } from '../utils/responsive';

interface ResponsiveHookReturn {
  // Device information
  deviceInfo: ReturnType<typeof getDeviceInfo>;
  category: DeviceCategory;
  orientation: Orientation;
  
  // Screen dimensions
  width: number;
  height: number;
  
  // Breakpoint utilities
  isPhone: boolean;
  isTablet: boolean;
  isSmallPhone: boolean;
  isRegularPhone: boolean;
  isSmallTablet: boolean;
  isLargeTablet: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  
  // Responsive scaling functions
  scale: (size: number) => number;
  verticalScale: (size: number) => number;
  moderateScale: (size: number, factor?: number) => number;
  scaleFont: (fontSize: number) => number;
  scaleSpacing: (spacing: number) => number;
  widthPercentage: (percentage: number) => number;
  heightPercentage: (percentage: number) => number;
  
  // Utility functions
  responsiveValue: <T>(values: {
    phone?: T;
    phoneSmall?: T;
    phoneRegular?: T;
    tablet?: T;
    tabletSmall?: T;
    tabletLarge?: T;
  }) => T;
}

/**
 * Custom hook for responsive design
 * Provides device information, breakpoints, and scaling utilities
 * Automatically updates when screen dimensions change (orientation, etc.)
 */
export const useResponsive = (): ResponsiveHookReturn => {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));
  
  // Update dimensions when screen changes (orientation, folding phones, etc.)
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      setDimensions(window);
    });
    
    return () => subscription?.remove();
  }, []);
  
  // Memoized device info that updates with dimensions
  const deviceInfo = getDeviceInfo();
  const category = getDeviceCategory();
  const orientation = getOrientation();
  
  // Responsive value selector
  const responsiveValue = useCallback(<T,>(values: {
    phone?: T;
    phoneSmall?: T;
    phoneRegular?: T;
    tablet?: T;
    tabletSmall?: T;
    tabletLarge?: T;
  }): T => {
    // Most specific to least specific
    if (category === DeviceCategory.PHONE_SMALL && values.phoneSmall !== undefined) {
      return values.phoneSmall;
    }
    if (category === DeviceCategory.PHONE_REGULAR && values.phoneRegular !== undefined) {
      return values.phoneRegular;
    }
    if (category === DeviceCategory.TABLET_SMALL && values.tabletSmall !== undefined) {
      return values.tabletSmall;
    }
    if (category === DeviceCategory.TABLET_LARGE && values.tabletLarge !== undefined) {
      return values.tabletLarge;
    }
    
    // Fallback to broader categories
    if ((category === DeviceCategory.PHONE_SMALL || category === DeviceCategory.PHONE_REGULAR) && values.phone !== undefined) {
      return values.phone;
    }
    if ((category === DeviceCategory.TABLET_SMALL || category === DeviceCategory.TABLET_LARGE) && values.tablet !== undefined) {
      return values.tablet;
    }
    
    // Default fallback - use phone value or first available value
    return values.phone || values.phoneRegular || values.phoneSmall || values.tablet || values.tabletSmall || values.tabletLarge as T;
  }, [category]);
  
  return {
    // Device information
    deviceInfo,
    category,
    orientation,
    
    // Screen dimensions
    width: dimensions.width,
    height: dimensions.height,
    
    // Breakpoint utilities
    isPhone: breakpoints.isPhone,
    isTablet: breakpoints.isTablet,
    isSmallPhone: breakpoints.isSmallPhone,
    isRegularPhone: breakpoints.isRegularPhone,
    isSmallTablet: breakpoints.isSmallTablet,
    isLargeTablet: breakpoints.isLargeTablet,
    isLandscape: breakpoints.isLandscape,
    isPortrait: breakpoints.isPortrait,
    
    // Responsive scaling functions
    scale: responsive.scale,
    verticalScale: responsive.verticalScale,
    moderateScale: responsive.moderateScale,
    scaleFont: responsive.font,
    scaleSpacing: responsive.spacing,
    widthPercentage: responsive.width,
    heightPercentage: responsive.height,
    
    // Utility functions
    responsiveValue,
  };
};

/**
 * Hook for orientation-specific values
 * Provides easy way to return different values for portrait vs landscape
 */
export const useOrientation = <T>(portraitValue: T, landscapeValue: T): T => {
  const { isLandscape } = useResponsive();
  return isLandscape ? landscapeValue : portraitValue;
};

/**
 * Hook for device category-specific values
 * Provides easy way to return different values for different device types
 */
export const useDeviceCategory = <T>(values: {
  phoneSmall?: T;
  phoneRegular?: T;
  tabletSmall?: T;
  tabletLarge?: T;
  phone?: T;
  tablet?: T;
}): T => {
  const { responsiveValue } = useResponsive();
  return responsiveValue(values);
};

/**
 * Hook for safe area dimensions
 * Provides screen dimensions with safe area considerations
 */
export const useSafeAreaDimensions = () => {
  const { width, height, isLandscape } = useResponsive();
  
  // Estimated safe area insets (could be enhanced with react-native-safe-area-context)
  const safeAreaInsets = {
    top: isLandscape ? 0 : 44,      // Status bar height (iPhone)
    bottom: isLandscape ? 0 : 34,   // Home indicator height (iPhone)
    left: isLandscape ? 44 : 0,     // Notch area in landscape
    right: isLandscape ? 44 : 0,    // Notch area in landscape
  };
  
  return {
    width,
    height,
    safeAreaInsets,
    usableWidth: width - safeAreaInsets.left - safeAreaInsets.right,
    usableHeight: height - safeAreaInsets.top - safeAreaInsets.bottom,
  };
};