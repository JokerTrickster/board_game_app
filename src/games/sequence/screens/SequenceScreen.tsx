import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Image, ImageBackground, StyleSheet, Modal } from 'react-native';
import { observer } from 'mobx-react-lite';
import SystemMessage from '../../../components/common/SystemMessage';
import styles from '../styles/SequenceStyles';
import { sequenceViewModel } from '../services/SequenceViewModel';
import { sequenceWebSocketService } from '../services/SequenceWebsocketService';
import SequenceMultiHeader from '../../../components/SequenceMultiHeader';
import sequenceCards from '../../../assets/data/sequnce_cards.json';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/navigationTypes';

const GRID_SIZE = 10; // 10x10 격자
const TURN_TIME = 30; // 턴당 제한 시간(초)
const CELL_SIZE = 35; // 셀 크기 상수 추가

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

// cellWidth와 cellHeight 계산 수정
const cellWidth = CELL_SIZE + 2; // margin 1px * 2
const cellHeight = CELL_SIZE + 2; // margin 1px * 2

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
  'joker1.png': require('../../../assets/icons/sequence/cards/joker1.png'),
  'joker2.png': require('../../../assets/icons/sequence/cards/joker2.png'),
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

// 내 칩만으로 시퀀스 찾기 (중복 없는 5개 단위 시퀀스만 인정)
const findConsecutiveSequences = (ownedMapIDs: number[]): number[][] => {
  const sequences: number[][] = [];
  const checked = new Set<number>(); // 이미 시퀀스로 인정된 mapID는 중복 포함 금지

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const mapID = coordToMapId(row, col);
      if (!ownedMapIDs.includes(mapID) && !SPECIAL_MAP_IDS.includes(mapID)) {continue;}

      for (const direction of DIRECTIONS) {
        let tempSeq: number[] = [];
        let specialCount = 0;
        let usedSequenceCount = 0; // 이미 만들어진 시퀀스 칩 사용 횟수
        let r = row;
        let c = col;

        while (true) {
          const curMapID = coordToMapId(r, c);
          //소유하고 있거나 스펠셜 좌표인지 체크
          if ((ownedMapIDs.includes(curMapID) || SPECIAL_MAP_IDS.includes(curMapID))) {
            // 이미 시퀀스로 인정된 칩인지 체크
            if (SPECIAL_MAP_IDS.includes(curMapID)) {specialCount++;}

            if (checked.has(curMapID)) {
              usedSequenceCount++;
              tempSeq.push(curMapID);
            } else if (!SPECIAL_MAP_IDS.includes(curMapID)){
              //새로 추가해야될 칩이라면 좌표 추가
              tempSeq.push(curMapID);
            }
            //이미 시퀀스로 인정된 칩이 2개 이상이면 종료
            if (usedSequenceCount >= 2) {
              break;
            }
            //스펠셜 좌표인지 체크

            // 시퀀스 길이가 4 이상일 때 검사
            if (tempSeq.length >= 4) {
                // 특수 카드가 1개이고 길이가 4인 경우
                if (tempSeq.length === 4 && specialCount === 1) {
                    sequences.push([...tempSeq]);
                  tempSeq.forEach(id => checked.add(id));
                  break;
                }
                // 특수 카드가 없고 길이가 5인 경우
                else if (tempSeq.length === 5 && specialCount === 0) {
                    sequences.push([...tempSeq]);
                  tempSeq.forEach(id => checked.add(id));
                  break;
                }
            }

            // 다음 칸으로 이동
            r += direction.row;
            c += direction.col;
            if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) {break;}
          } else {
            // 연속이 끊기면 초기화
            tempSeq = [];
            specialCount = 0;
            usedSequenceCount = 0;
            break;
          }
        }
      }
    }
  }

  return sequences;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SequenceScreen: React.FC = observer(() => {
  const [systemMessage, setSystemMessage] = useState<string>('');
  const [buttonCooldown, setButtonCooldown] = useState(false);
  const [mySequences, setMySequences] = useState<number[][]>([]);
  const [opponentSequences, setOpponentSequences] = useState<number[][]>([]);

  // 플레이어의 카드 목록
  const playerHand = sequenceViewModel.cardList;
  const opponentHand = sequenceViewModel.opponentCardList;

  // validPositions 대신 validMapIDs로 관리 (mapID 배열)
  const [validMapIDs, setValidMapIDs] = useState<number[]>([]);

  // 마지막으로 사용한 카드들을 저장할 상태 추가
  const [myLastUsedCards, setMyLastUsedCards] = useState<number[]>([]);
  const [opponentLastUsedCards, setOpponentLastUsedCards] = useState<number[]>([]);

  // 상대방이 마지막으로 놓은 칩의 mapID를 저장할 상태 추가
  const [opponentLastChipMapID, setOpponentLastChipMapID] = useState<number | null>(null);

  const navigation = useNavigation<NavigationProp>();

  // 내 칩만으로 시퀀스 체크 및 게임 종료 조건 확인
  useEffect(() => {
    const mySeqs = findConsecutiveSequences(sequenceViewModel.ownedMapIDs);
    const opponentSeqs = findConsecutiveSequences(sequenceViewModel.opponentOwnedMapIDs);

    setMySequences(mySeqs);
    setOpponentSequences(opponentSeqs);
    sequenceViewModel.setMySequences(mySeqs);
    sequenceViewModel.setOpponentSequences(opponentSeqs);
    // 시퀀스 2개 이상일 때 게임 종료
    if (mySeqs.length >= 2 && !sequenceViewModel.isMyTurn) {
        sequenceWebSocketService.sendGameOverEvent();
    }
  }, [sequenceViewModel.ownedMapIDs, sequenceViewModel.opponentOwnedMapIDs, sequenceViewModel.isMyTurn]);

  useEffect(() => {
    if (sequenceViewModel.gameOver) {
      setSystemMessage('시퀀스 2개를 완성했습니다! 게임이 종료됩니다.');
      setTimeout(() => {
      }, 3000);
    }
  }, [sequenceViewModel.gameOver]);


  // 카드 사용 추적을 위한 useEffect
  useEffect(() => {
    // 내 카드 사용 추적
    if (sequenceViewModel.ownedMapIDs.length > 0) {
      const lastMapID = sequenceViewModel.ownedMapIDs[sequenceViewModel.ownedMapIDs.length - 1];
      const cardInfo = sequenceCards.find(card => card.mapID === lastMapID);
      if (cardInfo) {
        // 같은 타입과 숫자를 가진 카드들 찾기
        const sameCards = sequenceCards
          .filter(card => card.type === cardInfo.type && card.count === cardInfo.count)
          .map(card => card.id);
        setMyLastUsedCards(sameCards);
      }
    }

    // 상대방 카드 사용 추적
    if (sequenceViewModel.opponentOwnedMapIDs.length > 0) {
      const lastMapID = sequenceViewModel.opponentOwnedMapIDs[sequenceViewModel.opponentOwnedMapIDs.length - 1];
      const cardInfo = sequenceCards.find(card => card.mapID === lastMapID);
      if (cardInfo) {
        const sameCards = sequenceCards
          .filter(card => card.type === cardInfo.type && card.count === cardInfo.count)
          .map(card => card.id);
        setOpponentLastUsedCards(sameCards);
      }
    }
  }, [sequenceViewModel.ownedMapIDs, sequenceViewModel.opponentOwnedMapIDs]);

  // 상대방 칩 사용 추적을 위한 useEffect 수정
  useEffect(() => {
    if (sequenceViewModel.opponentOwnedMapIDs.length > 0) {
      const lastMapID = sequenceViewModel.opponentOwnedMapIDs[sequenceViewModel.opponentOwnedMapIDs.length - 1];
      setOpponentLastChipMapID(lastMapID);
    }
  }, [sequenceViewModel.opponentOwnedMapIDs]);

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
    if (!cardInfo || !cardInfo.image) {return null;}
    return cardImageMap[cardInfo.image] || null;
  };

  // 카드 선택 핸들러 수정
  const handleCardSelect = (cardID: number) => {
    if (!sequenceViewModel.isMyTurn) {
      setSystemMessage('지금은 당신의 턴이 아닙니다.');
      setValidMapIDs([]); // 내 턴이 아닐 때는 유효한 위치 초기화
      sequenceViewModel.setSelectedCard(0); // 내 턴이 아닐 때는 선택된 카드 초기화
      return;
    }
    sequenceViewModel.setSelectedCard(cardID);

    const cardInfo = getCardInfoById(cardID);
    if (!cardInfo) {
      setValidMapIDs([]);
      return;
    }

    // 조커 카드 처리
    if (cardInfo.type === 'joker') {
      if (cardInfo.count === 'j1') {
        // j1 조커: 상대방이 놓은 칩을 제거할 수 있는 위치
        const validMapIDs = sequenceViewModel.opponentOwnedMapIDs;
        setValidMapIDs(validMapIDs);
      } else if (cardInfo.count === 'j2') {
        // j2 조커: 비어있는 곳 중 특수 위치(1,10,91,100)를 제외한 모든 위치
        const allMapIDs = Array.from({ length: 100 }, (_, i) => i + 1);
        const validMapIDs = allMapIDs.filter(mapID =>
          !SPECIAL_MAP_IDS.includes(mapID) && // 특수 위치 제외
          !sequenceViewModel.ownedMapIDs.includes(mapID) && // 내가 놓은 칩 제외
          !sequenceViewModel.opponentOwnedMapIDs.includes(mapID) // 상대방이 놓은 칩 제외
        );
        setValidMapIDs(validMapIDs);
      }
      return;
    }

    // 일반 카드 처리 (기존 로직)
    const allMapIDs = sequenceCards
      .filter(card => card.type === cardInfo.type && card.count === cardInfo.count)
      .map(card => card.mapID);

    const validMapIDs = allMapIDs.filter(mapID =>
      !sequenceViewModel.ownedMapIDs.includes(mapID) &&
      !sequenceViewModel.opponentOwnedMapIDs.includes(mapID)
    );

    setValidMapIDs(validMapIDs);
  };

  // 턴이 변경될 때 선택된 카드 초기화를 위한 useEffect 추가
  useEffect(() => {
    if (!sequenceViewModel.isMyTurn) {
      sequenceViewModel.setSelectedCard(0);
      setValidMapIDs([]);
    }
  }, [sequenceViewModel.isMyTurn]);

  // 셀 클릭 핸들러 수정
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

    const cardInfo = getCardInfoById(selectedCard);
    if (!cardInfo) {return;}

    // 조커 카드 처리
    if (cardInfo.type === 'joker') {
      if (cardInfo.count === 'j1') {
        // j1 조커: 상대방 칩 제거
        sequenceWebSocketService.sendRemoveCardEvent(selectedCard, mapID);
      } else if (cardInfo.count === 'j2') {
        // j2 조커: 빈 공간에 칩 배치
        sequenceWebSocketService.sendUseCardEvent(selectedCard, mapID);
      }
    } else {
      // 일반 카드 처리
      sequenceWebSocketService.sendUseCardEvent(selectedCard, mapID);
    }

    // 카드 사용 후 시퀀스 체크를 위한 타이머 설정
    setTimeout(() => {
      const mySeqs = findConsecutiveSequences(sequenceViewModel.ownedMapIDs);
      if (mySeqs.length >= 2) {
        // 시퀀스 2개 이상 완성 시 게임 종료
        sequenceWebSocketService.sendGameOverEvent();
        setSystemMessage('시퀀스 2개를 완성했습니다! 게임이 종료됩니다.');
      }
    }, 500); // 0.5초 후 체크 (서버 응답 대기 시간 고려)

    setValidMapIDs([]);
    sequenceViewModel.setSelectedCard(0);
  };

  // 맵 렌더링
  const renderGrid = () => {
    const mySequenceMapIDs = new Set(mySequences.flat());
    const opponentSequenceMapIDs = new Set(opponentSequences.flat());

    return mapGrid.map((rowArr, rowIdx) => (
      <View key={`row-${rowIdx}`} style={styles.row}>
        {rowArr.map(({ mapID, row, col }) => {
          const cardInfo = sequenceCards.find(card => card.mapID === mapID);
          const isValid = sequenceViewModel.isMyTurn && validMapIDs.includes(mapID);
          const isInMySequence = mySequenceMapIDs.has(mapID);
          const isInOpponentSequence = opponentSequenceMapIDs.has(mapID);
          const isOpponentLastChip = mapID === opponentLastChipMapID;

          let chip = null;
          if (sequenceViewModel.ownedMapIDs.includes(mapID)) {
            chip = getChipImage(sequenceViewModel.userColorType);
          }
          if (sequenceViewModel.opponentOwnedMapIDs.includes(mapID)) {
            chip = getChipImage(sequenceViewModel.opponentColorType);
          }

          return (
            <TouchableOpacity
              key={`cell-${row}-${col}`}
              style={[
                styles.cell,
                isValid && styles.validCell,
                isInMySequence && styles.mySequenceCell,
                isInOpponentSequence && styles.opponentSequenceCell,
                isOpponentLastChip && styles.opponentLastChipCell,
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
              {chip && (
                <View style={styles.chipContainer}>
                  <Image
                    source={chip}
                    style={styles.chipImage}
                    resizeMode="contain"
                  />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    ));
  };

  const handleGoToResult = () => {
    if (sequenceViewModel.gameResult) {
      navigation.navigate('SequenceResult', sequenceViewModel.gameResult);
      sequenceViewModel.resetGameOver();
    }
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

        {/* 게임 보드 */}
        <View style={[styles.boardContainer, { position: 'relative' }]}>
          {renderGrid()}
        </View>

        {/* 플레이어 카드 영역 */}
        <View style={[
          styles.handContainer,
          sequenceViewModel.isMyTurn && styles.activeHandContainer,
        ]}>
          <View style={styles.handScrollView}>
            {playerHand.map((cardID: number, index: number) => {
              const cardInfo = getCardInfoById(cardID);
              return (
                <TouchableOpacity
                  key={`card-${index}`}
                  style={[
                    styles.card,
                    sequenceViewModel.selectedCard === cardID && styles.selectedCard,
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

        {/* 게임 종료 모달 */}
        <Modal
          visible={sequenceViewModel.isGameOver}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {sequenceViewModel.gameResult?.isSuccess ? '승리!' : '패배!'}
              </Text>
              <Text style={styles.modalScore}>
                내 점수: {sequenceViewModel.gameResult?.myScore}
              </Text>
              <Text style={styles.modalScore}>
                상대방 점수: {sequenceViewModel.gameResult?.opponentScore}
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleGoToResult}
              >
                <Text style={styles.modalButtonText}>결과 화면으로 이동</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
});

export default SequenceScreen;
