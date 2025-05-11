import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Image, ImageBackground } from 'react-native';
import { observer } from 'mobx-react-lite';
import SystemMessage from '../../../components/common/SystemMessage';
import styles from '../styles/SequenceStyles';
import { sequenceViewModel } from '../services/SequenceViewModel';
import { sequenceWebSocketService } from '../services/SequenceWebsocketService';
import SequenceMultiHeader from '../../../components/SequenceMultiHeader';
import sequenceCards from '../../../assets/data/sequnce_cards.json';

const GRID_SIZE = 10; // 10x10 격자
const TURN_TIME = 30; // 턴당 제한 시간(초)

// 카드 이미지 매핑 (예시)
const cardImageMap: { [key: string]: any } = {
  'AH': require('../../../assets/icons/sequence/cards/ace_hearts.png'),
  // ... 다른 카드들도 추가
};

// 카드ID로 카드 정보 조회
const getCardInfoById = (cardID: number) => {
  return sequenceCards.find(card => card.id === cardID);
};

// mapID를 좌표로 변환
const mapIdToCoord = (mapID: number) => ({
  row: Math.floor((mapID - 1) / 10),
  col: (mapID - 1) % 10,
});

// 좌표를 mapID로 변환
const coordToMapId = (row: number, col: number) => row * 10 + col + 1;

const cellWidth = styles.cell.width + 2 * (styles.cell.margin ?? 0);
const cellHeight = styles.cell.height + 2 * (styles.cell.margin ?? 0);

const mapGrid: { mapID: number; row: number; col: number }[][] = Array.from({ length: GRID_SIZE }, (_, row) =>
  Array.from({ length: GRID_SIZE }, (_, col) => ({
    mapID: row * GRID_SIZE + col + 1,
    row,
    col,
  }))
);

const SequenceScreen: React.FC = observer(() => {
  const [systemMessage, setSystemMessage] = useState<string>('');
  const [timer, setTimer] = useState(TURN_TIME);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const [buttonCooldown, setButtonCooldown] = useState(false);

  // 플레이어의 카드 목록
  const playerHand = sequenceViewModel.cardList;
  const opponentHand = sequenceViewModel.opponentCardList;

  // validPositions 대신 validMapIDs로 관리 (mapID 배열)
  const [validMapIDs, setValidMapIDs] = useState<number[]>([]);

  // 타이머 설정
  useEffect(() => {
    // 턴이 바뀔 때마다 타이머 초기화
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimer(TURN_TIME);

    // 내 턴일 때만 타이머 동작 및 TIME_OUT 이벤트 호출
    if (sequenceViewModel.isMyTurn) {
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            // 내 턴일 때만 TIME_OUT 이벤트 호출
            if (sequenceViewModel.isMyTurn) {
              sequenceWebSocketService.sendTimeoutEvent();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [sequenceViewModel.isMyTurn]);

  // 칩 이미지 반환 함수
  const getChipImage = (colorType: number) => {
    switch (colorType) {
      case 1:
        return require('../../../assets/icons/sequence/common/blue_chip.png');
      case 2:
        return require('../../../assets/icons/sequence/common/red_chip.png');
      default:
        return null;
    }
  };

  // 카드 선택 핸들러
  const handleCardSelect = (cardID: number) => {
    if (!sequenceViewModel.isMyTurn) {
      setSystemMessage('지금은 당신의 턴이 아닙니다.');
      return;
    }
    sequenceViewModel.setSelectedCard(cardID);

    const cardInfo = getCardInfoById(cardID);
    if (!cardInfo) {
      setValidMapIDs([]);
      return;
    }
    // 이미 점령된 칸이 아니면 validMapIDs에 추가
    if (
      !sequenceViewModel.ownedMapIDs.includes(cardInfo.mapID) &&
      !sequenceViewModel.opponentOwnedMapIDs.includes(cardInfo.mapID)
    ) {
      setValidMapIDs([cardInfo.mapID]);
    } else {
      setValidMapIDs([]);
    }
  };

  // 셀 클릭 핸들러
  const handleCellPress = (row: number, col: number) => {
    if (!sequenceViewModel.isMyTurn) {
      setSystemMessage('지금은 당신의 턴이 아닙니다.');
      return;
    }
    const selectedCard = sequenceViewModel.selectedCard;
    if (!selectedCard) {
      setSystemMessage('먼저 카드를 선택해주세요.');
      return;
    }
    const mapID = row * GRID_SIZE + col + 1;
    if (!validMapIDs.includes(mapID)) {
      setSystemMessage('이 위치에는 카드를 놓을 수 없습니다.');
      return;
    }
    sequenceWebSocketService.sendUseCardEvent(selectedCard, mapID);
    setValidMapIDs([]);
    sequenceViewModel.setSelectedCard(0);
  };

  // 맵 렌더링
  const renderGrid = () => {
    return mapGrid.map((rowArr, rowIdx) => (
      <View key={`row-${rowIdx}`} style={styles.row}>
        {rowArr.map(({ mapID, row, col }) => {
          // 카드 정보
          const cardInfo = sequenceCards.find(card => card.mapID === mapID);
          // valid 스타일
          const isValid = validMapIDs.includes(mapID);

          return (
            <TouchableOpacity
              key={`cell-${row}-${col}`}
              style={[
                styles.cell,
                isValid && styles.validCell
              ]}
              onPress={() => handleCellPress(row, col)}
              activeOpacity={0.8}
            >
              {cardInfo && (
                <Image
                  source={require('../../../assets/icons/sequence/cards/ace_hearts.png')}
                  style={styles.cardImage}
                  resizeMode="contain"
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    ));
  };

  // 칩(코인)만 상태에 따라 렌더링
  const renderChips = () => {
    let chips = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        let chip = null;
        const mapID = coordToMapId(row, col);

        if (
          sequenceViewModel.userColorType &&
          sequenceViewModel.ownedMapIDs.includes(mapID)
        ) {
          chip = getChipImage(sequenceViewModel.userColorType);
        }
        if (
          sequenceViewModel.opponentColorType &&
          sequenceViewModel.opponentOwnedMapIDs.includes(mapID)
        ) {
          chip = getChipImage(sequenceViewModel.opponentColorType);
        }

        if (chip) {
          chips.push(
            <Image
              key={`chip-${row}-${col}`}
              source={chip}
              style={[
                styles.chipImage,
                {
                  position: 'absolute',
                  left: col * cellWidth,
                  top: row * cellHeight,
                },
              ]}
              resizeMode="contain"
            />
          );
        }
      }
    }
    return chips;
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/sequence/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <SequenceMultiHeader />

        {/* 타이머: 맵 상단에 고정 */}
        <View style={styles.timerWrapper}>
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
        <View style={[styles.boardContainer, { position: 'relative' }]}>
          {renderGrid()}
          {renderChips()}
        </View>

        {/* 플레이어 카드 영역 */}
        <View style={styles.handContainer}>
          <View style={styles.handScrollView}>
            {playerHand.map((cardID: number, index: number) => (
              <TouchableOpacity
                key={`card-${index}`}
                style={[
                  styles.card,
                  sequenceViewModel.selectedCard === cardID && styles.selectedCard
                ]}
                onPress={() => handleCardSelect(cardID)}
              >
                <Image
                  source={require('../../../assets/icons/sequence/cards/ace_hearts.png')}
                  style={styles.cardImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ))}
          </View>
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
