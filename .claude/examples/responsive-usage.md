# Responsive Design System Usage Examples

## Import the Responsive System

```typescript
// Import specific utilities
import { scale, verticalScale, responsive, breakpoints } from '../utils';

// Import React hooks
import { useResponsive, useOrientation, useDeviceCategory } from '../utils';

// Import constants
import { BREAKPOINTS, TOUCH_TARGETS, ASPECT_RATIOS } from '../utils';
```

## Basic Scaling Examples

```typescript
import { StyleSheet } from 'react-native';
import { scale, verticalScale, responsive } from '../utils';

const styles = StyleSheet.create({
  container: {
    padding: responsive.spacing(16),
    marginTop: responsive.verticalScale(20),
  },
  
  title: {
    fontSize: responsive.font(24),
    marginBottom: responsive.spacing(12),
  },
  
  button: {
    width: responsive.scale(120),
    height: responsive.touchTarget(), // Ensures minimum 44pt touch target
    borderRadius: responsive.borderRadius(8),
  },
  
  card: {
    width: responsive.width(90), // 90% of screen width
    aspectRatio: ASPECT_RATIOS.CARD, // 0.8 aspect ratio
  },
});
```

## Using the useResponsive Hook

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useResponsive } from '../utils';

const ResponsiveComponent = () => {
  const {
    scale,
    verticalScale,
    scaleFont,
    isTablet,
    isLandscape,
    responsiveValue,
  } = useResponsive();
  
  // Get different values for different device types
  const cardColumns = responsiveValue({
    phone: 1,
    phoneRegular: 2,
    tablet: 3,
    tabletLarge: 4,
  });
  
  // Get different styles for device categories
  const containerPadding = responsiveValue({
    phone: scale(16),
    tablet: scale(24),
  });
  
  return (
    <View style={[styles.container, { padding: containerPadding }]}>
      <Text style={[styles.title, { fontSize: scaleFont(isTablet ? 28 : 22) }]}>
        {isLandscape ? 'Landscape Title' : 'Portrait Title'}
      </Text>
    </View>
  );
};
```

## Breakpoint-Based Styling

```typescript
import { StyleSheet } from 'react-native';
import { responsive, breakpoints } from '../utils';

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: breakpoints.isTablet ? 'space-around' : 'center',
  },
  
  gridItem: {
    width: breakpoints.isSmallPhone 
      ? '100%'  // Full width on small phones
      : breakpoints.isPhone 
        ? '45%' // Two columns on phones
        : '30%', // Three columns on tablets
    marginBottom: responsive.spacing(16),
  },
});
```

## Device Category Hook Usage

```typescript
import React from 'react';
import { useDeviceCategory, useOrientation } from '../utils';

const AdaptiveLayout = () => {
  // Get different values for device categories
  const itemsPerRow = useDeviceCategory({
    phoneSmall: 1,
    phoneRegular: 2,
    tabletSmall: 3,
    tabletLarge: 4,
  });
  
  // Get orientation-specific values
  const headerHeight = useOrientation(60, 44); // 60 for portrait, 44 for landscape
  
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {/* Render items based on itemsPerRow */}
    </View>
  );
};
```

## Migrating from Old Scaling System

### Before (Old System)
```typescript
// Old fixed scaling approach
const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 414;
const scale = (size: number) => (width / guidelineBaseWidth) * size;

const styles = StyleSheet.create({
  container: {
    width: scale(400),
    height: scale(277),
    padding: scale(16),
  },
});
```

### After (New Responsive System)
```typescript
// New responsive approach
import { responsive, ASPECT_RATIOS } from '../utils';

const styles = StyleSheet.create({
  container: {
    width: responsive.width(95), // 95% of screen width
    aspectRatio: ASPECT_RATIOS.PHOTO, // Consistent aspect ratio
    padding: responsive.spacing(16), // Device-aware spacing
  },
});
```

## Complex Responsive Patterns

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useResponsive, GRID_COLUMNS, TOUCH_TARGETS } from '../utils';

const ResponsiveGrid = ({ data }) => {
  const { scale, responsiveValue, isTablet } = useResponsive();
  
  // Dynamic grid based on device
  const columns = responsiveValue({
    phoneSmall: GRID_COLUMNS.PHONE_SMALL,
    phoneRegular: GRID_COLUMNS.PHONE_REGULAR,
    tabletSmall: GRID_COLUMNS.TABLET_SMALL,
    tabletLarge: GRID_COLUMNS.TABLET_LARGE,
  });
  
  // Adaptive spacing
  const spacing = responsiveValue({
    phone: scale(8),
    tablet: scale(16),
  });
  
  const itemWidth = `${100 / columns - 2}%`;
  
  return (
    <View style={[styles.grid, { gap: spacing }]}>
      {data.map((item, index) => (
        <View 
          key={index} 
          style={[
            styles.gridItem, 
            { 
              width: itemWidth,
              minHeight: scale(TOUCH_TARGETS.RECOMMENDED),
            }
          ]}
        >
          {/* Item content */}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
  },
});
```

## Safe Area Integration

```typescript
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaDimensions } from '../utils';

const SafeAreaLayout = ({ children }) => {
  const { usableWidth, usableHeight, safeAreaInsets } = useSafeAreaDimensions();
  
  return (
    <View style={{
      width: usableWidth,
      height: usableHeight,
      paddingTop: safeAreaInsets.top,
      paddingBottom: safeAreaInsets.bottom,
      paddingLeft: safeAreaInsets.left,
      paddingRight: safeAreaInsets.right,
    }}>
      {children}
    </View>
  );
};
```

## Testing Responsive Components

```typescript
import { getDeviceCategory, DeviceCategory } from '../utils';

// Mock device dimensions for testing
jest.mock('react-native', () => ({
  Dimensions: {
    get: jest.fn(() => ({ width: 768, height: 1024 })), // Tablet size
  },
}));

describe('Responsive Component', () => {
  it('should detect tablet category', () => {
    expect(getDeviceCategory()).toBe(DeviceCategory.TABLET_SMALL);
  });
  
  it('should render appropriate columns for tablet', () => {
    const columns = useDeviceCategory({
      phone: 2,
      tablet: 3,
    });
    expect(columns).toBe(3);
  });
});
```