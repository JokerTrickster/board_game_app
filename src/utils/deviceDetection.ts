import { Dimensions, Platform } from 'react-native';

export enum DeviceCategory {
  PHONE_SMALL = 'phone_small',     // < 375px
  PHONE_REGULAR = 'phone_regular', // 375px - 428px  
  TABLET_SMALL = 'tablet_small',   // 768px - 834px
  TABLET_LARGE = 'tablet_large'    // > 834px
}

export enum Orientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape'
}

/**
 * Get current device dimensions
 */
export const getDeviceDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};

/**
 * Get screen dimensions (full screen including status bar)
 */
export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('screen');
  return { width, height };
};

/**
 * Detect device category based on screen width
 */
export const getDeviceCategory = (): DeviceCategory => {
  const { width } = getDeviceDimensions();
  
  if (width < 375) {
    return DeviceCategory.PHONE_SMALL;
  } else if (width >= 375 && width < 768) {
    return DeviceCategory.PHONE_REGULAR;
  } else if (width >= 768 && width < 834) {
    return DeviceCategory.TABLET_SMALL;
  } else {
    return DeviceCategory.TABLET_LARGE;
  }
};

/**
 * Check if device is a phone (any size)
 */
export const isPhone = (): boolean => {
  const category = getDeviceCategory();
  return category === DeviceCategory.PHONE_SMALL || category === DeviceCategory.PHONE_REGULAR;
};

/**
 * Check if device is a tablet (any size)
 */
export const isTablet = (): boolean => {
  const category = getDeviceCategory();
  return category === DeviceCategory.TABLET_SMALL || category === DeviceCategory.TABLET_LARGE;
};

/**
 * Detect current orientation
 */
export const getOrientation = (): Orientation => {
  const { width, height } = getDeviceDimensions();
  return width > height ? Orientation.LANDSCAPE : Orientation.PORTRAIT;
};

/**
 * Check if device is in landscape mode
 */
export const isLandscape = (): boolean => {
  return getOrientation() === Orientation.LANDSCAPE;
};

/**
 * Check if device is in portrait mode
 */
export const isPortrait = (): boolean => {
  return getOrientation() === Orientation.PORTRAIT;
};

/**
 * Get platform information
 */
export const getPlatformInfo = () => {
  return {
    OS: Platform.OS,
    version: Platform.Version,
    isAndroid: Platform.OS === 'android',
    isIOS: Platform.OS === 'ios',
  };
};

/**
 * Get comprehensive device information
 */
export const getDeviceInfo = () => {
  const dimensions = getDeviceDimensions();
  const screenDimensions = getScreenDimensions();
  const category = getDeviceCategory();
  const orientation = getOrientation();
  const platform = getPlatformInfo();
  
  return {
    dimensions,
    screenDimensions,
    category,
    orientation,
    platform,
    isPhone: isPhone(),
    isTablet: isTablet(),
    isLandscape: isLandscape(),
    isPortrait: isPortrait(),
  };
};

/**
 * Calculate scale factor based on device category
 * Returns multiplier for consistent scaling across devices
 */
export const getScaleFactor = (): number => {
  const category = getDeviceCategory();
  const { width } = getDeviceDimensions();
  
  switch (category) {
    case DeviceCategory.PHONE_SMALL:
      // Scale down slightly for small phones
      return Math.max(0.85, width / 375);
    case DeviceCategory.PHONE_REGULAR:
      // Standard scaling for regular phones
      return 1.0;
    case DeviceCategory.TABLET_SMALL:
      // Scale up moderately for small tablets
      return Math.min(1.3, width / 768 * 1.2);
    case DeviceCategory.TABLET_LARGE:
      // Scale up significantly for large tablets
      return Math.min(1.5, width / 1024 * 1.4);
    default:
      return 1.0;
  }
};