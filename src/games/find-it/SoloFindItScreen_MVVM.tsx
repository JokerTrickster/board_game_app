import React, { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { observer } from 'mobx-react-lite';
import { useViewModelInstance } from '../../infrastructure/mvvm';
import { FindItViewModel } from './viewModels/FindItViewModel';
import SoloFindItView from './views/SoloFindItView';
import { RootStackParamList } from '../../navigation/navigationTypes';
import { GameConfig } from './models/FindItGameModel';

type SoloFindItScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SoloFindIt'>;
type SoloFindItScreenRouteProp = {
  key: string;
  name: 'SoloFindIt';
  params?: {
    difficulty?: 'easy' | 'medium' | 'hard';
    timeLimit?: number;
  };
};

/**
 * Screen component that orchestrates the MVVM pattern for Solo Find-It game
 * Handles navigation, lifecycle, and connects ViewModel to View
 */
const SoloFindItScreen: React.FC = observer(() => {
  const navigation = useNavigation<SoloFindItScreenNavigationProp>();
  const route = useRoute<SoloFindItScreenRouteProp>();

  // Create ViewModel instance with automatic cleanup
  const viewModel = useViewModelInstance(() => new FindItViewModel(), []);

  // Initialize game when component mounts
  useEffect(() => {
    const initializeGame = async () => {
      const config: GameConfig = {
        gameType: 'solo',
        difficulty: route.params?.difficulty || 'medium',
        timeLimit: route.params?.timeLimit || 60,
        maxLives: 5,
        maxHints: 3,
        maxTimerStops: 2,
      };

      await viewModel.initializeGame(config);
      viewModel.startTimer();
    };

    initializeGame();
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

  const handleBack = (): boolean => {
    if (viewModel.isLoading) {return true;} // Prevent back during loading

    // Pause game and show confirmation
    viewModel.stopTimer();

    // Navigate back to menu
    navigation.goBack();
    return true;
  };

  const handlePause = () => {
    viewModel.stopTimer();
    // Show pause modal or navigate to pause screen
    // This would be implemented based on UX requirements
  };

  const handleGameOver = () => {
    // Navigate to results screen or show game over modal
    // Pass game results to next screen
    const finalScore = viewModel.gameModel?.calculateScore() || 0;

    // Example navigation to results screen
    // navigation.navigate('GameResults', {
    //   score: finalScore,
    //   round: viewModel.currentRound,
    //   gameType: 'solo'
    // });

    console.log('Game Over - Score:', finalScore, 'Round:', viewModel.currentRound);
  };

  return (
    <SoloFindItView
      viewModel={viewModel}
      onBack={handleBack}
      onPause={handlePause}
    />
  );
});

export default SoloFindItScreen;
