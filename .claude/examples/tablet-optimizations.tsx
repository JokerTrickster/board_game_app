/**
 * Tablet-Specific Optimizations
 * 
 * This file demonstrates advanced tablet optimization patterns:
 * - Multi-column layouts
 * - Enhanced spacing and typography
 * - Sidebar navigation
 * - Split-screen interfaces
 * - Tablet-first design patterns
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useResponsive, responsive, ASPECT_RATIOS } from '../../src/utils';

/**
 * Tablet-Optimized Game Selection Screen
 * Uses multi-column layout and enhanced visual hierarchy
 */
export const TabletGameSelection: React.FC<{ games: any[] }> = ({ games }) => {
  const { isTablet, isLandscape, responsiveValue } = useResponsive();
  
  if (!isTablet) {
    // Fall back to mobile layout
    return <MobileGameSelection games={games} />;
  }
  
  // Tablet-specific layout with sidebar + main content
  return (
    <View style={styles.tabletContainer}>
      {/* Sidebar for categories (tablet only) */}
      <View style={[
        styles.sidebar,
        { width: isLandscape ? '25%' : '30%' }
      ]}>
        <Text style={styles.sidebarTitle}>Categories</Text>
        {['All Games', 'Strategy', 'Puzzle', 'Action', 'Family'].map((category, index) => (
          <View key={index} style={styles.categoryItem}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        ))}
      </View>
      
      {/* Main content area */}
      <View style={styles.mainContent}>
        <Text style={styles.mainTitle}>Game Library</Text>
        
        {/* Enhanced grid for tablets */}
        <ScrollView 
          contentContainerStyle={styles.tabletGameGrid}
          showsVerticalScrollIndicator={false}
        >
          {games.map((game, index) => (
            <View key={index} style={styles.tabletGameCard}>
              <View style={styles.gameImageContainer}>
                {/* Game image would go here */}
              </View>
              
              <View style={styles.gameInfo}>
                <Text style={styles.gameTitle}>{game.title}</Text>
                <Text style={styles.gameDescription}>{game.description}</Text>
                
                <View style={styles.gameMetadata}>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>★ {game.rating}</Text>
                  </View>
                  
                  <View style={styles.playersContainer}>
                    <Text style={styles.playersText}>{game.players} players</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

/**
 * Tablet-Enhanced Game Board Interface
 * Takes advantage of larger screen real estate
 */
export const TabletGameBoard: React.FC = () => {
  const { isTablet, isLandscape } = useResponsive();
  
  if (!isTablet) {
    return <MobileGameBoard />;
  }
  
  return (
    <View style={styles.tabletGameBoard}>
      {/* Game area - larger on tablets */}
      <View style={[
        styles.gameArea,
        { 
          width: isLandscape ? '70%' : '100%',
          aspectRatio: isLandscape ? ASPECT_RATIOS.WIDE : ASPECT_RATIOS.PHOTO
        }
      ]}>
        {/* Game board content */}
        <View style={styles.gameBoardContent}>
          <Text style={styles.gameAreaTitle}>Game Board</Text>
          {/* Game board would render here */}
        </View>
      </View>
      
      {/* Side panel for controls (landscape tablets only) */}
      {isLandscape && (
        <View style={styles.controlPanel}>
          <Text style={styles.controlPanelTitle}>Game Controls</Text>
          
          {/* Enhanced controls for tablets */}
          <View style={styles.controlSection}>
            <Text style={styles.controlSectionTitle}>Timer</Text>
            <View style={styles.timerDisplay}>
              <Text style={styles.timerText}>2:45</Text>
            </View>
          </View>
          
          <View style={styles.controlSection}>
            <Text style={styles.controlSectionTitle}>Score</Text>
            <View style={styles.scoreDisplay}>
              <Text style={styles.scoreText}>1,250</Text>
            </View>
          </View>
          
          <View style={styles.controlSection}>
            <Text style={styles.controlSectionTitle}>Actions</Text>
            <View style={styles.actionButtons}>
              <View style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Hint</Text>
              </View>
              <View style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Pause</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

/**
 * Tablet-Optimized Settings Modal
 * Enhanced with more detailed controls and better organization
 */
export const TabletSettingsModal: React.FC = () => {
  const { isTablet } = useResponsive();
  
  if (!isTablet) {
    return <MobileSettingsModal />;
  }
  
  return (
    <View style={styles.tabletModal}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Game Settings</Text>
      </View>
      
      <View style={styles.settingsContent}>
        {/* Left column */}
        <View style={styles.settingsColumn}>
          <Text style={styles.settingsGroupTitle}>Audio</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Master Volume</Text>
            <View style={styles.sliderContainer}>
              {/* Slider component would go here */}
              <View style={styles.sliderTrack}>
                <View style={[styles.sliderThumb, { left: '75%' }]} />
              </View>
            </View>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Sound Effects</Text>
            <View style={styles.toggleContainer}>
              <View style={[styles.toggle, styles.toggleActive]} />
            </View>
          </View>
        </View>
        
        {/* Right column */}
        <View style={styles.settingsColumn}>
          <Text style={styles.settingsGroupTitle}>Display</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Brightness</Text>
            <View style={styles.sliderContainer}>
              <View style={styles.sliderTrack}>
                <View style={[styles.sliderThumb, { left: '60%' }]} />
              </View>
            </View>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Animations</Text>
            <View style={styles.toggleContainer}>
              <View style={[styles.toggle, styles.toggleActive]} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

/**
 * Mobile fallback components (simplified versions)
 */
const MobileGameSelection: React.FC<{ games: any[] }> = ({ games }) => (
  <View style={styles.mobileContainer}>
    <Text style={styles.mobileTitle}>Games</Text>
    {/* Simplified mobile layout */}
  </View>
);

const MobileGameBoard: React.FC = () => (
  <View style={styles.mobileGameBoard}>
    <Text>Mobile Game Board</Text>
    {/* Simplified mobile game board */}
  </View>
);

const MobileSettingsModal: React.FC = () => (
  <View style={styles.mobileModal}>
    <Text>Mobile Settings</Text>
    {/* Simplified mobile settings */}
  </View>
);

/**
 * Tablet-optimized styles
 */
const styles = StyleSheet.create({
  // Tablet Container Layouts
  tabletContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
  },
  
  sidebar: {
    backgroundColor: '#fff',
    padding: responsive.spacing(24),
    borderRightWidth: 1,
    borderRightColor: '#e9ecef',
    elevation: responsive.elevation(2),
  },
  
  sidebarTitle: {
    fontSize: responsive.font(20),
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: responsive.spacing(20),
  },
  
  categoryItem: {
    paddingVertical: responsive.spacing(12),
    paddingHorizontal: responsive.spacing(16),
    borderRadius: responsive.borderRadius(8),
    marginBottom: responsive.spacing(8),
    backgroundColor: '#f8f9fa',
  },
  
  categoryText: {
    fontSize: responsive.font(16),
    color: '#495057',
    fontWeight: '500',
  },
  
  mainContent: {
    flex: 1,
    padding: responsive.spacing(24),
  },
  
  mainTitle: {
    fontSize: responsive.font(28),
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: responsive.spacing(24),
  },
  
  // Tablet Game Grid
  tabletGameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  tabletGameCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: responsive.borderRadius(16),
    padding: responsive.spacing(20),
    marginBottom: responsive.spacing(20),
    elevation: responsive.elevation(4),
    flexDirection: 'row',
  },
  
  gameImageContainer: {
    width: responsive.scale(80),
    height: responsive.scale(80),
    backgroundColor: '#e9ecef',
    borderRadius: responsive.borderRadius(12),
    marginRight: responsive.spacing(16),
  },
  
  gameInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  
  gameTitle: {
    fontSize: responsive.font(18),
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: responsive.spacing(8),
  },
  
  gameDescription: {
    fontSize: responsive.font(14),
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: responsive.spacing(12),
  },
  
  gameMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  ratingContainer: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: responsive.spacing(8),
    paddingVertical: responsive.spacing(4),
    borderRadius: responsive.borderRadius(4),
  },
  
  ratingText: {
    fontSize: responsive.font(12),
    color: '#856404',
    fontWeight: '600',
  },
  
  playersContainer: {
    backgroundColor: '#d1ecf1',
    paddingHorizontal: responsive.spacing(8),
    paddingVertical: responsive.spacing(4),
    borderRadius: responsive.borderRadius(4),
  },
  
  playersText: {
    fontSize: responsive.font(12),
    color: '#0c5460',
    fontWeight: '600',
  },
  
  // Tablet Game Board
  tabletGameBoard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
  },
  
  gameArea: {
    backgroundColor: '#fff',
    margin: responsive.spacing(20),
    borderRadius: responsive.borderRadius(16),
    padding: responsive.spacing(24),
    elevation: responsive.elevation(4),
  },
  
  gameBoardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  gameAreaTitle: {
    fontSize: responsive.font(24),
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  
  controlPanel: {
    width: '25%',
    backgroundColor: '#fff',
    padding: responsive.spacing(20),
    borderLeftWidth: 1,
    borderLeftColor: '#e9ecef',
  },
  
  controlPanelTitle: {
    fontSize: responsive.font(18),
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: responsive.spacing(20),
  },
  
  controlSection: {
    marginBottom: responsive.spacing(24),
  },
  
  controlSectionTitle: {
    fontSize: responsive.font(14),
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: responsive.spacing(12),
  },
  
  timerDisplay: {
    backgroundColor: '#e3f2fd',
    padding: responsive.spacing(16),
    borderRadius: responsive.borderRadius(12),
    alignItems: 'center',
  },
  
  timerText: {
    fontSize: responsive.font(24),
    fontWeight: 'bold',
    color: '#1565c0',
  },
  
  scoreDisplay: {
    backgroundColor: '#e8f5e8',
    padding: responsive.spacing(16),
    borderRadius: responsive.borderRadius(12),
    alignItems: 'center',
  },
  
  scoreText: {
    fontSize: responsive.font(20),
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  
  actionButtons: {
    flexDirection: 'column',
  },
  
  actionButton: {
    backgroundColor: '#6c63ff',
    padding: responsive.spacing(12),
    borderRadius: responsive.borderRadius(8),
    alignItems: 'center',
    marginBottom: responsive.spacing(8),
    minHeight: responsive.touchTarget(),
  },
  
  actionButtonText: {
    color: '#fff',
    fontSize: responsive.font(14),
    fontWeight: '600',
  },
  
  // Tablet Settings Modal
  tabletModal: {
    backgroundColor: '#fff',
    borderRadius: responsive.borderRadius(20),
    padding: responsive.spacing(32),
    maxWidth: responsive.scale(600),
    width: '80%',
    maxHeight: '80%',
  },
  
  modalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingBottom: responsive.spacing(20),
    marginBottom: responsive.spacing(24),
  },
  
  modalTitle: {
    fontSize: responsive.font(24),
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  
  settingsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  settingsColumn: {
    flex: 1,
    marginHorizontal: responsive.spacing(12),
  },
  
  settingsGroupTitle: {
    fontSize: responsive.font(18),
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: responsive.spacing(16),
  },
  
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: responsive.spacing(16),
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  
  settingLabel: {
    fontSize: responsive.font(16),
    color: '#495057',
    flex: 1,
  },
  
  sliderContainer: {
    width: responsive.scale(120),
    marginLeft: responsive.spacing(16),
  },
  
  sliderTrack: {
    height: responsive.scale(4),
    backgroundColor: '#e9ecef',
    borderRadius: responsive.borderRadius(2),
    position: 'relative',
  },
  
  sliderThumb: {
    width: responsive.scale(16),
    height: responsive.scale(16),
    backgroundColor: '#6c63ff',
    borderRadius: responsive.borderRadius(8),
    position: 'absolute',
    top: responsive.scale(-6),
  },
  
  toggleContainer: {
    marginLeft: responsive.spacing(16),
  },
  
  toggle: {
    width: responsive.scale(50),
    height: responsive.scale(28),
    backgroundColor: '#ced4da',
    borderRadius: responsive.borderRadius(14),
  },
  
  toggleActive: {
    backgroundColor: '#28a745',
  },
  
  // Mobile Fallbacks
  mobileContainer: {
    flex: 1,
    padding: responsive.spacing(16),
  },
  
  mobileTitle: {
    fontSize: responsive.font(20),
    fontWeight: 'bold',
  },
  
  mobileGameBoard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  mobileModal: {
    backgroundColor: '#fff',
    borderRadius: responsive.borderRadius(12),
    padding: responsive.spacing(20),
    width: '90%',
  },
});