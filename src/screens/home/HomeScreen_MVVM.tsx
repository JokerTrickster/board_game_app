import React, { useEffect, useCallback, useRef } from 'react';
import { Alert, AppState as RNAppState, NetInfo } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useViewModel } from '../../infrastructure/mvvm/ViewModelProvider';
import { HomeViewModel } from './viewModels/HomeViewModel';
import { HomeView } from './views/HomeView';
import { RootStackParamList } from '../../navigation/navigationTypes';
import { CommonAudioManager } from '../../services/CommonAudioManager';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen_MVVM: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const appState = useRef(RNAppState.currentState);
  
  const viewModel = useViewModel(
    'home',
    () => new HomeViewModel(),
    []
  );

  // Initialize home screen when component mounts
  useEffect(() => {
    if (viewModel && !viewModel.isInitialized) {
      viewModel.initialize();
    }
  }, [viewModel]);

  // Handle app state changes
  useEffect(() => {
    if (!viewModel) return;

    const handleAppStateChange = (nextAppState: any) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to foreground
        viewModel.handleAppForeground();
      } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        // App has gone to background
        viewModel.handleAppBackground();
      }
      
      appState.current = nextAppState;
    };

    const subscription = RNAppState.addEventListener('change', handleAppStateChange);
    
    return () => subscription?.remove();
  }, [viewModel]);

  // Handle network connectivity changes
  useEffect(() => {
    if (!viewModel) return;

    const unsubscribe = NetInfo.addEventListener(state => {
      viewModel.setOnlineStatus(state.isConnected || false);
      
      if (!state.isConnected) {
        Alert.alert(
          '네트워크 연결 없음',
          '인터넷 연결을 확인해주세요. 일부 기능이 제한될 수 있습니다.',
          [{ text: '확인' }]
        );
      }
    });

    return unsubscribe;
  }, [viewModel]);

  // Refresh data when screen gains focus
  useFocusEffect(
    useCallback(() => {
      if (viewModel && viewModel.canRefresh) {
        viewModel.softRefresh();
      }
    }, [viewModel])
  );

  // Handle game selection
  const handleGamePress = useCallback(async (gameId: number) => {
    if (!viewModel) return;

    try {
      const result = await viewModel.playGame(gameId);
      
      if (result.canPlay) {
        viewModel.trackGameSelection(gameId, 'game_list');
        
        // Navigate to game screen
        if (result.route && result.route !== 'GameDetail') {
          navigation.navigate(result.route as keyof RootStackParamList, result.params);
        } else {
          // Handle game detail or unknown games
          Alert.alert(
            '게임 정보',
            '이 게임은 곧 업데이트될 예정입니다.',
            [{ text: '확인' }]
          );
        }
      }
    } catch (error) {
      console.error('Game press error:', error);
      Alert.alert('오류', '게임을 시작할 수 없습니다.');
    }
  }, [viewModel, navigation]);

  // Handle quick action selection
  const handleQuickActionPress = useCallback(async (actionId: string) => {
    if (!viewModel) return;

    try {
      const result = await viewModel.executeQuickAction(actionId);
      
      if (result) {
        // Navigate to quick action screen
        navigation.navigate(result.route as keyof RootStackParamList, result.params);
      }
    } catch (error) {
      console.error('Quick action error:', error);
      Alert.alert('오류', '기능을 실행할 수 없습니다.');
    }
  }, [viewModel, navigation]);

  // Handle notification press
  const handleNotificationPress = useCallback((notificationId: string) => {
    if (!viewModel) return;

    viewModel.markNotificationAsRead(notificationId);
    
    // Handle notification action if needed
    const notification = viewModel.notifications.find(n => n.id === notificationId);
    if (notification?.actionUrl) {
      // Handle deep link or navigation
      console.log('Handle notification action:', notification.actionUrl);
    }
  }, [viewModel]);

  // Handle category selection
  const handleCategoryPress = useCallback((category: string) => {
    if (!viewModel) return;

    viewModel.setGameCategory(category);
    viewModel.trackCategoryChange(category);
  }, [viewModel]);

  // Handle search input
  const handleSearchChange = useCallback((query: string) => {
    if (!viewModel) return;

    viewModel.setSearchQuery(query);
  }, [viewModel]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (!viewModel) return;

    try {
      const success = await viewModel.refreshHomeData();
      
      if (!success && viewModel.error) {
        Alert.alert('새로고침 실패', viewModel.error, [
          { text: '확인', onPress: () => viewModel.clearError() }
        ]);
      }
    } catch (error) {
      console.error('Refresh error:', error);
      Alert.alert('오류', '데이터를 새로고침할 수 없습니다.');
    }
  }, [viewModel]);

  // Handle user profile press
  const handleUserProfilePress = useCallback(() => {
    if (!viewModel) return;

    if (!viewModel.userProfile) {
      Alert.alert(
        '프로필 없음',
        '사용자 프로필을 불러올 수 없습니다. 다시 로그인해주세요.',
        [
          { 
            text: '로그인', 
            onPress: () => navigation.navigate('Login')
          },
          { text: '취소', style: 'cancel' }
        ]
      );
      return;
    }

    // Show user profile options
    Alert.alert(
      '프로필 메뉴',
      `레벨 ${viewModel.userLevel} | EXP ${viewModel.userExperience}`,
      [
        {
          text: '알림 모두 읽음',
          onPress: () => viewModel.markAllNotificationsAsRead()
        },
        {
          text: '사용자 통계',
          onPress: () => {
            const metrics = viewModel.getUserEngagementMetrics();
            Alert.alert(
              '사용자 통계',
              `총 게임 플레이: ${metrics.totalGamesPlayed}회\n` +
              `즐겨찾기: ${metrics.favoriteGamesCount}개\n` +
              `현재 레벨: ${metrics.currentLevel}`,
              [{ text: '확인' }]
            );
          }
        },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              '로그아웃',
              '정말 로그아웃하시겠습니까?',
              [
                { text: '취소', style: 'cancel' },
                {
                  text: '로그아웃',
                  style: 'destructive',
                  onPress: () => {
                    // This would typically be handled by AuthViewModel
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Login' }]
                    });
                  }
                }
              ]
            );
          }
        },
        { text: '취소', style: 'cancel' }
      ]
    );
  }, [viewModel, navigation]);

  if (!viewModel) {
    return null; // or loading component
  }

  return (
    <HomeView
      viewModel={viewModel}
      onGamePress={handleGamePress}
      onQuickActionPress={handleQuickActionPress}
      onNotificationPress={handleNotificationPress}
      onCategoryPress={handleCategoryPress}
      onSearchChange={handleSearchChange}
      onRefresh={handleRefresh}
      onUserProfilePress={handleUserProfilePress}
    />
  );
};

export default HomeScreen_MVVM;