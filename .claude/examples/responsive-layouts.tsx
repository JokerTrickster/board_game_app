/**
 * Enhanced Responsive Layout Examples
 * 
 * This file demonstrates advanced responsive patterns including:
 * - Orientation-specific layouts
 * - Tablet optimizations
 * - Dynamic grid systems
 * - Responsive navigation
 * - Adaptive components
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { 
  useResponsive, 
  useOrientation, 
  useDeviceCategory,
  responsive,
  ASPECT_RATIOS,
  GRID_COLUMNS 
} from '../../src/utils';

/**
 * Example 1: Responsive Game Grid
 * Adapts columns based on device category and orientation
 */
export const ResponsiveGameGrid: React.FC<{ games: any[] }> = ({ games }) => {
  const { isTablet, isLandscape, responsiveValue } = useResponsive();
  
  // Dynamic columns based on device and orientation
  const columns = responsiveValue({
    phoneSmall: isLandscape ? 2 : 1,
    phoneRegular: isLandscape ? 3 : 2,
    tabletSmall: isLandscape ? 4 : 3,
    tabletLarge: isLandscape ? 5 : 4,
  });
  
  // Adaptive spacing
  const spacing = responsiveValue({
    phone: responsive.spacing(8),
    tablet: responsive.spacing(16),
  });
  
  return (
    <View style={[styles.gameGrid, { gap: spacing }]}>
      {games.map((game, index) => (
        <View 
          key={index}
          style={[
            styles.gameCard,
            {
              width: `${100 / columns - 2}%`,
              marginBottom: spacing,
            }
          ]}
        >
          <Image source={game.image} style={styles.gameImage} />
          <Text style={styles.gameTitle}>{game.title}</Text>
        </View>
      ))}
    </View>
  );
};

/**
 * Example 2: Orientation-Aware Header
 * Different layouts for portrait vs landscape
 */
export const ResponsiveHeader: React.FC = () => {
  const headerHeight = useOrientation(
    responsive.verticalScale(80),  // Portrait
    responsive.verticalScale(60)   // Landscape
  );
  
  const { isLandscape, isTablet } = useResponsive();
  
  if (isLandscape) {
    // Horizontal layout for landscape
    return (
      <View style={[styles.header, { height: headerHeight }]}>
        <View style={styles.headerLeft}>
          <Image style={styles.logo} source={require('../../assets/logo.png')} />
          <Text style={styles.headerTitle}>Board Games</Text>
        </View>
        <View style={styles.headerActions}>
          <Text style={styles.coinCount}>1,250</Text>
          <Image style={styles.settingsIcon} source={require('../../assets/settings.png')} />
        </View>
      </View>
    );
  }
  
  // Vertical layout for portrait (especially on small phones)
  return (
    <View style={[styles.header, { height: headerHeight * (isTablet ? 1.2 : 1) }]}>
      <View style={styles.headerRow}>
        <Image style={styles.logo} source={require('../../assets/logo.png')} />
        <Text style={styles.headerTitle}>Board Games</Text>
      </View>
      <View style={styles.headerRow}>
        <Text style={styles.coinCount}>1,250</Text>
        <Image style={styles.settingsIcon} source={require('../../assets/settings.png')} />
      </View>
    </View>
  );
};

/**
 * Example 3: Tablet-Optimized Profile Section
 * Enhanced layout for tablets with more content
 */
