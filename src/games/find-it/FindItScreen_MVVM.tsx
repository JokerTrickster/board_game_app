import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { observer } from 'mobx-react-lite';
import { useViewModelInstance } from '../../infrastructure/mvvm';
import { MultiplayerFindItViewModel } from './viewModels/MultiplayerFindItViewModel';
import MultiplayerFindItView from './views/MultiplayerFindItView';
import { RootStackParamList } from '../../navigation/navigationTypes';
import { GameConfig } from './models/FindItGameModel';

type FindItScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FindIt'>;
type FindItScreenRouteProp = {
  key: string;
  name: 'FindIt';
  params?: {
    roomID?: number;
    userID?: number;
    userName?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    timeLimit?: number;
  };
};

/**
 * Screen component for multiplayer Find-It game using MVVM pattern
 * Handles navigation, lifecycle, and connects ViewModel to View
 */
const FindItScreen: React.FC = observer(() => {
  const navigation = useNavigation<FindItScreenNavigationProp>();
  const route = useRoute<FindItScreenRouteProp>();

  // Create ViewModel instance with automatic cleanup
  const viewModel = useViewModelInstance(() => new MultiplayerFindItViewModel(), []);

  // Join room and initialize game when component mounts
  useEffect(() => {
    const initializeMultiplayerGame = async () => {
      const {
        roomID = 1,
        userID = 1,
        userName = 'Player',
        difficulty = 'medium',
        timeLimit = 60,
      } = route.params || {};

      try {
        // Join multiplayer room
        await viewModel.joinRoom(roomID, userID, userName);

        // Initialize game configuration
        const config: GameConfig = {
          gameType: 'multiplayer',
          difficulty,
          timeLimit,
          maxLives: 5,
          maxHints: 3,
          maxTimerStops: 2,
        };

        await viewModel.initializeGame(config);
      } catch (error) {
        console.error('Failed to initialize multiplayer game:', error);
        // Handle initialization error - maybe show error screen or go back
        navigation.goBack();
      }
    };

    initializeMultiplayerGame();
  }, []);

  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => backHandler.remove();
  }, []);

  // Handle game over state
  useEffect(() => {
    if (viewModel.isGameOver) {
      handleGameOver();
    }
  }, [viewModel.isGameOver]);

  // Auto-start game when ready
  useEffect(() => {
    if (viewModel.gameCanStart) {
      // Auto-start after short delay to let UI update
      const timer = setTimeout(() => {
        viewModel.startMultiplayerGame();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [viewModel.gameCanStart]);

  const handleBack = (): boolean => {
    if (viewModel.isLoading) return true; // Prevent back during loading
    
    // Show confirmation dialog for leaving multiplayer game
    // This would typically show a confirmation modal
    handleLeaveGame();
    return true;
  };

  const handlePause = () => {
    // In multiplayer, we can't really pause the game for everyone
    // But we can show a pause overlay or options menu
    console.log('Pause requested in multiplayer game');
  };

  const handleLeaveGame = async () => {
    try {
      // Leave the multiplayer room
      await viewModel.leaveRoom();
      
      // Navigate back to lobby or main menu
      navigation.goBack();
    } catch (error) {
      console.error('Error leaving game:', error);
      // Force navigation back even if leaving failed
      navigation.goBack();
    }
  };

  const handleGameOver = () => {
    // In multiplayer, game over means all rounds completed or all players eliminated
    // Show final scores and results
    
    const finalResults = {
      players: viewModel.players.map(p => ({
        name: p.name,
        score: p.score,
        isWinner: p.score === Math.max(...viewModel.players.map(player => player.score)),
      })),
      totalRounds: viewModel.currentRound,
      gameType: 'multiplayer',
    };

    // Navigate to results screen
    // navigation.navigate('MultiplayerGameResults', finalResults);
    
    console.log('Multiplayer Game Over:', finalResults);
  };

  return (
    <MultiplayerFindItView
      viewModel={viewModel}
      onBack={handleBack}
      onPause={handlePause}
    />
  );
});

export default FindItScreen;