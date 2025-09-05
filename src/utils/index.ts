/**
 * Responsive Design System - Main Export File
 *
 * This module provides a comprehensive responsive design system for React Native
 * including device detection, responsive scaling, breakpoints, and React hooks.
 */

// Device Detection
export {
  getDeviceDimensions,
  getScreenDimensions,
  getDeviceCategory,
  getOrientation,
  getScaleFactor,
  getDeviceInfo,
  getPlatformInfo,
  isPhone,
  isTablet,
  isLandscape,
  isPortrait,
  DeviceCategory,
  Orientation,
} from './deviceDetection';

// Responsive Utilities
export {
  scale,
  verticalScale,
  moderateScaleEnhanced as moderateScale,
  scaleFont,
  scaleSpacing,
  scaleBorderRadius,
  scaleElevation,
  widthPercentageToDP,
  heightPercentageToDP,
  getMinTouchTarget,
  ensureTouchTarget,
  responsive,
  breakpoints,
} from './responsive';

// Constants
export {
  BREAKPOINTS,
  TYPOGRAPHY_SCALES,
  SPACING_SCALES,
  TOUCH_TARGETS,
  CONTAINER_MAX_WIDTHS,
  GRID_COLUMNS,
  ASPECT_RATIOS,
  ANIMATION_DURATIONS,
} from '../constants/breakpoints';

// React Hooks
export {
  useResponsive,
  useOrientation,
  useDeviceCategory,
  useSafeAreaDimensions,
} from '../hooks/useResponsive';
