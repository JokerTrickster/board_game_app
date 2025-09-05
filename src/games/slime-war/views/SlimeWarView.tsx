import React from 'react';
import { observer } from 'mobx-react-lite';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SlimeWarViewModel } from '../viewModels/SlimeWarViewModel';
import { GameCard } from '../models/SlimeWarGameModel';

interface SlimeWarViewProps {
  viewModel: SlimeWarViewModel;
  onCardPress?: (card: GameCard) => void;
  onCellPress?: (x: number, y: number) => void;
  onHintPress?: () => void;
}

export const SlimeWarView: React.FC<SlimeWarViewProps> = observer(({
  viewModel,
  onCardPress,
  onCellPress,
  onHintPress,
}) => {
  const { width, height } = Dimensions.get('window');
  const cellSize = Math.min((width - 40) / 10, (height * 0.4) / 10);

  const renderTimer = () => (
    <View style={styles.timerContainer}>
      <Text style={[styles.timerText, { color: viewModel.timerColor }]}>
        {viewModel.timer}
      </Text>
      <Text style={styles.roundText}>Round {viewModel.currentRound}</Text>
    </View>
  );

  const renderGameBoard = () => (
    <View style={styles.boardContainer}>
      {Array.from({ length: 10 }, (_, y) => (
        <View key={y} style={styles.boardRow}>
          {Array.from({ length: 10 }, (_, x) => {
            const cellValue = viewModel.getBoardCell(x, y);
            const isMyCard = cellValue === viewModel.myUserID;
            const isOpponentCard = cellValue === viewModel.opponentID;
            const isEmpty = cellValue === 0;

            return (
              <TouchableOpacity
                key={`${x}-${y}`}
                style={[
                  styles.boardCell,
                  { width: cellSize, height: cellSize },
                  isEmpty && styles.emptyCell,
                  isMyCard && styles.myCard,
                  isOpponentCard && styles.opponentCard,
                ]}
                onPress={() => onCellPress?.(x, y)}
                disabled={viewModel.isLoading}
              >
                {!isEmpty && (
                  <Text style={styles.cellText}>{cellValue}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );

  const renderPlayerStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.playerStat}>
        <Text style={styles.statLabel}>My Heroes</Text>
        <Text style={styles.statValue}>{viewModel.userHeroCount}</Text>
      </View>
      <View style={styles.playerStat}>
        <Text style={styles.statLabel}>Opponent Heroes</Text>
        <Text style={styles.statValue}>{viewModel.opponentHeroCount}</Text>
      </View>
      <View style={styles.playerStat}>
        <Text style={styles.statLabel}>My Score</Text>
        <Text style={styles.statValue}>{viewModel.calculateScore(viewModel.myUserID)}</Text>
      </View>
    </View>
  );

  const renderCards = () => (
    <View style={styles.cardsContainer}>
      <Text style={styles.cardsTitle}>My Cards ({viewModel.cardList.length})</Text>
      <View style={styles.cardsList}>
        {viewModel.cardList.map((card, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.cardItem,
              viewModel.selectedCard?.id === card.id && styles.selectedCard,
            ]}
            onPress={() => onCardPress?.(card)}
            disabled={viewModel.isLoading || !viewModel.isMyTurn}
          >
            <Text style={styles.cardName}>{card.name}</Text>
            <Text style={styles.cardStats}>{card.attack}/{card.health}</Text>
            <Text style={styles.cardCost}>{card.cost}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderControls = () => (
    <View style={styles.controlsContainer}>
      <TouchableOpacity
        style={[styles.button, !viewModel.canUseHint && styles.buttonDisabled]}
        onPress={onHintPress}
        disabled={!viewModel.canUseHint || viewModel.isLoading}
      >
        <Text style={styles.buttonText}>Hint</Text>
      </TouchableOpacity>

      {viewModel.isMyTurn && (
        <View style={styles.turnIndicator}>
          <Text style={styles.turnText}>Your Turn</Text>
        </View>
      )}
    </View>
  );

  const renderGameResult = () => {
    if (!viewModel.isGameOver || !viewModel.gameResult) {return null;}

    return (
      <View style={styles.resultOverlay}>
        <View style={styles.resultContainer}>
          <Text style={[
            styles.resultTitle,
            { color: viewModel.gameResult.isSuccess ? '#4CAF50' : '#F44336' },
          ]}>
            {viewModel.gameResult.isSuccess ? 'Victory!' : 'Defeat'}
          </Text>
          <Text style={styles.resultScore}>
            My Score: {viewModel.gameResult.myScore}
          </Text>
          <Text style={styles.resultScore}>
            Opponent Score: {viewModel.gameResult.opponentScore}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => viewModel.resetGameOver()}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (viewModel.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (viewModel.error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{viewModel.error}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => viewModel.clearError()}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      {renderTimer()}
      {renderGameBoard()}
      {renderPlayerStats()}
      {renderCards()}
      {renderControls()}
      {renderGameResult()}
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  roundText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  boardContainer: {
    alignSelf: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 5,
  },
  boardRow: {
    flexDirection: 'row',
  },
  boardCell: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
  },
  emptyCell: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  myCard: {
    backgroundColor: '#4CAF50',
  },
  opponentCard: {
    backgroundColor: '#F44336',
  },
  cellText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
  },
  playerStat: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardsContainer: {
    marginBottom: 20,
  },
  cardsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cardItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 10,
    margin: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  selectedCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cardName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardStats: {
    color: '#fff',
    fontSize: 10,
  },
  cardCost: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: 'bold',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  turnIndicator: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  turnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    margin: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  resultScore: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
  },
});

export default SlimeWarView;
