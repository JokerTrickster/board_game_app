import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Image, ImageBackground, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import SystemMessage from '../../../components/common/SystemMessage';
import styles from '../styles/SequenceStyles';
import { sequenceViewModel } from '../services/SequenceViewModel';
import { sequenceWebSocketService } from '../services/SequenceWebsocketService';
import SequenceMultiHeader from '../../../components/SequenceMultiHeader';
import sequenceCards from '../../../assets/data/sequnce_cards.json';

const GRID_SIZE = 10; // 10x10 격자
const TURN_TIME = 30; // 턴당 제한 시간(초)

const SPECIAL_MAP_IDS = [1, 10, 91, 100];

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

// 이미지 매핑 객체 추가
const cardImageMap: { [key: string]: any } = {
  'all.png': require('../../../assets/icons/sequence/cards/all.png'),
  'clovaa.png': require('../../../assets/icons/sequence/cards/clovaa.png'),
  'clova2.png': require('../../../assets/icons/sequence/cards/clova2.png'),
  'clova3.png': require('../../../assets/icons/sequence/cards/clova3.png'),
  'clova4.png': require('../../../assets/icons/sequence/cards/clova4.png'),
  'clova5.png': require('../../../assets/icons/sequence/cards/clova5.png'),
  'clova6.png': require('../../../assets/icons/sequence/cards/clova6.png'),
  'clova7.png': require('../../../assets/icons/sequence/cards/clova7.png'),
  'clova8.png': require('../../../assets/icons/sequence/cards/clova8.png'),
  'clova9.png': require('../../../assets/icons/sequence/cards/clova9.png'),
  'clova10.png': require('../../../assets/icons/sequence/cards/clova10.png'),
  'clovak.png': require('../../../assets/icons/sequence/cards/clovak.png'),
  'clovaq.png': require('../../../assets/icons/sequence/cards/clovaq.png'),
  'diamonda.png': require('../../../assets/icons/sequence/cards/diamonda.png'),
  'diamond2.png': require('../../../assets/icons/sequence/cards/diamond2.png'),
  'diamond3.png': require('../../../assets/icons/sequence/cards/diamond3.png'),
  'diamond4.png': require('../../../assets/icons/sequence/cards/diamond4.png'),
  'diamond5.png': require('../../../assets/icons/sequence/cards/diamond5.png'),
  'diamond6.png': require('../../../assets/icons/sequence/cards/diamond6.png'),
  'diamond7.png': require('../../../assets/icons/sequence/cards/diamond7.png'),
  'diamond8.png': require('../../../assets/icons/sequence/cards/diamond8.png'),
  'diamond9.png': require('../../../assets/icons/sequence/cards/diamond9.png'),
  'diamond10.png': require('../../../assets/icons/sequence/cards/diamond10.png'),
  'diamondk.png': require('../../../assets/icons/sequence/cards/diamondk.png'),
  'diamondq.png': require('../../../assets/icons/sequence/cards/diamondq.png'),
  'hearta.png': require('../../../assets/icons/sequence/cards/hearta.png'),
  'heart2.png': require('../../../assets/icons/sequence/cards/heart2.png'),
  'heart3.png': require('../../../assets/icons/sequence/cards/heart3.png'),
  'heart4.png': require('../../../assets/icons/sequence/cards/heart4.png'),
  'heart5.png': require('../../../assets/icons/sequence/cards/heart5.png'),
  'heart6.png': require('../../../assets/icons/sequence/cards/heart6.png'),
  'heart7.png': require('../../../assets/icons/sequence/cards/heart7.png'),
  'heart8.png': require('../../../assets/icons/sequence/cards/heart8.png'),
  'heart9.png': require('../../../assets/icons/sequence/cards/heart9.png'),
  'heart10.png': require('../../../assets/icons/sequence/cards/heart10.png'),
  'heartk.png': require('../../../assets/icons/sequence/cards/heartk.png'),
  'heartq.png': require('../../../assets/icons/sequence/cards/heartq.png'),
  'spacea.png': require('../../../assets/icons/sequence/cards/spacea.png'),
  'space2.png': require('../../../assets/icons/sequence/cards/space2.png'),
  'space3.png': require('../../../assets/icons/sequence/cards/space3.png'),
  'space4.png': require('../../../assets/icons/sequence/cards/space4.png'),
  'space5.png': require('../../../assets/icons/sequence/cards/space5.png'),
  'space6.png': require('../../../assets/icons/sequence/cards/space6.png'),
  'space7.png': require('../../../assets/icons/sequence/cards/space7.png'),
  'space8.png': require('../../../assets/icons/sequence/cards/space8.png'),
  'space9.png': require('../../../assets/icons/sequence/cards/space9.png'),
  'space10.png': require('../../../assets/icons/sequence/cards/space10.png'),
  'spacek.png': require('../../../assets/icons/sequence/cards/spacek.png'),
  'spaceq.png': require('../../../assets/icons/sequence/cards/spaceq.png'),
};

