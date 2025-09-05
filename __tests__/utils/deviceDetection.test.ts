/**
 * Device Detection Tests
 * Tests for device category detection, orientation, and scaling factors
 */

import { Dimensions } from 'react-native';
import {
  getDeviceCategory,
  getOrientation,
  getScaleFactor,
  isPhone,
  isTablet,
  isLandscape,
  isPortrait,
  DeviceCategory,
  Orientation,
} from '../../src/utils/deviceDetection';

// Mock Dimensions
const mockDimensions = (width: number, height: number) => {
  (Dimensions.get as jest.Mock) = jest.fn(() => ({ width, height }));
};

describe('Device Detection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Device Category Detection', () => {
    it('should detect small phone correctly', () => {
      mockDimensions(320, 568); // iPhone SE
      expect(getDeviceCategory()).toBe(DeviceCategory.PHONE_SMALL);
      expect(isPhone()).toBe(true);
      expect(isTablet()).toBe(false);
    });

    it('should detect regular phone correctly', () => {
      mockDimensions(390, 844); // iPhone 14
      expect(getDeviceCategory()).toBe(DeviceCategory.PHONE_REGULAR);
      expect(isPhone()).toBe(true);
      expect(isTablet()).toBe(false);
    });

    it('should detect small tablet correctly', () => {
      mockDimensions(768, 1024); // iPad Mini
      expect(getDeviceCategory()).toBe(DeviceCategory.TABLET_SMALL);
      expect(isPhone()).toBe(false);
      expect(isTablet()).toBe(true);
    });

    it('should detect large tablet correctly', () => {
      mockDimensions(1024, 1366); // iPad Pro
      expect(getDeviceCategory()).toBe(DeviceCategory.TABLET_LARGE);
      expect(isPhone()).toBe(false);
      expect(isTablet()).toBe(true);
    });
  });

  describe('Orientation Detection', () => {
    it('should detect portrait orientation', () => {
      mockDimensions(390, 844);
      expect(getOrientation()).toBe(Orientation.PORTRAIT);
      expect(isPortrait()).toBe(true);
      expect(isLandscape()).toBe(false);
    });

    it('should detect landscape orientation', () => {
      mockDimensions(844, 390);
      expect(getOrientation()).toBe(Orientation.LANDSCAPE);
      expect(isLandscape()).toBe(true);
      expect(isPortrait()).toBe(false);
    });

    it('should handle square screens', () => {
      mockDimensions(500, 500);
      expect(getOrientation()).toBe(Orientation.PORTRAIT);
      expect(isPortrait()).toBe(true);
    });
  });

  describe('Scale Factor Calculation', () => {
    it('should provide correct scale factor for small phone', () => {
      mockDimensions(320, 568);
      const scaleFactor = getScaleFactor();
      expect(scaleFactor).toBeCloseTo(0.85, 2);
    });

    it('should provide correct scale factor for regular phone', () => {
      mockDimensions(375, 667);
      const scaleFactor = getScaleFactor();
      expect(scaleFactor).toBe(1.0);
    });

    it('should provide correct scale factor for small tablet', () => {
      mockDimensions(768, 1024);
      const scaleFactor = getScaleFactor();
      expect(scaleFactor).toBeGreaterThan(1.0);
      expect(scaleFactor).toBeLessThanOrEqual(1.3);
    });

    it('should provide correct scale factor for large tablet', () => {
      mockDimensions(1024, 1366);
      const scaleFactor = getScaleFactor();
      expect(scaleFactor).toBeGreaterThan(1.2);
      expect(scaleFactor).toBeLessThanOrEqual(1.5);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small screens', () => {
      mockDimensions(240, 320);
      expect(getDeviceCategory()).toBe(DeviceCategory.PHONE_SMALL);
      const scaleFactor = getScaleFactor();
      expect(scaleFactor).toBeGreaterThanOrEqual(0.85);
    });

    it('should handle very large screens', () => {
      mockDimensions(1920, 1080);
      expect(getDeviceCategory()).toBe(DeviceCategory.TABLET_LARGE);
      const scaleFactor = getScaleFactor();
      expect(scaleFactor).toBeLessThanOrEqual(1.5);
    });

    it('should handle boundary values', () => {
      // Exact boundary - 375px
      mockDimensions(375, 667);
      expect(getDeviceCategory()).toBe(DeviceCategory.PHONE_REGULAR);
      
      // Just below boundary - 374px
      mockDimensions(374, 667);
      expect(getDeviceCategory()).toBe(DeviceCategory.PHONE_SMALL);
      
      // Tablet boundary - 768px
      mockDimensions(768, 1024);
      expect(getDeviceCategory()).toBe(DeviceCategory.TABLET_SMALL);
      
      // Just below tablet boundary - 767px
      mockDimensions(767, 1024);
      expect(getDeviceCategory()).toBe(DeviceCategory.PHONE_REGULAR);
    });
  });
});