import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Image, ImageBackground, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import SystemMessage from '../../../components/common/SystemMessage';
import styles from '../styles/FrogStyles';
import { frogViewModel } from '../services/FrogViewModel';
import { frogWebSocketService } from '../services/FrogWebsocketService';
import FrogMultiHeader from '../../../components/FrogMultiHeader';
import FrogCards from '../../../assets/data/sequnce_cards.json';
import frogCards from '../../../assets/data/frog_cards.json';

const GRID_ROWS = 6;
const GRID_COLS = 8;
const TOTAL_CARDS = 44; // 실제 카드 개수

// 임시 카드 이미지
  const dummyCard = require('../../../assets/icons/frog/card/card01.png');
  const dummyDora = require('../../../assets/icons/frog/card/card01.png');

const cardImageMap: Record<string, any> = {
  'red1.png': require('../../../assets/icons/frog/card/card01.png'),
  'red2.png': require('../../../assets/icons/frog/card/card01.png'),
  'red3.png': require('../../../assets/icons/frog/card/card01.png'),
  'red4.png': require('../../../assets/icons/frog/card/card01.png'),
  'red5.png': require('../../../assets/icons/frog/card/card01.png'),
  'red6.png': require('../../../assets/icons/frog/card/card01.png'),
  'red7.png': require('../../../assets/icons/frog/card/card01.png'),
  'red8.png': require('../../../assets/icons/frog/card/card01.png'),
  'red9.png': require('../../../assets/icons/frog/card/card01.png'),
  'red10.png': require('../../../assets/icons/frog/card/card01.png'),
  'green2.png': require('../../../assets/icons/frog/card/card01.png'),
  'green3.png': require('../../../assets/icons/frog/card/card01.png'),
  'green4.png': require('../../../assets/icons/frog/card/card01.png'),
  'green6.png': require('../../../assets/icons/frog/card/card01.png'),
  'green8.png': require('../../../assets/icons/frog/card/card01.png'),
  'green11.png': require('../../../assets/icons/frog/card/card01.png'),
  'normal1.png': require('../../../assets/icons/frog/card/card01.png'),
  'normal5.png': require('../../../assets/icons/frog/card/card01.png'),
  'normal7.png': require('../../../assets/icons/frog/card/card01.png'),
  'normal9.png': require('../../../assets/icons/frog/card/card01.png'),
  // ... 나머지 카드 이미지도 모두 추가 ...
};