export const ResponsiveProfile: React.FC<{ user: any }> = ({ user }) => {
  const { isTablet, responsiveValue, scale } = useResponsive();
  
  // Tablet gets enhanced profile layout
  const profileImageSize = responsiveValue({
    phone: scale(60),
    tablet: scale(80),
  });
  
  const showExtendedInfo = isTablet;
  
  return (
    <View style={[
      styles.profileContainer,
      isTablet && styles.profileContainerTablet
    ]}>
      <Image 
        source={user.avatar} 
        style={[
          styles.profileImage,
          { width: profileImageSize, height: profileImageSize }
        ]}
      />
      
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{user.name}</Text>
        <Text style={styles.profileLevel}>Level {user.level}</Text>
        
        {/* Extended info only on tablets */}
        {showExtendedInfo && (
          <View style={styles.profileStats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{user.gamesPlayed}</Text>
              <Text style={styles.statLabel}>Games</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{user.winRate}%</Text>
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{user.rank}</Text>
              <Text style={styles.statLabel}>Rank</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

/**
 * Example 4: Responsive Modal
 * Adapts size and positioning based on device
 */
export const ResponsiveModal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { responsiveValue, isLandscape } = useResponsive();
  
  const modalWidth = responsiveValue({
    phoneSmall: '90%',
    phoneRegular: '85%',
    tablet: isLandscape ? '60%' : '70%',
  });
  
  const modalMaxHeight = responsiveValue({
    phone: '80%',
    tablet: '70%',
  });
  
  return (
    <View style={styles.modalOverlay}>
      <View style={[
        styles.modalContent,
        {
          width: modalWidth,
          maxHeight: modalMaxHeight,
        }
      ]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </View>
    </View>
  );
};

/**
 * Example 5: Adaptive Button Bar
 * Changes layout based on available space
 */
export const ResponsiveButtonBar: React.FC<{ actions: any[] }> = ({ actions }) => {
  const { isTablet, isLandscape, responsiveValue } = useResponsive();
  
  // Tablets can show more buttons in a row
  const buttonsPerRow = responsiveValue({
    phoneSmall: isLandscape ? 3 : 2,
    phoneRegular: isLandscape ? 4 : 3,
    tablet: isLandscape ? 6 : 4,
  });
  
  const buttonWidth = `${100 / buttonsPerRow - 2}%`;
  
  return (
    <View style={styles.buttonBar}>
      {actions.map((action, index) => (
        <View 
          key={index}
          style={[
            styles.actionButton,
            { width: buttonWidth }
          ]}
        >
          <Image source={action.icon} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>{action.label}</Text>
        </View>
      ))}
    </View>
  );
};

/**
 * Styles using the new responsive system
 */
const styles = StyleSheet.create({
  // Game Grid
  gameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: responsive.spacing(16),
  },
  
  gameCard: {
    backgroundColor: '#fff',
    borderRadius: responsive.borderRadius(12),
    padding: responsive.spacing(12),
    elevation: responsive.elevation(4),
    aspectRatio: ASPECT_RATIOS.CARD,
  },
  
  gameImage: {
    width: '100%',
    flex: 1,
    borderRadius: responsive.borderRadius(8),
    resizeMode: 'cover',
    marginBottom: responsive.spacing(8),
  },
  
  gameTitle: {
    fontSize: responsive.font(14),
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsive.spacing(16),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: responsive.elevation(2),
  },
  
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  logo: {
    width: responsive.scale(32),
    height: responsive.scale(32),
    marginRight: responsive.spacing(12),
  },
  
  headerTitle: {
    fontSize: responsive.font(18),
    fontWeight: 'bold',
    color: '#333',
  },
  
  coinCount: {
    fontSize: responsive.font(16),
    fontWeight: 'bold',
    color: '#f39c12',
    marginRight: responsive.spacing(16),
  },
  
  settingsIcon: {
    width: responsive.scale(24),
    height: responsive.scale(24),
    tintColor: '#666',
  },
  
  // Profile
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: responsive.spacing(16),
    backgroundColor: '#fff',
    marginVertical: responsive.spacing(8),
    borderRadius: responsive.borderRadius(12),
    elevation: responsive.elevation(2),
  },
  
  profileContainerTablet: {
    padding: responsive.spacing(24),
    marginVertical: responsive.spacing(12),
  },
  
  profileImage: {
    borderRadius: 100,
    marginRight: responsive.spacing(16),
  },
  
  profileInfo: {
    flex: 1,
  },
  
  profileName: {
    fontSize: responsive.font(18),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: responsive.spacing(4),
  },
  
  profileLevel: {
    fontSize: responsive.font(14),
    color: '#666',
  },
  
  profileStats: {
    flexDirection: 'row',
    marginTop: responsive.spacing(12),
    justifyContent: 'space-around',
  },
  
  stat: {
    alignItems: 'center',
  },
  
  statValue: {
    fontSize: responsive.font(20),
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  
  statLabel: {
    fontSize: responsive.font(12),
    color: '#7f8c8d',
    marginTop: responsive.spacing(4),
  },
  
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsive.spacing(20),
  },
  
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: responsive.borderRadius(16),
    padding: responsive.spacing(20),
    elevation: responsive.elevation(8),
  },
  
  // Button Bar
  buttonBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: responsive.spacing(16),
  },
  
  actionButton: {
    alignItems: 'center',
    padding: responsive.spacing(12),
    marginBottom: responsive.spacing(12),
    backgroundColor: '#f8f9fa',
    borderRadius: responsive.borderRadius(8),
    minHeight: responsive.touchTarget(),
  },
  
  buttonIcon: {
    width: responsive.scale(24),
    height: responsive.scale(24),
    marginBottom: responsive.spacing(4),
  },
  
  buttonText: {
    fontSize: responsive.font(12),
    color: '#333',
    textAlign: 'center',
  },
});