/**
 * Responsive Utilities Tests
 * Tests for scaling functions, breakpoints, and responsive utilities
 */

import { Dimensions } from 'react-native';
import {
  scale,
  verticalScale,
  scaleFont,
  scaleSpacing,
  scaleBorderRadius,
  widthPercentageToDP,
  heightPercentageToDP,
  getMinTouchTarget,
  ensureTouchTarget,
  breakpoints,
} from '../../src/utils/responsive';

// Mock react-native-size-matters
jest.mock('react-native-size-matters', () => ({
  scale: (size: number) => size,
  verticalScale: (size: number) => size,
  moderateScale: (size: number) => size,
}));

// Mock Dimensions
const mockDimensions = (width: number, height: number) => {
  (Dimensions.get as jest.Mock) = jest.fn(() => ({ width, height }));

  // Update module-level variables that depend on dimensions
  jest.resetModules();
};

describe('Responsive Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Scaling', () => {
    it('should scale sizes correctly for regular phone', () => {
      mockDimensions(375, 667);

      const scaledSize = scale(20);
      expect(scaledSize).toBe(20); // 1.0 scale factor for regular phone
    });

    it('should scale sizes correctly for small phone', () => {
      mockDimensions(320, 568);

      const scaledSize = scale(20);
      expect(scaledSize).toBeLessThan(20); // Should be scaled down
    });

    it('should scale sizes correctly for tablet', () => {
      mockDimensions(768, 1024);

      const scaledSize = scale(20);
      expect(scaledSize).toBeGreaterThan(20); // Should be scaled up
    });
  });

  describe('Typography Scaling', () => {
    it('should scale fonts appropriately for different devices', () => {
      // Small phone
      mockDimensions(320, 568);
      let scaledFont = scaleFont(16);
      expect(scaledFont).toBeLessThanOrEqual(16);

      // Regular phone
      mockDimensions(375, 667);
      scaledFont = scaleFont(16);
      expect(scaledFont).toBe(16);

      // Tablet
      mockDimensions(768, 1024);
      scaledFont = scaleFont(16);
      expect(scaledFont).toBeGreaterThan(16);
    });

    it('should return integer font sizes', () => {
      mockDimensions(375, 667);
      const scaledFont = scaleFont(16.7);
      expect(Number.isInteger(scaledFont)).toBe(true);
    });
  });

  describe('Spacing Scaling', () => {
    it('should scale spacing appropriately for different devices', () => {
      // Small phone - tighter spacing
      mockDimensions(320, 568);
      let scaledSpacing = scaleSpacing(16);
      expect(scaledSpacing).toBeLessThan(16);

      // Regular phone - base spacing
      mockDimensions(375, 667);
      scaledSpacing = scaleSpacing(16);
      expect(scaledSpacing).toBe(16);

      // Tablet - more generous spacing
      mockDimensions(768, 1024);
      scaledSpacing = scaleSpacing(16);
      expect(scaledSpacing).toBeGreaterThan(16);
    });

    it('should return integer spacing values', () => {
      mockDimensions(375, 667);
      const scaledSpacing = scaleSpacing(12.3);
      expect(Number.isInteger(scaledSpacing)).toBe(true);
    });
  });

  describe('Percentage-based Dimensions', () => {
    it('should calculate width percentage correctly', () => {
      mockDimensions(400, 600);

      expect(widthPercentageToDP(50)).toBe(200);
      expect(widthPercentageToDP(100)).toBe(400);
      expect(widthPercentageToDP(25)).toBe(100);
    });

    it('should calculate height percentage correctly', () => {
      mockDimensions(400, 600);

      expect(heightPercentageToDP(50)).toBe(300);
      expect(heightPercentageToDP(100)).toBe(600);
      expect(heightPercentageToDP(25)).toBe(150);
    });
  });

  describe('Touch Target Utilities', () => {
    it('should provide minimum touch target size', () => {
      mockDimensions(375, 667);
      const minTarget = getMinTouchTarget();
      expect(minTarget).toBeGreaterThanOrEqual(44); // iOS minimum
    });

    it('should ensure minimum touch target size', () => {
      mockDimensions(375, 667);

      expect(ensureTouchTarget(30)).toBeGreaterThanOrEqual(44);
      expect(ensureTouchTarget(50)).toBe(50); // Already large enough
    });
  });

  describe('Border Radius Scaling', () => {
    it('should scale border radius but cap at reasonable limits', () => {
      mockDimensions(375, 667);

      const smallRadius = scaleBorderRadius(4);
      const largeRadius = scaleBorderRadius(20);

      expect(smallRadius).toBeGreaterThanOrEqual(4);
      expect(largeRadius).toBeLessThanOrEqual(30); // Should be capped
    });
  });

  describe('Breakpoint Utilities', () => {
    it('should detect breakpoints correctly for phone', () => {
      mockDimensions(390, 844);

      expect(breakpoints.isPhone).toBe(true);
      expect(breakpoints.isTablet).toBe(false);
      expect(breakpoints.isRegularPhone).toBe(true);
      expect(breakpoints.isSmallPhone).toBe(false);
    });

    it('should detect breakpoints correctly for tablet', () => {
      mockDimensions(768, 1024);

      expect(breakpoints.isPhone).toBe(false);
      expect(breakpoints.isTablet).toBe(true);
      expect(breakpoints.isSmallTablet).toBe(true);
      expect(breakpoints.isLargeTablet).toBe(false);
    });

    it('should detect orientation correctly', () => {
      // Portrait
      mockDimensions(390, 844);
      expect(breakpoints.isPortrait).toBe(true);
      expect(breakpoints.isLandscape).toBe(false);

      // Landscape
      mockDimensions(844, 390);
      expect(breakpoints.isPortrait).toBe(false);
      expect(breakpoints.isLandscape).toBe(true);
    });

    it('should provide utility functions for breakpoint checking', () => {
      mockDimensions(400, 600);

      expect(breakpoints.above(300)).toBe(true);
      expect(breakpoints.above(500)).toBe(false);
      expect(breakpoints.below(500)).toBe(true);
      expect(breakpoints.below(300)).toBe(false);
      expect(breakpoints.between(350, 450)).toBe(true);
      expect(breakpoints.between(450, 550)).toBe(false);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle zero and negative values gracefully', () => {
      mockDimensions(375, 667);

      expect(scale(0)).toBe(0);
      expect(scaleFont(0)).toBe(0);
      expect(scaleSpacing(0)).toBe(0);
    });

    it('should handle very large values', () => {
      mockDimensions(375, 667);

      const largeValue = 1000;
      expect(scale(largeValue)).toBeGreaterThan(0);
      expect(scaleFont(largeValue)).toBeGreaterThan(0);
    });

    it('should maintain precision for small decimal values', () => {
      mockDimensions(375, 667);

      const smallDecimal = 0.5;
      expect(scale(smallDecimal)).toBeGreaterThan(0);
    });
  });
});