// 연속된 칩 체크를 위한 방향 배열 (상하좌우, 대각선)
const DIRECTIONS = [
  { row: -1, col: 0 },  // 상
  { row: 1, col: 0 },   // 하
  { row: 0, col: -1 },  // 좌
  { row: 0, col: 1 },   // 우
  { row: -1, col: -1 }, // 좌상
  { row: -1, col: 1 },  // 우상
  { row: 1, col: -1 },  // 좌하
  { row: 1, col: 1 },   // 우하
];

// 특정 방향으로 연속된 칩 개수 체크 (특수칩 포함)
const checkConsecutiveChipsWithSpecial = (
  startRow: number,
  startCol: number,
  direction: { row: number; col: number },
  ownedMapIDs: number[]
): { count: number, sequence: number[], specialIncluded: boolean } => {
  let count = 1;
  let sequence = [coordToMapId(startRow, startCol)];
  let specialIncluded = SPECIAL_MAP_IDS.includes(sequence[0]);
  let currentRow = startRow + direction.row;
  let currentCol = startCol + direction.col;

  while (
    currentRow >= 0 && currentRow < GRID_SIZE &&
    currentCol >= 0 && currentCol < GRID_SIZE
  ) {
    const mapID = coordToMapId(currentRow, currentCol);
    if (ownedMapIDs.includes(mapID) || SPECIAL_MAP_IDS.includes(mapID)) {
      sequence.push(mapID);
      if (SPECIAL_MAP_IDS.includes(mapID)) specialIncluded = true;
      count++;
      currentRow += direction.row;
      currentCol += direction.col;
    } else {
      break;
    }
  }

  return { count, sequence, specialIncluded };
};

// 내 칩만으로 시퀀스 찾기
const findConsecutiveSequences = (ownedMapIDs: number[]): number[][] => {
  const sequences: number[][] = [];
  const checked = new Set<string>();

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const mapID = coordToMapId(row, col);
      if (!ownedMapIDs.includes(mapID) && !SPECIAL_MAP_IDS.includes(mapID)) continue;

      const key = `${row}-${col}`;
      if (checked.has(key)) continue;

      for (const direction of DIRECTIONS) {
        const { count, sequence, specialIncluded } = checkConsecutiveChipsWithSpecial(
          row, col, direction, ownedMapIDs
        );

        // 특수칩 포함: 4+1(특수) = 5개, 특수칩 미포함: 5개 이상
        if (
          (specialIncluded && count >= 5) ||
          (!specialIncluded && count >= 5)
        ) {
          // 표시할 때는 특수칩(mapID) 제외
          const displaySequence = sequence.filter(id => !SPECIAL_MAP_IDS.includes(id));
          // 특수칩 포함이면 4개 이상, 아니면 5개 이상
          if (
            (specialIncluded && displaySequence.length >= 4) ||
            (!specialIncluded && displaySequence.length >= 5)
          ) {
            displaySequence.forEach(id => checked.add(`${mapIdToCoord(id).row}-${mapIdToCoord(id).col}`));
            sequences.push(displaySequence);
          }
        }
      }
    }
  }

  return sequences;
};

