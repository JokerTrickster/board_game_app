/**
 * Migration Example: Converting ReactSoloFindItStyles to use Responsive System
 * 
 * This example shows how to migrate from the old fixed-scaling approach
 * to the new responsive design system.
 */

import { StyleSheet } from 'react-native';
import { responsive, ASPECT_RATIOS, TOUCH_TARGETS } from '../../src/utils';

// OLD APPROACH (Before Migration)
// ================================
/*
const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 414;
const guidelineBaseHeight = 736;

const scale = (size: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;

const oldStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#f4f4f4',
  },
  
  gameContainer: {
    width: width * 0.98,    // Fixed percentage
    height: height * 0.715, // Fixed percentage
    borderWidth: scale(3),
    borderColor: '#FC9D99',
    zIndex: 1,
  },
  
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',         // Fixed after our critical fix
    marginTop: verticalScale(-5),
    marginBottom: verticalScale(10),
    zIndex: 1,
  },
  
  timerImage: {
    width: scale(35),
    height: scale(35),
    marginLeft: scale(-10),
    zIndex: 3,
  },
});
*/

// NEW APPROACH (After Migration)
// ===============================

export const newResponsiveStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#f4f4f4',
  },
  
  gameContainer: {
    width: responsive.width(95),        // Responsive width percentage
    aspectRatio: ASPECT_RATIOS.PHOTO,   // Consistent aspect ratio (0.75)
    borderWidth: responsive.scale(3),
    borderColor: '#FC9D99',
    zIndex: 1,
  },
  
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',                      // Safe width
    marginTop: responsive.verticalScale(-5),
    marginBottom: responsive.spacing(10), // Device-aware spacing
    zIndex: 1,
  },
  
  timerImage: {
    width: responsive.scale(35),
    height: responsive.scale(35),
    marginLeft: responsive.scale(-10),
    zIndex: 3,
  },
  
  // Enhanced responsive patterns
  timerBarBorder: {
    flex: 1,
    height: responsive.ensureTouchTarget(20), // Ensures minimum touch target
    borderRadius: responsive.borderRadius(10),
    marginLeft: responsive.scale(-5),
    borderWidth: responsive.scale(3),
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    zIndex: 2,
  },
  
  infoButton: {
    backgroundColor: '#FFD700',
    paddingVertical: responsive.spacing(10),
    paddingHorizontal: responsive.spacing(16),
    borderRadius: responsive.borderRadius(10),
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    maxWidth: responsive.scale(100),
    marginHorizontal: responsive.spacing(5),
    elevation: responsive.elevation(3),
    minHeight: responsive.touchTarget(), // Accessibility-compliant touch target
  },
  
  infoButtonText: {
    fontSize: responsive.font(14),      // Device-aware typography
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
});

// USAGE WITH RESPONSIVE HOOK
// ===========================

import React from 'react';
import { View, Text, Image } from 'react-native';
import { useResponsive, useDeviceCategory } from '../../src/utils';

export const ResponsiveFindItGame: React.FC = () => {
  const {
    scale,
    verticalScale,
    scaleFont,
    scaleSpacing,
    isTablet,
    isLandscape,
    responsiveValue,
  } = useResponsive();
  
  // Get device-specific values
  const gameContainerWidth = responsiveValue({
    phone: 95,      // 95% on phones
    tablet: 85,     // 85% on tablets for better padding
  });
  
  const timerImageSize = useDeviceCategory({
    phoneSmall: scale(30),  // Smaller on compact phones
    phoneRegular: scale(35), // Standard size
    tablet: scale(40),      // Larger on tablets
  });
  
  const overlayStyle = {
    ...newResponsiveStyles.clearEffectContainer,
    // Dynamic positioning based on device
    width: responsiveValue({
      phone: scale(280),
      tablet: scale(350),
    }),
    height: responsiveValue({
      phone: scale(160),
      tablet: scale(200),
    }),
  };
  
  return (
    <View style={newResponsiveStyles.container}>
      <View style={[
        newResponsiveStyles.gameContainer,
        { width: responsive.width(gameContainerWidth) }
      ]}>
        {/* Game content */}
      </View>
      
      <View style={newResponsiveStyles.timerContainer}>
        <Image 
          source={require('../../assets/timer.png')}
          style={[
            newResponsiveStyles.timerImage,
            { 
              width: timerImageSize,
              height: timerImageSize,
            }
          ]}
        />
        
        <View style={newResponsiveStyles.timerBarBorder}>
          {/* Timer bar content */}
        </View>
      </View>
      
      {/* Responsive overlay */}
      <View style={overlayStyle}>
        <Text style={{
          fontSize: scaleFont(isTablet ? 32 : 28),
          color: '#363010',
          textAlign: 'center',
        }}>
          {isLandscape ? 'Game Complete!' : 'Well Done!'}
        </Text>
      </View>
    </View>
  );
};

// MIGRATION BENEFITS
// ==================

/**
 * Benefits of the New Responsive System:
 * 
 * 1. **Device Awareness**: Automatically adapts to phone vs tablet
 * 2. **Orientation Support**: Different values for portrait vs landscape
 * 3. **Accessibility**: Ensures minimum touch target sizes
 * 4. **Consistent Scaling**: Unified scaling system across the app
 * 5. **Flexible Values**: Easy to provide different values per device
 * 6. **Type Safety**: TypeScript support for better development experience
 * 7. **Performance**: Optimized calculations with caching
 * 8. **Maintainable**: Centralized responsive logic
 * 9. **Testable**: Well-tested utilities with comprehensive coverage
 * 10. **Future-Proof**: Easy to add new device categories or breakpoints
 */

// BEST PRACTICES FOR MIGRATION
// =============================

/**
 * Migration Checklist:
 * 
 * ✅ Replace fixed Dimensions calculations with responsive.width/height
 * ✅ Use aspectRatio instead of fixed heights where possible
 * ✅ Replace custom scale functions with responsive.scale
 * ✅ Use responsive.font for typography
 * ✅ Use responsive.spacing for margins/padding
 * ✅ Ensure touch targets meet minimum requirements
 * ✅ Add device-specific values using responsiveValue
 * ✅ Test on multiple device sizes
 * ✅ Consider orientation-specific layouts
 * ✅ Use breakpoints for conditional styling
 */