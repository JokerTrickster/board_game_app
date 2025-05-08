import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Image, ImageBackground } from 'react-native';
import { observer } from 'mobx-react-lite';
import SystemMessage from '../../../components/common/SystemMessage';
import styles from '../styles/SequenceStyles';
import { sequenceViewModel } from '../services/SequenceViewModel';
import { sequenceWebSocketService } from '../services/SequenceWebsocketService';

const GRID_SIZE = 10; // 10x10 격자
const TURN_TIME = 30; // 턴당 제한 시간(초)

// 카드 이미지 매핑 (예시)
const cardImageMap: { [key: string]: any } = {
  'AS': require('../../../assets/icons/sequence/cards/ace_spades.png'),
  'AH': require('../../../assets/icons/sequence/cards/ace_hearts.png'),
  // ... 다른 카드들도 추가
};

const SequenceScreen: React.FC = observer(() => {
  const [systemMessage, setSystemMessage] = useState<string>('');
  const [timer, setTimer] = useState(TURN_TIME);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const [buttonCooldown, setButtonCooldown] = useState(false);

  // 플레이어의 카드 목록
  const playerHand = sequenceViewModel.cardList;
  const opponentHand = sequenceViewModel.opponentCardList;

  // 타이머 설정
  useEffect(() => {
    if (!sequenceViewModel.isMyTurn) {
      setTimer(TURN_TIME);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    setTimer(TURN_TIME);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          sequenceWebSocketService.sendTimeoutEvent();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [sequenceViewModel.isMyTurn]);

  // 10x10 격자를 생성하는 함수
  const renderGrid = () => {
    let rows = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      let cells = [];
      for (let col = 0; col < GRID_SIZE; col++) {
        const cellValue = sequenceViewModel.gameBoard[row][col];
        cells.push(
          <TouchableOpacity
            key={`cell-${col}-${row}`}
            style={styles.cell}
            onPress={() => handleCellPress(row, col)}
          >
            {cellValue && (
              <Image
                source={getChipImage(cellValue)}
                style={styles.chipImage}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        );
      }
      rows.push(
        <View key={`row-${row}`} style={styles.row}>
          {cells}
        </View>
      );
    }
    return rows;
  };

  // 칩 이미지 반환 함수
  const getChipImage = (playerId: number) => {
    switch (playerId) {
      case 1:
        return require('../../../assets/icons/sequence/chips/blue_chip.png');
      case 2:
        return require('../../../assets/icons/sequence/chips/red_chip.png');
      default:
        return null;
    }
  };

  // 셀 클릭 핸들러
  const handleCellPress = (row: number, col: number) => {
    if (!sequenceViewModel.isMyTurn) {
      setSystemMessage('지금은 당신의 턴이 아닙니다.');
      return;
    }

    // 선택한 카드가 있는지 확인
    const selectedCard = sequenceViewModel.selectedCard;
    if (!selectedCard) {
      setSystemMessage('먼저 카드를 선택해주세요.');
      return;
    }

    // 웹소켓을 통해 이동 이벤트 전송
    sequenceWebSocketService.sendMoveEvent(selectedCard, row, col);
  };

  // 카드 선택 핸들러
  const handleCardSelect = (card: string) => {
    if (!sequenceViewModel.isMyTurn) {
      setSystemMessage('지금은 당신의 턴이 아닙니다.');
      return;
    }
    sequenceViewModel.setSelectedCard(card);
  };

  return (
    <ImageBackground
      source={require('../../../assets/icons/sequence/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Sequence Game</Text>
        </View>

        {/* 타이머 */}
        <View style={styles.timerContainer}>
          <View style={styles.timerBar}>
            <View 
              style={[
                styles.timerProgress,
                { width: `${(timer / TURN_TIME) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.timerText}>{timer}s</Text>
        </View>

        {/* 게임 보드 */}
        <View style={styles.boardContainer}>
          {renderGrid()}
        </View>

        {/* 플레이어 카드 영역 */}
        <View style={styles.handContainer}>
          <ScrollView
            horizontal
            contentContainerStyle={styles.handScrollView}
            showsHorizontalScrollIndicator={false}
          >
            {playerHand.map((card: string, index: number) => (
              <TouchableOpacity
                key={`card-${index}`}
                style={[
                  styles.card,
                  sequenceViewModel.selectedCard === card && styles.selectedCard
                ]}
                onPress={() => handleCardSelect(card)}
              >
                <Image
                  source={cardImageMap[card]}
                  style={styles.cardImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 시스템 메시지 */}
        {systemMessage ? (
          <SystemMessage 
            message={systemMessage} 
            onHide={() => setSystemMessage('')} 
          />
        ) : null}

        {/* 턴 상태 표시 */}
        <View style={styles.turnIndicator}>
          <Text style={styles.turnText}>
            {sequenceViewModel.isMyTurn ? '내 턴입니다' : '상대방 턴입니다'}
          </Text>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
});

export default SequenceScreen;
