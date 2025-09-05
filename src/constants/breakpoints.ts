/**
 * Responsive breakpoints for different device categories
 * Based on common device sizes and design system standards
 */
export const BREAKPOINTS = {
  // Phone breakpoints
  PHONE_SMALL: 375,      // iPhone SE, small Android phones
  PHONE_REGULAR: 428,    // iPhone 14, most modern phones
  
  // Tablet breakpoints  
  TABLET_SMALL: 768,     // iPad Mini, small tablets
  TABLET_REGULAR: 834,   // iPad (10.2"), regular tablets
  TABLET_LARGE: 1024,    // iPad Pro (11"), large tablets
  TABLET_XL: 1366,       // iPad Pro (12.9"), desktop-class tablets
} as const;

/**
 * Responsive typography scale factors
 */
export const TYPOGRAPHY_SCALES = {
  PHONE_SMALL: 0.9,      // Smaller text for compact phones
  PHONE_REGULAR: 1.0,    // Base typography size
  TABLET_SMALL: 1.1,     // Slightly larger for tablets
  TABLET_LARGE: 1.2,     // More readable text on large screens
} as const;

/**
 * Spacing scale multipliers
 */
export const SPACING_SCALES = {
  PHONE_SMALL: 0.85,     // Tighter spacing for small screens
  PHONE_REGULAR: 1.0,    // Base spacing
  TABLET_SMALL: 1.15,    // More generous spacing on tablets
  TABLET_LARGE: 1.3,     // Ample spacing for large screens
} as const;

/**
 * Touch target minimum sizes (in dp/pt)
 * Following platform accessibility guidelines
 */
export const TOUCH_TARGETS = {
  MINIMUM: 44,           // iOS/Android minimum
  RECOMMENDED: 48,       // Recommended comfortable size
  LARGE: 56,            // Large touch targets for accessibility
} as const;

/**
 * Container max widths for different breakpoints
 * Prevents content from becoming too wide on large screens
 */
export const CONTAINER_MAX_WIDTHS = {
  PHONE: '100%',         // Full width on phones
  TABLET_SMALL: '90%',   // Slight padding on small tablets
  TABLET_LARGE: '85%',   // More padding on large tablets
  DESKTOP: '1200px',     // Max width for desktop-class devices
} as const;

/**
 * Grid system columns for different breakpoints
 */
export const GRID_COLUMNS = {
  PHONE_SMALL: 1,        // Single column on small phones
  PHONE_REGULAR: 2,      // Two columns on regular phones
  TABLET_SMALL: 3,       // Three columns on small tablets
  TABLET_LARGE: 4,       // Four columns on large tablets
} as const;

/**
 * Common aspect ratios for responsive design
 */
export const ASPECT_RATIOS = {
  SQUARE: 1,             // 1:1
  CARD: 0.8,            // 4:5 (card-like)
  PHOTO: 0.75,          // 3:4 (photo-like)
  VIDEO: 0.5625,        // 9:16 (video)
  WIDE: 0.4,            // Wide banner style
} as const;

/**
 * Animation durations for responsive transitions
 */
export const ANIMATION_DURATIONS = {
  FAST: 150,            // Quick transitions
  NORMAL: 250,          // Standard transitions
  SLOW: 350,            // Slower, more noticeable transitions
} as const;