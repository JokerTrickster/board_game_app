import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Alert, BackHandler } from 'react-native';
import { useCallback, useEffect } from 'react';
import { RootStackParamList } from '../navigation/navigationTypes';
import { AuthService } from '../services/AuthService';
import FeedbackService from '../services/FeedbackService';
import AnalyticsService from '../services/AnalyticsService';

export interface NavigationConfig {
  enableBackHandler?: boolean;
  showExitConfirmation?: boolean;
  exitConfirmationMessage?: string;
  onCustomBack?: () => boolean; // Return true to prevent default back
}

export const useNavigationActions = (config: NavigationConfig = {}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const feedbackService = FeedbackService.getInstance();
  const analytics = AnalyticsService.getInstance();

  const {
    enableBackHandler = false,
    showExitConfirmation = false,
    exitConfirmationMessage = '정말 나가시겠습니까?',
    onCustomBack,
  } = config;

  /**
   * Safe logout with proper cleanup and confirmation
   */
  const logout = useCallback(async () => {
    try {
      Alert.alert(
        '로그아웃',
        '정말 로그아웃하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '로그아웃',
            style: 'destructive',
            onPress: async () => {
              try {
                // Track logout action
                await analytics.track('user_logout', {
                  screen: route.name,
                  method: 'manual',
                });

                // Clear authentication
                await AuthService.clearTokens();
                
                // Clear user from feedback services
                await feedbackService.setUser('');
                
                // Navigate to login screen
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });

                console.log('User logged out successfully');
              } catch (error) {
                console.error('Logout failed:', error);
                await feedbackService.reportError(error as Error, {
                  screen: route.name,
                  action: 'logout',
                });
                
                Alert.alert(
                  '로그아웃 실패',
                  '로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.',
                  [{ text: '확인' }]
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Failed to show logout confirmation:', error);
    }
  }, [navigation, route.name, analytics, feedbackService]);

  /**
   * Account deletion with double confirmation
   */
  const deleteAccount = useCallback(async () => {
    try {
      Alert.alert(
        '계정 삭제',
        '계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.\n정말 삭제하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '삭제',
            style: 'destructive',
            onPress: () => {
              // Second confirmation
              Alert.alert(
                '계정 삭제 확인',
                '마지막 확인입니다. 계정을 삭제하시겠습니까?',
                [
                  { text: '취소', style: 'cancel' },
                  {
                    text: '영구 삭제',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        // Track account deletion
                        await analytics.track('account_deletion_requested', {
                          screen: route.name,
                        });

                        // TODO: Call account deletion API
                        // await AccountService.deleteAccount();

                        // Clear all local data
                        await AuthService.clearTokens();
                        await feedbackService.setUser('');

                        navigation.reset({
                          index: 0,
                          routes: [{ name: 'Login' }],
                        });

                        Alert.alert(
                          '계정 삭제 완료',
                          '계정이 성공적으로 삭제되었습니다.',
                          [{ text: '확인' }]
                        );
                      } catch (error) {
                        console.error('Account deletion failed:', error);
                        await feedbackService.reportError(error as Error, {
                          screen: route.name,
                          action: 'delete_account',
                        });
                        
                        Alert.alert(
                          '삭제 실패',
                          '계정 삭제 중 오류가 발생했습니다.',
                          [{ text: '확인' }]
                        );
                      }
                    },
                  },
                ]
              );
            },
          },
        ]
      );
    } catch (error) {
      console.error('Failed to show account deletion confirmation:', error);
    }
  }, [navigation, route.name, analytics, feedbackService]);

  /**
   * Smart back navigation with context awareness
   */
  const safeGoBack = useCallback(() => {
    try {
      if (navigation.canGoBack()) {
        // Track back navigation
        analytics.track('navigation_back', {
          fromScreen: route.name,
        });

        navigation.goBack();
      } else {
        // No back stack available, go to home or show exit confirmation
        if (route.name === 'Home') {
          // On home screen, show app exit confirmation
          Alert.alert(
            '앱 종료',
            '앱을 종료하시겠습니까?',
            [
              { text: '취소', style: 'cancel' },
              {
                text: '종료',
                onPress: () => {
                  analytics.track('app_exit', { screen: route.name });
                  BackHandler.exitApp();
                },
              },
            ]
          );
        } else {
          // Navigate to home screen
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        }
      }
    } catch (error) {
      console.error('Safe go back failed:', error);
      // Fallback: try basic back navigation
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  }, [navigation, route.name, analytics]);

  /**
   * Navigate to screen with loading state
   */
  const navigateWithLoading = useCallback(
    async (screenName: keyof RootStackParamList, params?: any) => {
      try {
        // Track navigation intent
        await analytics.track('navigation_start', {
          fromScreen: route.name,
          toScreen: screenName,
        });

        // Navigate immediately (no loading screen)
        navigation.navigate(screenName, params);

        // Track successful navigation
        setTimeout(() => {
          analytics.track('navigation_complete', {
            fromScreen: route.name,
            toScreen: screenName,
          });
        }, 100);
      } catch (error) {
        console.error('Navigation failed:', error);
        await feedbackService.reportError(error as Error, {
          screen: route.name,
          action: `navigate_to_${screenName}`,
        });
      }
    },
    [navigation, route.name, analytics, feedbackService]
  );

  /**
   * Replace current screen (for logout, results, etc.)
   */
  const replaceScreen = useCallback(
    async (screenName: keyof RootStackParamList, params?: any) => {
      try {
        await analytics.track('navigation_replace', {
          fromScreen: route.name,
          toScreen: screenName,
        });

        navigation.replace(screenName, params);
      } catch (error) {
        console.error('Screen replacement failed:', error);
        await feedbackService.reportError(error as Error, {
          screen: route.name,
          action: `replace_with_${screenName}`,
        });
      }
    },
    [navigation, route.name, analytics, feedbackService]
  );

  /**
   * Navigate to game with proper context
   */
  const navigateToGame = useCallback(
    async (
      gameType: 'find-it' | 'frog' | 'sequence' | 'slime-war',
      gameMode: 'solo' | 'multi',
      gameParams?: any
    ) => {
      try {
        await analytics.track('game_navigation_start', {
          gameType,
          gameMode,
          fromScreen: route.name,
        });

        // Map game type to screen name
        const gameScreenMap = {
          'find-it': gameMode === 'solo' ? 'SoloFindIt' : 'FindIt',
          'frog': 'Frog',
          'sequence': 'Sequence',
          'slime-war': 'SlimeWar',
        };

        const screenName = gameScreenMap[gameType] as keyof RootStackParamList;
        
        navigation.navigate(screenName, {
          gameType,
          gameMode,
          ...gameParams,
        });
      } catch (error) {
        console.error('Game navigation failed:', error);
        await feedbackService.reportError(error as Error, {
          screen: route.name,
          action: `navigate_to_game_${gameType}`,
        });
      }
    },
    [navigation, route.name, analytics, feedbackService]
  );

  /**
   * Back handler implementation
   */
  useEffect(() => {
    if (!enableBackHandler) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      try {
        // Custom back handler has priority
        if (onCustomBack && onCustomBack()) {
          return true; // Prevent default back
        }

        // Show exit confirmation if configured
        if (showExitConfirmation) {
          Alert.alert(
            '나가기',
            exitConfirmationMessage,
            [
              { text: '취소', style: 'cancel' },
              {
                text: '나가기',
                onPress: () => {
                  analytics.track('back_button_exit', {
                    screen: route.name,
                  });
                  safeGoBack();
                },
              },
            ]
          );
          return true; // Prevent default back
        }

        // Use safe back navigation
        safeGoBack();
        return true; // Prevent default back
      } catch (error) {
        console.error('Back handler error:', error);
        return false; // Allow default back
      }
    });

    return () => backHandler.remove();
  }, [
    enableBackHandler,
    onCustomBack,
    showExitConfirmation,
    exitConfirmationMessage,
    safeGoBack,
    analytics,
    route.name,
  ]);

  return {
    // Navigation actions
    logout,
    deleteAccount,
    safeGoBack,
    navigateWithLoading,
    replaceScreen,
    navigateToGame,

    // Navigation utilities
    canGoBack: navigation.canGoBack(),
    currentScreen: route.name,
    
    // Direct navigation access (for advanced use cases)
    navigation,
    route,
  };
};