const FrogScreen: React.FC = observer(() => {
  const [systemMessage, setSystemMessage] = useState<string>('');
  const [timer, setTimer] = useState(30);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const [buttonCooldown, setButtonCooldown] = useState(false);
  const [myFrogs, setMyFrogs] = useState<number[][]>([]);
  const [opponentFrogs, setOpponentFrogs] = useState<number[][]>([]);
  const [doraCard, setDoraCard] = useState<number | null>(null);

  // 플레이어의 카드 목록
  const playerHand = frogViewModel.cardList;

  // validPositions 대신 validMapIDs로 관리 (mapID 배열)
  const [validMapIDs, setValidMapIDs] = useState<number[]>([]);

  // 마지막으로 사용한 카드들을 저장할 상태 추가
  const [myLastUsedCards, setMyLastUsedCards] = useState<number[]>([]);
  const [opponentLastUsedCards, setOpponentLastUsedCards] = useState<number[]>([]);

  // 카드 id → 카드 정보 매핑
  const frogCardMap = useMemo(() => {
    const map: Record<number, any> = {};
    frogCards.forEach(card => {
      map[card.id] = card;
    });
    return map;
  }, []);

  // getDiscardCounts를 컴포넌트 내부, frogCardMap 아래에 위치
  const getDiscardCounts = (discardedCardIds: number[]) => {
    const result: Record<number, { green: number; red: number; normal: number }> = {};
    for (let i = 1; i <= 11; i++) {
      result[i] = { green: 0, red: 0, normal: 0 };
    }
    discardedCardIds.forEach(id => {
      const card = frogCardMap[id];
      if (card) {
        const { count, color } = card;
        if (result[count] && (color === 'green' || color === 'red' || color === 'normal')) {
          result[count][color as 'green' | 'red' | 'normal'] += 1;
        }
      }
    });
    return result;
  };

  // 2. 그 아래에서 useMemo(discardCounts) 사용
  const discardCounts = useMemo(
    () => getDiscardCounts(frogViewModel.discardCardList || []),
    [frogViewModel.discardCardList]
  );

  // 타이머 설정
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimer(30);

    if (frogViewModel.isMyTurn) {
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            if (frogViewModel.isMyTurn) {
              handleTimeout();
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
  }, [frogViewModel.isMyTurn]);

  const { round, playTurn, isMyTurn, dora } = frogViewModel;

  // 선택된 카드 상태 (0, 3라운드 이후: 1장, 1~2라운드: 5장)
  const [selectedImportCards, setSelectedImportCards] = useState<number[]>([]);

  // 서버에서 받은 카드 데이터를 저장할 상태 추가
  const [mapCards, setMapCards] = useState<number[]>([]);

  // 서버에서 카드 데이터를 받아오는 useEffect
  useEffect(() => {
    // 서버에서 카드 데이터를 받아오는 로직
    const fetchMapCards = async () => {
      try {
        // TODO: 실제 API 호출로 대체
        const response = await fetch('/api/frog/map-cards');
        const data = await response.json();
        setMapCards(data.cards); // 44장의 카드 ID 배열
      } catch (error) {
        console.error('Failed to fetch map cards:', error);
      }
    };

    fetchMapCards();
  }, []);

  // 맵에서 카드 선택 핸들러 수정
  const handleMapCardPress = (cardId: number) => {
    if (!frogViewModel.isMyTurn) return;

    // 0라운드: 도라 선택
    if (frogViewModel.round === 0 && !frogViewModel.dora) {
      frogWebSocketService.sendDoraEvent(cardId);
      return;
    }

    // 1,2라운드: 5장 선택
    if ((frogViewModel.round === 1 || frogViewModel.round === 2)) {
      if (selectedImportCards.includes(cardId)) return;
      if (selectedImportCards.length >= 5) return;
      const next = [...selectedImportCards, cardId];
      setSelectedImportCards(next);
      if (next.length === 5) {
        frogWebSocketService.sendImportCardsEvent(next);
        // 선택 초기화만 하고 맵의 카드는 그대로 유지
        setTimeout(() => setSelectedImportCards([]), 300);
      }
      return;
    }

    // 3라운드 이후: 1장 선택
    if (frogViewModel.round >= 3) {
      if (selectedImportCards.length === 0) {
        setSelectedImportCards([cardId]);
        frogWebSocketService.sendImportSingleCardEvent(cardId);
        // 선택 초기화만 하고 맵의 카드는 그대로 유지
        setTimeout(() => setSelectedImportCards([]), 300);
      }
      return;
    }
  };

  // 맵 렌더링 수정
  const renderGrid = () => {
    let cardCount = 0;
    return Array.from({ length: GRID_ROWS }).map((_, rowIdx) => (
      <View key={`row-${rowIdx}`} style={styles.row}>
        {Array.from({ length: GRID_COLS }).map((_, colIdx) => {
          cardCount++;
          const cardId = cardCount <= TOTAL_CARDS ? mapCards[cardCount - 1] : null;
          
          // 선택 가능 조건
          let isSelectable = false;
          if (frogViewModel.isMyTurn) {
            if (frogViewModel.round === 0 && !frogViewModel.dora) {
              isSelectable = !!cardId;
            } else if ((frogViewModel.round === 1 || frogViewModel.round === 2) && selectedImportCards.length < 5) {
              isSelectable = !!cardId && !selectedImportCards.includes(cardId);
            } else if (frogViewModel.round >= 3 && selectedImportCards.length === 0) {
              isSelectable = !!cardId;
            }
          }

          const isSelected = selectedImportCards.includes(cardId!);
          const card = cardId ? frogCardMap[cardId] : null;
          const imageSource = card && cardImageMap[card.image] ? cardImageMap[card.image] : dummyCard;

          return (
            <TouchableOpacity
              key={`cell-${rowIdx}-${colIdx}`}
              style={[
                styles.cell,
                cardCount > TOTAL_CARDS && styles.emptyCell,
                isSelected && { backgroundColor: '#4CAF50' },
                isSelectable && { borderColor: '#4CAF50', borderWidth: 2 },
              ]}
              disabled={!isSelectable}
              onPress={() => cardId && handleMapCardPress(cardId)}
            >
              {cardId ? (
                <Image 
                  source={imageSource} 
                  style={styles.cardImage} 
                  resizeMode="contain" 
                />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    ));
  };

  // 도라 카드 UI
  const doraCardObj = frogCards.find(card => card.id === dora);
  const doraImageSource =
    doraCardObj && cardImageMap[doraCardObj.image]
      ? cardImageMap[doraCardObj.image]
      : dummyCard;

  const renderDora = () => (
    <View style={styles.doraArea}>
      {dora ? (
        <Image
          source={doraImageSource}
          style={styles.doraImage}
          resizeMode="contain"
        />
      ) : (
        <View
          style={[
            styles.doraImage,
            { backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 6 }
          ]}
        />
      )}
    </View>
  );

  // 버려진 패 정보를 표시하는 컴포넌트
  const DiscardInfo = ({ count, discardCounts }: { count: number, discardCounts: { green: number, red: number, normal: number } }) => {
    const card = frogCards.find(card => card.count === count);
    const imageSource = card && cardImageMap[card.image] ? cardImageMap[card.image] : dummyCard;

    return (
      <View style={styles.discardInfoContainer}>
        <Image source={imageSource} style={styles.discardCardImage} resizeMode="contain" />
        <View style={styles.discardCountsContainer}>
          <View style={styles.discardCountRow}>
            <View style={[styles.colorDot, styles.greenDot]} />
            <Text style={styles.discardCountText}>{discardCounts.green}</Text>
          </View>
          <View style={styles.discardCountRow}>
            <View style={[styles.colorDot, styles.redDot]} />
            <Text style={styles.discardCountText}>{discardCounts.red}</Text>
          </View>
          <View style={styles.discardCountRow}>
            <View style={[styles.colorDot, styles.normalDot]} />
            <Text style={styles.discardCountText}>{discardCounts.normal}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderDiscardPile = () => (
    <View style={styles.discardPileContainer}>
      {Array.from({ length: 11 }).map((_, idx) => (
        <DiscardInfo
          key={`discard-${idx}`}
          count={idx + 1}
          discardCounts={discardCounts[idx + 1]}
        />
      ))}
    </View>
  );

  // 내 카드 렌더링 함수 수정 (handContainer, handScrollView만 사용)
  const [handOrder, setHandOrder] = useState<number[]>(frogViewModel.cardList);
  const [selectedHandIdx, setSelectedHandIdx] = useState<number | null>(null);

  // 카드 리스트가 바뀌면 handOrder도 동기화
  useEffect(() => {
    setHandOrder(frogViewModel.cardList);
  }, [frogViewModel.cardList]);

  const handleHandCardPress = (idx: number) => {
    if (selectedHandIdx === null) {
      setSelectedHandIdx(idx);
    } else if (selectedHandIdx === idx) {
      setSelectedHandIdx(null); // 같은 카드 다시 누르면 선택 해제
    } else {
      // 자리 교체
      const newOrder = [...handOrder];
      [newOrder[selectedHandIdx], newOrder[idx]] = [newOrder[idx], newOrder[selectedHandIdx]];
      setHandOrder(newOrder);
      setSelectedHandIdx(null);
      // 교체 상태를 ViewModel에도 저장(다음 라운드에도 유지)
      frogViewModel.setCardList(newOrder);
    }
  };

  const renderHand = () => (
    <View style={styles.handContainer}>
      <View style={styles.handScrollView}>
        {handOrder.map((id: number, idx: number) => {
          const card = frogCardMap[id];
          const imageSource = card && cardImageMap[card.image] ? cardImageMap[card.image] : dummyCard;
          const isSelected = selectedHandIdx === idx;
          return (
            <TouchableOpacity
              key={`hand-card-${idx}`}
              style={[
                styles.handCardWrapper,
                isSelected && { borderColor: '#4CAF50', borderWidth: 2 }
              ]}
              onPress={() => handleHandCardPress(idx)}
            >
              <Image source={imageSource} style={styles.handCardImage} resizeMode="contain" />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const handleTimeout = () => {
    const myCards = frogViewModel.cardList;
    if (myCards.length === 6) {
      // 내 카드 중 1장 랜덤 버리기
      const randomIdx = Math.floor(Math.random() * myCards.length);
      const cardIdToDiscard = myCards[randomIdx];
      frogWebSocketService.sendDiscardEvent(cardIdToDiscard);
    } else if (myCards.length === 5) {
       frogWebSocketService.sendTimeoutEvent(0);
    }
  };

  // 점수 계산 함수(임시, 실제 계산식은 추후 교체)
  const calculateScore = (cards: number[]): number => {
    // TODO: 실제 점수 계산식으로 교체
    return cards.length * 10;
  };

  // 안내 메시지
  const renderImportGuide = () => {
    if (!frogViewModel.isMyTurn) return null;
    if (frogViewModel.round === 0 && !frogViewModel.dora) {
      return (
        <View style={{ alignItems: 'center', marginVertical: 8 }}>
          <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>
            도라를 선택하세요!
          </Text>
        </View>
      );
    }
    if ((frogViewModel.round === 1 || frogViewModel.round === 2)) {
      return (
        <View style={{ alignItems: 'center', marginVertical: 8 }}>
          <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>
            5장의 카드를 선택하세요! ({selectedImportCards.length}/5)
          </Text>
        </View>
      );
    }
    if (frogViewModel.round >= 3) {
      return (
        <View style={{ alignItems: 'center', marginVertical: 8 }}>
          <Text style={{ color: '#4CAF50', fontWeight: 'bold' }}>
            1장의 카드를 선택하세요!
          </Text>
        </View>
      );
    }
    return null;
  };

  // LOAN 버튼 핸들러
  const handleLoan = () => {
    if (!frogViewModel.isMyTurn) return;
    const opponentDiscardCardList = frogViewModel.opponentDiscardCardList;
    const cardId = opponentDiscardCardList[opponentDiscardCardList.length - 1];
    frogWebSocketService.sendLoanEvent(cardId);
  };

  return (
    <ImageBackground
      source={require('../../../assets/icons/frog/common/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <FrogMultiHeader />

        {/* 도라 선택 안내 메시지 */}
        {renderImportGuide()}

        {/* 가운데 상단 고정 턴 안내 */}
        <View style={styles.turnIndicatorFixed}>
          <Text style={styles.turnTextFixed}>
            {frogViewModel.isMyTurn ? '내 턴' : '상대방 턴'}
          </Text>
        </View>

        {/* 타이머 + 마지막 카드 UI */}
         
          {/* 타이머(가운데) */}
          <View style={styles.timerWrapper}>
            <View style={styles.timerBar}>
              <View
                style={[
                  styles.timerProgress,
                  { width: `${(timer / 30) * 100}%` }
                ]}
              />
            </View>
          </View>
         

        {/* 게임 보드 */}
        <View style={[styles.boardContainer, { position: 'relative' }]}>
          {renderGrid()}
        </View>

        {/* 버려진 카드(위) */}
        <View style={styles.discardPileContainer}>
          {renderDiscardPile()}
        </View>

        {/* 도라 + 내 카드(핸드) 한 행에 배치 */}
        <View style={styles.doraHandRow}>
          {renderDora()}
          <View style={styles.handArea}>
            {renderHand()}
          </View>
        </View>

        {/* 버튼 3개 */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLoan}
            disabled={!frogViewModel.isMyTurn}
          >
            <Text style={styles.buttonText}>론</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.buttonText}>가져오기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.buttonText}>버리기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              const myCards = frogViewModel.cardList;
              const score = calculateScore(myCards);
              frogWebSocketService.sendWinRequestEvent(score, myCards);
            }}
          >
            <Text style={styles.buttonText}>승리 요청</Text>
          </TouchableOpacity>
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

