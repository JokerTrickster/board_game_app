import React, { useEffect, useCallback } from 'react';
import { Alert, BackHandler } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useViewModel } from '../../infrastructure/mvvm/ViewModelProvider';
import { SlimeWarViewModel } from './viewModels/SlimeWarViewModel';
import { SlimeWarView } from './views/SlimeWarView';
import { GameCard, GameConfig, GameSession } from './models/SlimeWarGameModel';

type SlimeWarScreenNavigationProp = StackNavigationProp<any, 'SlimeWarScreen'>;
type SlimeWarScreenRouteProp = RouteProp<{
  SlimeWarScreen: {
    sessionId?: string;
    roomID?: number;
    gameType?: 'pvp';
    userID?: number;
    config?: GameConfig;
  };
}, 'SlimeWarScreen'>;

const SlimeWarScreen_MVVM: React.FC = () => {
  const navigation = useNavigation<SlimeWarScreenNavigationProp>();
  const route = useRoute<SlimeWarScreenRouteProp>();

  const {
    sessionId = 'default',
    roomID = 0,
    gameType = 'pvp',
    userID = 1,
    config = {
      turnTimeLimit: 60,
      gridSize: 9,
      maxRounds: 10,
      deckSize: 20,
    },
  } = route.params || {};

  const viewModel = useViewModel(
    `slime-war-${sessionId}`,
    () => new SlimeWarViewModel(),
    [sessionId]
  );

  useEffect(() => {
    if (viewModel && !viewModel.isInitialized) {
      const session: GameSession = {
        sessionId,
        roomID,
        gameType,
        turnTimeLimit: config.turnTimeLimit,
        gridSize: config.gridSize,
        maxRounds: config.maxRounds,
        startTime: new Date(),
      };

      viewModel.initializeGame(config, session, userID);
    }
  }, [viewModel, sessionId, roomID, gameType, userID, config]);

  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        'Exit Game',
        'Are you sure you want to exit the game? Your progress will be lost.',
        [
          {
            text: 'Cancel',
            onPress: () => null,
            style: 'cancel',
          },
          {
            text: 'Exit',
            onPress: () => {
              viewModel?.cleanup();
              navigation.goBack();
            },
          },
        ]
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [navigation, viewModel]);

  useEffect(() => {
    if (!viewModel) {return;}

    const unsubscribeGameOver = viewModel.onGameOver((result) => {
      setTimeout(() => {
        Alert.alert(
          result.isSuccess ? 'Victory!' : 'Game Over',
          `Final Score:\nYou: ${result.myScore}\nOpponent: ${result.opponentScore}`,
          [
            {
              text: 'Play Again',
              onPress: () => {
                viewModel.resetGame();
              },
            },
            {
              text: 'Exit',
              onPress: () => {
                viewModel.cleanup();
                navigation.goBack();
              },
            },
          ]
        );
      }, 1000);
    });

    const unsubscribeError = viewModel.onError((error) => {
      Alert.alert(
        'Game Error',
        error,
        [
          {
            text: 'Retry',
            onPress: () => viewModel.clearError(),
          },
          {
            text: 'Exit',
            onPress: () => {
              viewModel.cleanup();
              navigation.goBack();
            },
          },
        ]
      );
    });

    const unsubscribeConnection = viewModel.onConnectionLost(() => {
      Alert.alert(
        'Connection Lost',
        'Lost connection to the game server. Please check your internet connection.',
        [
          {
            text: 'Retry',
            onPress: () => viewModel.reconnect(),
          },
          {
            text: 'Exit',
            onPress: () => {
              viewModel.cleanup();
              navigation.goBack();
            },
          },
        ]
      );
    });

    return () => {
      unsubscribeGameOver();
      unsubscribeError();
      unsubscribeConnection();
    };
  }, [viewModel, navigation]);

  const handleCardPress = useCallback((card: GameCard) => {
    if (!viewModel) {return;}

    if (viewModel.selectedCard?.id === card.id) {
      viewModel.selectCard(null);
    } else {
      viewModel.selectCard(card);
    }
  }, [viewModel]);

  const handleCellPress = useCallback(async (x: number, y: number) => {
    if (!viewModel) {return;}

    try {
      if (viewModel.selectedCard) {
        const success = await viewModel.placeCard(x, y);
        if (!success) {
          Alert.alert('Invalid Move', 'Cannot place card at this position.');
        }
      } else {
        const success = await viewModel.selectBoardCard(x, y);
        if (!success) {
          Alert.alert('Invalid Selection', 'Cannot select this card.');
        }
      }
    } catch (error) {
      console.error('Error handling cell press:', error);
      Alert.alert('Error', 'An error occurred while processing your move.');
    }
  }, [viewModel]);

  const handleHintPress = useCallback(async () => {
    if (!viewModel) {return;}

    try {
      const success = await viewModel.useHint();
      if (!success) {
        Alert.alert('Hint Unavailable', 'Cannot use hint at this time.');
      }
    } catch (error) {
      console.error('Error using hint:', error);
      Alert.alert('Error', 'An error occurred while using hint.');
    }
  }, [viewModel]);

  if (!viewModel) {
    return null;
  }

  return (
    <SlimeWarView
      viewModel={viewModel}
      onCardPress={handleCardPress}
      onCellPress={handleCellPress}
      onHintPress={handleHintPress}
    />
  );
};

export default SlimeWarScreen_MVVM;
