import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Image, ImageBackground, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import SystemMessage from '../../../components/common/SystemMessage';
import styles from '../styles/FrogStyles';
import { frogViewModel } from '../services/FrogViewModel';
import { frogWebSocketService } from '../services/FrogWebsocketService';
import FrogMultiHeader from '../../../components/FrogMultiHeader';
import FrogCards from '../../../assets/data/sequnce_cards.json';

const GRID_ROWS = 6;
const GRID_COLS = 8;
const TOTAL_CARDS = 44; // 실제 카드 개수

// 임시 카드 이미지
  const dummyCard = require('../../../assets/icons/frog/card/card01.png');
  const dummyDora = require('../../../assets/icons/frog/card/card01.png');
const FrogScreen: React.FC = observer(() => {
  const [systemMessage, setSystemMessage] = useState<string>('');
  const [timer, setTimer] = useState(30);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const [buttonCooldown, setButtonCooldown] = useState(false);
  const [myFrogs, setMyFrogs] = useState<number[][]>([]);
  const [opponentFrogs, setOpponentFrogs] = useState<number[][]>([]);

  // 플레이어의 카드 목록
  const playerHand = frogViewModel.cardList;
  const opponentHand = frogViewModel.opponentCardList;

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
    setTimer(30);

    if (frogViewModel.isMyTurn) {
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            if (frogViewModel.isMyTurn) {
              frogWebSocketService.sendTimeoutEvent();
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

  // 8x6 맵 생성 (44장만 표시)
  const renderGrid = () => {
    let cardCount = 0;
    return Array.from({ length: GRID_ROWS }).map((_, rowIdx) => (
      <View key={`row-${rowIdx}`} style={styles.row}>
        {Array.from({ length: GRID_COLS }).map((_, colIdx) => {
          cardCount++;
          return (
            <View 
              key={`cell-${rowIdx}-${colIdx}`} 
              style={[
                styles.cell,
                cardCount > TOTAL_CARDS && styles.emptyCell // 빈 셀 스타일 적용
              ]}
            >
              {cardCount <= TOTAL_CARDS ? (
                <Image source={dummyCard} style={styles.cardImage} resizeMode="contain" />
              ) : null}
            </View>
          );
        })}
      </View>
    ));
  };

  // 버려진 패 정보를 표시하는 컴포넌트
  const DiscardInfo = ({ cardNumber }: { cardNumber: number }) => {
    const discardCounts = {
      green: Math.floor(Math.random() * 3),
      red: Math.floor(Math.random() * 3),
      normal: Math.floor(Math.random() * 3)
    };

    return (
      <View style={styles.discardInfoContainer}>
        <Image source={dummyCard} style={styles.discardCardImage} resizeMode="contain" />
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

  // 버려진 카드 렌더링
  const renderDiscardPile = () => (
    <View style={styles.discardPileContainer}>
      {Array.from({ length: 11 }).map((_, idx) => (
        <DiscardInfo key={`discard-${idx}`} cardNumber={idx + 1} />
      ))}
    </View>
  );

  // 내 카드 렌더링 함수 수정 (handContainer, handScrollView만 사용)
  const renderHand = () => (
    <View style={styles.handContainer}>
      <View style={styles.handScrollView}>
        {Array.from({ length: 6 }).map((_, idx) => (
          <View key={`hand-card-${idx}`} style={styles.handCardWrapper}>
            <Image source={dummyCard} style={styles.handCardImage} resizeMode="contain" />
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <ImageBackground
      source={require('../../../assets/icons/frog/common/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <FrogMultiHeader />

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
          <View style={styles.doraArea}>
            <Image source={dummyDora} style={styles.doraImage} resizeMode="contain" />
          </View>
          <View style={styles.handArea}>
            {renderHand()}
          </View>
        </View>

        {/* 버튼 3개 */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.buttonText}>론</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.buttonText}>가져오기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.buttonText}>버리기</Text>
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