const SequenceScreen: React.FC = observer(() => {
  const [systemMessage, setSystemMessage] = useState<string>('');
  const [timer, setTimer] = useState(TURN_TIME);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const [buttonCooldown, setButtonCooldown] = useState(false);
  const [mySequences, setMySequences] = useState<number[][]>([]);

  // 플레이어의 카드 목록
  const playerHand = sequenceViewModel.cardList;
  const opponentHand = sequenceViewModel.opponentCardList;

  // validPositions 대신 validMapIDs로 관리 (mapID 배열)
  const [validMapIDs, setValidMapIDs] = useState<number[]>([]);

  // 마지막에 놓은 카드 정보
  const myLastCardInfo = sequenceViewModel.getLastPlacedCardInfo(
    sequenceViewModel.ownedMapIDs,
    sequenceCards
  );
  const opponentLastCardInfo = sequenceViewModel.getLastPlacedCardInfo(
    sequenceViewModel.opponentOwnedMapIDs,
    sequenceCards
  );

  // 타이머 설정
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimer(TURN_TIME);

    if (sequenceViewModel.isMyTurn) {
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            timerRef.current = null;
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

  // 내 턴이 끝나면 validMapIDs 초기화
  useEffect(() => {
    if (!sequenceViewModel.isMyTurn) {
      setValidMapIDs([]);
      sequenceViewModel.setSelectedCard(0);
    }
  }, [sequenceViewModel.isMyTurn]);

  // 내 칩만으로 시퀀스 체크 및 게임 종료 조건 확인
  useEffect(() => {
    const mySeqs = findConsecutiveSequences(sequenceViewModel.ownedMapIDs);
    setMySequences(mySeqs);

    // 내가 만든 시퀀스가 2개 이상일 때만 게임 종료
    if (mySeqs.length >= 2) {
      sequenceWebSocketService.sendGameOverEvent();
    }
  }, [sequenceViewModel.ownedMapIDs]);

  // 칩 이미지 반환 함수
  const getChipImage = (colorType: number) => {
    switch (colorType) {
      case 0:
        return require('../../../assets/icons/sequence/common/green_chip.png');
      case 1:
        return require('../../../assets/icons/sequence/common/red_chip.png');
      default:
        return null;
    }
  };

  // getCardImage 함수 수정
  const getCardImage = (cardInfo: any) => {
    if (!cardInfo || !cardInfo.image) return null;
    return cardImageMap[cardInfo.image] || null;
  };

  // 카드 선택 핸들러 수정
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

    // 해당 카드의 모든 mapID 찾기 (2장)
    const allMapIDs = sequenceCards
      .filter(card => card.type === cardInfo.type && card.count === cardInfo.count)
      .map(card => card.mapID);

    // 이미 점령된 칸 제외
    const validMapIDs = allMapIDs.filter(mapID => 
      !sequenceViewModel.ownedMapIDs.includes(mapID) &&
      !sequenceViewModel.opponentOwnedMapIDs.includes(mapID)
    );

    setValidMapIDs(validMapIDs);
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
    // 시퀀스에 포함된 mapID를 Set으로 만들어 빠른 체크
    const mySequenceMapIDs = new Set(mySequences.flat());

    return mapGrid.map((rowArr, rowIdx) => (
      <View key={`row-${rowIdx}`} style={styles.row}>
        {rowArr.map(({ mapID, row, col }) => {
          const cardInfo = sequenceCards.find(card => card.mapID === mapID);
          const isValid = validMapIDs.includes(mapID);
          const isInMySequence = mySequenceMapIDs.has(mapID);

          return (
            <TouchableOpacity
              key={`cell-${row}-${col}`}
              style={[
                styles.cell,
                isValid && styles.validCell,
                isInMySequence && styles.mySequenceCell // 반투명 레드 배경 스타일
              ]}
              onPress={() => handleCellPress(row, col)}
              activeOpacity={0.8}
            >
              {cardInfo && (
                <Image
                  source={getCardImage(cardInfo)}
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
        if (sequenceViewModel.ownedMapIDs.includes(mapID)) {
          chip = getChipImage(sequenceViewModel.userColorType);
        }
        if (sequenceViewModel.opponentOwnedMapIDs.includes(mapID)) {
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
                  left: (col * cellWidth)+20,
                  top: (row * cellHeight)+23,
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

        {/* 가운데 상단 고정 턴 안내 */}
        <View style={styles.turnIndicatorFixed}>
          <Text style={styles.turnTextFixed}>
            {sequenceViewModel.isMyTurn ? '내 턴' : '상대방 턴'}
          </Text>
        </View>

        {/* 타이머 + 마지막 카드 UI */}
        <View style={styles.timerRowWrapper}>
          {/* 내 마지막 카드(왼쪽) */}
          <View style={styles.lastCardWrapper}>
            {myLastCardInfo && (
              <Image
                source={getCardImage(myLastCardInfo)}
                style={styles.lastCardImage}
                resizeMode="contain"
              />
            )}
          </View>
          {/* 타이머(가운데) */}
          <View style={styles.timerWrapper}>
            <View style={styles.timerBar}>
              <View
                style={[
                  styles.timerProgress,
                  { width: `${(timer / TURN_TIME) * 100}%` }
                ]}
              />
            </View>
          </View>
          {/* 상대 마지막 카드(오른쪽) */}
          <View style={styles.lastCardWrapper}>
            {opponentLastCardInfo && (
              <Image
                source={getCardImage(opponentLastCardInfo)}
                style={styles.lastCardImage}
                resizeMode="contain"
              />
            )}
          </View>
        </View>

        {/* 게임 보드 */}
        <View style={[styles.boardContainer, { position: 'relative' }]}>
          {renderGrid()}
          {renderChips()}
        </View>

        {/* 플레이어 카드 영역 */}
        <View style={styles.handContainer}>
          <View style={styles.handScrollView}>
            {playerHand.map((cardID: number, index: number) => {
              const cardInfo = getCardInfoById(cardID);
              return (
                <TouchableOpacity
                  key={`card-${index}`}
                  style={[
                    styles.card,
                    sequenceViewModel.selectedCard === cardID && styles.selectedCard
                  ]}
                  onPress={() => handleCardSelect(cardID)}
                >
                  {cardInfo && (
                    <Image
                      source={getCardImage(cardInfo)}
                      style={styles.cardImage}
                      resizeMode="contain"
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 시스템 메시지 */}
        {systemMessage ? (
          <SystemMessage 
            message={systemMessage} 
            onHide={() => setSystemMessage('')} 
          />
        ) : null}
      </SafeAreaView>
    </ImageBackground>
  );
});

export default SequenceScreen;
