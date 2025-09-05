import { Dimensions } from 'react-native';
import { moderateScale, scale as sizeMattersScale, verticalScale as sizeMattersVerticalScale } from 'react-native-size-matters';
import { getDeviceCategory, getScaleFactor, DeviceCategory } from './deviceDetection';
import { BREAKPOINTS, TYPOGRAPHY_SCALES, SPACING_SCALES, TOUCH_TARGETS } from '../constants/breakpoints';

// Get current dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * Enhanced responsive scaling utilities
 * Combines react-native-size-matters with our device-aware system
 */

/**
 * Scale size based on device category and screen width
 * Uses device-aware scaling factor for consistent appearance
 */
export const scale = (size: number): number => {
  const scaleFactor = getScaleFactor();
  return sizeMattersScale(size) * scaleFactor;
};

/**
 * Scale vertical dimensions with device awareness
 */
export const verticalScale = (size: number): number => {
  const scaleFactor = getScaleFactor();
  return sizeMattersVerticalScale(size) * scaleFactor;
};

/**
 * Moderate scale with enhanced device awareness
 * @param size - Base size to scale
 * @param factor - Custom scaling factor (optional)
 */
export const moderateScaleEnhanced = (size: number, factor?: number): number => {
  const deviceScaleFactor = getScaleFactor();
  const baseFactor = factor || 0.5;
  return moderateScale(size, baseFactor) * deviceScaleFactor;
};

/**
 * Typography scaling based on device category
 */
export const scaleFont = (fontSize: number): number => {
  const category = getDeviceCategory();
  let typographyScale = TYPOGRAPHY_SCALES.PHONE_REGULAR;

  switch (category) {
    case DeviceCategory.PHONE_SMALL:
      typographyScale = TYPOGRAPHY_SCALES.PHONE_SMALL;
      break;
    case DeviceCategory.PHONE_REGULAR:
      typographyScale = TYPOGRAPHY_SCALES.PHONE_REGULAR;
      break;
    case DeviceCategory.TABLET_SMALL:
      typographyScale = TYPOGRAPHY_SCALES.TABLET_SMALL;
      break;
    case DeviceCategory.TABLET_LARGE:
      typographyScale = TYPOGRAPHY_SCALES.TABLET_LARGE;
      break;
  }

  return Math.round(fontSize * typographyScale);
};

/**
 * Spacing scaling based on device category
 */
export const scaleSpacing = (spacing: number): number => {
  const category = getDeviceCategory();
  let spacingScale = SPACING_SCALES.PHONE_REGULAR;

  switch (category) {
    case DeviceCategory.PHONE_SMALL:
      spacingScale = SPACING_SCALES.PHONE_SMALL;
      break;
    case DeviceCategory.PHONE_REGULAR:
      spacingScale = SPACING_SCALES.PHONE_REGULAR;
      break;
    case DeviceCategory.TABLET_SMALL:
      spacingScale = SPACING_SCALES.TABLET_SMALL;
      break;
    case DeviceCategory.TABLET_LARGE:
      spacingScale = SPACING_SCALES.TABLET_LARGE;
      break;
  }

  return Math.round(spacing * spacingScale);
};

/**
 * Get responsive width as percentage of screen width
 */
export const widthPercentageToDP = (percentage: number): number => {
  return (screenWidth * percentage) / 100;
};

/**
 * Get responsive height as percentage of screen height
 */
export const heightPercentageToDP = (percentage: number): number => {
  return (screenHeight * percentage) / 100;
};

/**
 * Get minimum touch target size for current device
 */
export const getMinTouchTarget = (): number => {
  return scale(TOUCH_TARGETS.RECOMMENDED);
};

/**
 * Ensure size meets minimum touch target requirements
 */
export const ensureTouchTarget = (size: number): number => {
  const minTarget = getMinTouchTarget();
  return Math.max(size, minTarget);
};

/**
 * Get responsive border radius
 * Scales proportionally with screen size but caps at reasonable limits
 */
export const scaleBorderRadius = (radius: number): number => {
  const scaled = scale(radius);
  // Cap border radius to prevent overly rounded elements on large screens
  return Math.min(scaled, radius * 1.5);
};

/**
 * Get responsive elevation/shadow
 * Tablets can handle more prominent shadows
 */
export const scaleElevation = (elevation: number): number => {
  const category = getDeviceCategory();

  if (category === DeviceCategory.TABLET_SMALL || category === DeviceCategory.TABLET_LARGE) {
    return Math.min(elevation * 1.2, elevation + 4);
  }

  return elevation;
};

/**
 * Responsive layout utilities
 */
export const responsive = {
  // Basic scaling
  scale,
  verticalScale,
  moderateScale: moderateScaleEnhanced,

  // Specialized scaling
  font: scaleFont,
  spacing: scaleSpacing,
  borderRadius: scaleBorderRadius,
  elevation: scaleElevation,

  // Percentage-based
  width: widthPercentageToDP,
  height: heightPercentageToDP,

  // Touch targets
  touchTarget: getMinTouchTarget,
  ensureTouchTarget,

  // Screen dimensions
  screenWidth,
  screenHeight,

  // Utility functions
  min: (a: number, b: number) => Math.min(a, b),
  max: (a: number, b: number) => Math.max(a, b),
  clamp: (value: number, min: number, max: number) => Math.min(Math.max(value, min), max),
};

/**
 * Responsive breakpoint utilities
 */
export const breakpoints = {
  isSmallPhone: screenWidth < BREAKPOINTS.PHONE_SMALL,
  isRegularPhone: screenWidth >= BREAKPOINTS.PHONE_SMALL && screenWidth < BREAKPOINTS.TABLET_SMALL,
  isPhone: screenWidth < BREAKPOINTS.TABLET_SMALL,
  isSmallTablet: screenWidth >= BREAKPOINTS.TABLET_SMALL && screenWidth < BREAKPOINTS.TABLET_LARGE,
  isLargeTablet: screenWidth >= BREAKPOINTS.TABLET_LARGE,
  isTablet: screenWidth >= BREAKPOINTS.TABLET_SMALL,

  // Orientation
  isLandscape: screenWidth > screenHeight,
  isPortrait: screenHeight >= screenWidth,

  // Specific breakpoint checks
  above: (breakpoint: number) => screenWidth > breakpoint,
  below: (breakpoint: number) => screenWidth < breakpoint,
  between: (min: number, max: number) => screenWidth >= min && screenWidth <= max,
};
