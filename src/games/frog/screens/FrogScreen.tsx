import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Image, ImageBackground, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import SystemMessage from '../../../components/common/SystemMessage';
import styles from '../styles/FrogStyles';
import { frogViewModel } from '../services/FrogViewModel';
import { frogWebSocketService } from '../services/FrogWebsocketService';
import FrogMultiHeader from '../../../components/FrogMultiHeader';
import FrogCards from '../../../assets/data/sequnce_cards.json';

const FrogScreen: React.FC = observer(() => {
  const [systemMessage, setSystemMessage] = useState<string>('');
  const [timer, setTimer] = useState(TURN_TIME);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const [buttonCooldown, setButtonCooldown] = useState(false);
  const [myFrogs, setMyFrogs] = useState<number[][]>([]);
  const [opponentFrogs, setOpponentFrogs] = useState<number[][]>([]);

  // 플레이어의 카드 목록
  const playerHand = FrogViewModel.cardList;
  const opponentHand = FrogViewModel.opponentCardList;

  // validPositions 대신 validMapIDs로 관리 (mapID 배열)
  const [validMapIDs, setValidMapIDs] = useState<number[]>([]);

  // 마지막으로 사용한 카드들을 저장할 상태 추가
  const [myLastUsedCards, setMyLastUsedCards] = useState<number[]>([]);
  const [opponentLastUsedCards, setOpponentLastUsedCards] = useState<number[]>([]);



  // 타이머 설정
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimer(TURN_TIME);

    if (FrogViewModel.isMyTurn) {
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            if (FrogViewModel.isMyTurn) {
              FrogWebSocketService.sendTimeoutEvent();
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
  }, [FrogViewModel.isMyTurn]);

  // 내 턴이 끝나면 validMapIDs 초기화
  useEffect(() => {
    if (!FrogViewModel.isMyTurn) {
      setValidMapIDs([]);
      FrogViewModel.setSelectedCard(0);
    }
  }, [FrogViewModel.isMyTurn]);

  // 내 칩만으로 시퀀스 체크 및 게임 종료 조건 확인
  useEffect(() => {
    const mySeqs = findConsecutiveFrogs(FrogViewModel.ownedMapIDs);
    const opponentSeqs = findConsecutiveFrogs(FrogViewModel.opponentOwnedMapIDs);
    
    setMyFrogs(mySeqs);
    setOpponentFrogs(opponentSeqs);

    // 내가 만든 시퀀스가 2개 이상일 때만 게임 종료
    if (mySeqs.length >= 2) {
      FrogWebSocketService.sendGameOverEvent();
    }
  }, [FrogViewModel.ownedMapIDs, FrogViewModel.opponentOwnedMapIDs]);

  // 카드 사용 추적을 위한 useEffect
  useEffect(() => {
    // 내 카드 사용 추적
    if (FrogViewModel.ownedMapIDs.length > 0) {
      const lastMapID = FrogViewModel.ownedMapIDs[FrogViewModel.ownedMapIDs.length - 1];
      const cardInfo = FrogCards.find(card => card.mapID === lastMapID);
      if (cardInfo) {
        // 같은 타입과 숫자를 가진 카드들 찾기
        const sameCards = FrogCards
          .filter(card => card.type === cardInfo.type && card.count === cardInfo.count)
          .map(card => card.id);
        setMyLastUsedCards(sameCards);
      }
    }

    // 상대방 카드 사용 추적
    if (FrogViewModel.opponentOwnedMapIDs.length > 0) {
      const lastMapID = FrogViewModel.opponentOwnedMapIDs[FrogViewModel.opponentOwnedMapIDs.length - 1];
      const cardInfo = FrogCards.find(card => card.mapID === lastMapID);
      if (cardInfo) {
        const sameCards = FrogCards
          .filter(card => card.type === cardInfo.type && card.count === cardInfo.count)
          .map(card => card.id);
        setOpponentLastUsedCards(sameCards);
      }
    }
  }, [FrogViewModel.ownedMapIDs, FrogViewModel.opponentOwnedMapIDs]);

  // 칩 이미지 반환 함수
  const getChipImage = (colorType: number) => {
    switch (colorType) {
      case 0:
        return require('../../../assets/icons/Frog/common/green_chip.png');
      case 1:
        return require('../../../assets/icons/Frog/common/red_chip.png');
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
    if (!FrogViewModel.isMyTurn) {
      setSystemMessage('지금은 당신의 턴이 아닙니다.');
      return;
    }
    FrogViewModel.setSelectedCard(cardID);

    const cardInfo = getCardInfoById(cardID);
    if (!cardInfo) {
      setValidMapIDs([]);
      return;
    }

    // 해당 카드의 모든 mapID 찾기 (2장)
    const allMapIDs = FrogCards
      .filter(card => card.type === cardInfo.type && card.count === cardInfo.count)
      .map(card => card.mapID);

    // 이미 점령된 칸 제외
    const validMapIDs = allMapIDs.filter(mapID => 
      !FrogViewModel.ownedMapIDs.includes(mapID) &&
      !FrogViewModel.opponentOwnedMapIDs.includes(mapID)
    );

    setValidMapIDs(validMapIDs);
  };

  // 셀 클릭 핸들러
  const handleCellPress = (row: number, col: number) => {
    if (!FrogViewModel.isMyTurn) {
      setSystemMessage('지금은 당신의 턴이 아닙니다.');
      return;
    }
    const selectedCard = FrogViewModel.selectedCard;
    if (!selectedCard) {
      setSystemMessage('먼저 카드를 선택해주세요.');
      return;
    }
    const mapID = row * GRID_SIZE + col + 1;
    if (!validMapIDs.includes(mapID)) {
      setSystemMessage('이 위치에는 카드를 놓을 수 없습니다.');
      return;
    }
    FrogWebSocketService.sendUseCardEvent(selectedCard, mapID);
    setValidMapIDs([]);
    FrogViewModel.setSelectedCard(0);
  };

  // 맵 렌더링
  const renderGrid = () => {
    // 시퀀스에 포함된 mapID를 Set으로 만들어 빠른 체크
    const myFrogMapIDs = new Set(myFrogs.flat());
    const opponentFrogMapIDs = new Set(opponentFrogs.flat());

    return mapGrid.map((rowArr, rowIdx) => (
      <View key={`row-${rowIdx}`} style={styles.row}>
        {rowArr.map(({ mapID, row, col }) => {
          const cardInfo = FrogCards.find(card => card.mapID === mapID);
          const isValid = validMapIDs.includes(mapID);
          const isInMyFrog = myFrogMapIDs.has(mapID);
          const isInOpponentFrog = opponentFrogMapIDs.has(mapID);

          return (
            <TouchableOpacity
              key={`cell-${row}-${col}`}
              style={[
                styles.cell,
                isValid && styles.validCell,
                isInMyFrog && styles.myFrogCell,
                isInOpponentFrog && styles.opponentFrogCell
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
        if (FrogViewModel.ownedMapIDs.includes(mapID)) {
          chip = getChipImage(FrogViewModel.userColorType);
        }
        if (FrogViewModel.opponentOwnedMapIDs.includes(mapID)) {
          chip = getChipImage(FrogViewModel.opponentColorType);
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
                  top: (row * cellHeight)+10,
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
      source={require('../../../assets/images/Frog/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <FrogMultiHeader />

        {/* 가운데 상단 고정 턴 안내 */}
        <View style={styles.turnIndicatorFixed}>
          <Text style={styles.turnTextFixed}>
            {FrogViewModel.isMyTurn ? '내 턴' : '상대방 턴'}
          </Text>
        </View>

        {/* 타이머 + 마지막 카드 UI */}
         
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
                    FrogViewModel.selectedCard === cardID && styles.selectedCard
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

export default FrogScreen;
