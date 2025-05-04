import SystemMessage from '../../../components/common/SystemMessage';
import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert, Image, ImageBackground } from 'react-native';
import styles from '../styles/SlimeWarStyles';
import { slimeWarService } from '../services/SlimeWarService';
import { slimeWarWebSocketService } from '../services/SlimeWarWebsocketService';
import { observer } from 'mobx-react-lite';
import { slimeWarViewModel } from '../services/SlimeWarViewModel';
import SlimeWarMultiHeader from '../../../components/SlimeWarMultiHeader';
import cardData from '../../../assets/data/cards.json';


const GRID_SIZE = 9; // 0~8까지 9칸

const TURN_TIME = 30; // 턴당 제한 시간(초)

// 카드 이미지 매핑 (id: require)
const cardImageMap: { [key: number]: any } = {
  1: require('../../../assets/icons/slime-war/card/card_0_1.png'),
  2: require('../../../assets/icons/slime-war/card/card_0_1.png'),
  3: require('../../../assets/icons/slime-war/card/card_0_2.png'),
  4: require('../../../assets/icons/slime-war/card/card_0_2.png'),
  5: require('../../../assets/icons/slime-war/card/card_0_3.png'),
  6: require('../../../assets/icons/slime-war/card/card_0_3.png'),
  7: require('../../../assets/icons/slime-war/card/card_1_1.png'),
  8: require('../../../assets/icons/slime-war/card/card_1_1.png'),
  9: require('../../../assets/icons/slime-war/card/card_1_2.png'),
  10: require('../../../assets/icons/slime-war/card/card_1_2.png'),
  11: require('../../../assets/icons/slime-war/card/card_1_3.png'),
  12: require('../../../assets/icons/slime-war/card/card_1_3.png'),
  13: require('../../../assets/icons/slime-war/card/card_2_1.png'),
  14: require('../../../assets/icons/slime-war/card/card_2_1.png'),
  15: require('../../../assets/icons/slime-war/card/card_2_2.png'),
  16: require('../../../assets/icons/slime-war/card/card_2_2.png'),
  17: require('../../../assets/icons/slime-war/card/card_2_3.png'),
  18: require('../../../assets/icons/slime-war/card/card_2_3.png'),
  19: require('../../../assets/icons/slime-war/card/card_3_1.png'),
  20: require('../../../assets/icons/slime-war/card/card_3_1.png'),
  21: require('../../../assets/icons/slime-war/card/card_3_2.png'),
  22: require('../../../assets/icons/slime-war/card/card_3_2.png'),
  23: require('../../../assets/icons/slime-war/card/card_3_3.png'),
  24: require('../../../assets/icons/slime-war/card/card_3_3.png'),
  25: require('../../../assets/icons/slime-war/card/card_4_1.png'),
  26: require('../../../assets/icons/slime-war/card/card_4_1.png'),
  27: require('../../../assets/icons/slime-war/card/card_4_2.png'),
  28: require('../../../assets/icons/slime-war/card/card_4_2.png'),
  29: require('../../../assets/icons/slime-war/card/card_4_3.png'),
  30: require('../../../assets/icons/slime-war/card/card_4_3.png'),
  31: require('../../../assets/icons/slime-war/card/card_5_1.png'),
  32: require('../../../assets/icons/slime-war/card/card_5_1.png'),
  33: require('../../../assets/icons/slime-war/card/card_5_2.png'),
  34: require('../../../assets/icons/slime-war/card/card_5_2.png'),
  35: require('../../../assets/icons/slime-war/card/card_5_3.png'),
  36: require('../../../assets/icons/slime-war/card/card_5_3.png'),
  37: require('../../../assets/icons/slime-war/card/card_6_1.png'),
  38: require('../../../assets/icons/slime-war/card/card_6_1.png'),
  39: require('../../../assets/icons/slime-war/card/card_6_2.png'),
  40: require('../../../assets/icons/slime-war/card/card_6_2.png'),
  41: require('../../../assets/icons/slime-war/card/card_6_3.png'),
  42: require('../../../assets/icons/slime-war/card/card_6_3.png'),
  43: require('../../../assets/icons/slime-war/card/card_7_1.png'),
  44: require('../../../assets/icons/slime-war/card/card_7_1.png'),
  45: require('../../../assets/icons/slime-war/card/card_7_2.png'),
  46: require('../../../assets/icons/slime-war/card/card_7_2.png'),
  47: require('../../../assets/icons/slime-war/card/card_7_3.png'),
  48: require('../../../assets/icons/slime-war/card/card_7_3.png'),
};

// 카드 ID로 이미지 경로 반환
const getCardImageSource = (cardId: number) => {
  return cardImageMap[cardId] ?? null;
};

const getSlimeImage = (colorType: number) => {
  if (colorType === 0) return require('../../../assets/icons/slime-war/common/blue_slime.png');
  if (colorType === 1) return require('../../../assets/icons/slime-war/common/red_slime.png');
  return null;
};

const SlimeWarScreen: React.FC = observer(() => {
  const [isCardSelectMode, setIsCardSelectMode] = React.useState<null | 'HERO' | 'MOVE'>(null);
  const [isMoveMode, setIsMoveMode] = useState(false);
  const [systemMessage, setSystemMessage] = useState<string>('');
  // kingIndex를 mobx 상태에서 가져옴
  const kingIndex = slimeWarViewModel.kingIndex;
  // 본인/상대방 카드 mobx 상태에서 가져오기
  const playerHand = slimeWarViewModel.cardList;
  const opponentHand = slimeWarViewModel.opponentCardList;
  const heroCount = slimeWarViewModel.hero ?? 0;
  const [timer, setTimer] = useState(TURN_TIME);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  // 매 턴마다 타이머 리셋 및 타임아웃 처리
  useEffect(() => {
    if (!slimeWarViewModel.isMyTurn) {
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
          slimeWarWebSocketService.sendTimeoutEvent();
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
  }, [slimeWarViewModel.isMyTurn]);

  //라운드가 변경될 떄마다 누구차례인지 체크
  useEffect(() => {
    if (slimeWarViewModel.round % 2 === 0) {
      slimeWarViewModel.setIsMyTurn(true);
    } else {
      slimeWarViewModel.setIsMyTurn(false);
    }
  }, [slimeWarViewModel.round]);
  // 9x9 격자를 생성하는 함수
  const renderGrid = () => {
    let rows = [];
    for (let row = 1; row <= GRID_SIZE; row++) {
      let cells = [];
      for (let col = 1; col <= GRID_SIZE; col++) {
        // kingIndex를 (x, y)로 변환
        let kingX = slimeWarViewModel.kingIndex % GRID_SIZE;
        let kingY = Math.floor(slimeWarViewModel.kingIndex / GRID_SIZE);
        if (kingX === 0) {
          kingX = GRID_SIZE;
          kingY -= 1;
        }
        const isKing = kingX === col && kingY === row;
        const userId = slimeWarViewModel.gameMap[col][row];
        let slimeImage = null;
        let slimeColorType = null;
        if (userId === slimeWarViewModel.userID) {
          slimeColorType = slimeWarViewModel.userColorType;
        } else if (userId === slimeWarViewModel.opponentID) {
          slimeColorType = slimeWarViewModel.opponentColorType;
        }

        if (userId !== 0) {
          console.log("userId", userId);
          console.log(slimeWarViewModel.userID);
          console.log("slimeColorType", slimeWarViewModel.userColorType);
          slimeImage = getSlimeImage(slimeColorType ?? 0);
        }
        cells.push(
          <View key={`cell-${col}-${row}`} style={styles.cell}>
            {isKing && (
              <>
                {slimeImage && (
                  <Image source={slimeImage} style={{ width: 32, height: 32, position: 'absolute' }} />
                )}
                <Image source={require('../../../assets/icons/slime-war/common/crown.png')} style={{ width: 24, height: 16, position: 'absolute', top: -8, left: 4 }} />
              </>
            )}
            {!isKing && slimeImage && (
              <Image source={slimeImage} style={{ width: 32, height: 32 }} />
            )}
          </View>
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

  const handleGetCard = () => {
    if (!slimeWarViewModel.isMyTurn) {
      setSystemMessage('지금은 당신의 턴이 아닙니다.');
      return;
    }
    
    if (slimeWarViewModel.cardList.length >= 5) {
      setSystemMessage('카드가 5장 이상 있어 더 이상 카드를 가져올 수 없습니다.');
      return;
    }
    
    try {
      (slimeWarWebSocketService as any).sendGetCardEvent();
      setSystemMessage('카드를 가져오는 중입니다...');
    } catch (error) {
      setSystemMessage('카드를 가져오는데 실패했습니다.');
      console.error('Error in handleGetCard:', error);
    }
  };
  
  const handleHero = () => {
    if (!slimeWarViewModel.isMyTurn) {
      setSystemMessage('지금은 당신의 턴이 아닙니다.');
      return;
    }
    
    const directionMap: { [key: number]: [number, number] } = {
      0: [-1, -1],
      1: [0, -1],
      2: [1, -1],
      3: [-1, 0],
      4: [1, 0],
      5: [-1, 1],
      6: [0, 1],
      7: [1, 1],
    };
    const validHeroCards = playerHand.filter((card: { direction: number; move: number }) => {
      const { direction, move } = card;
      const vector = directionMap[direction];
      if (!vector) return false;
      const currentIndex = slimeWarViewModel.kingIndex;
      const currentX = currentIndex % GRID_SIZE ;
      const currentY = Math.floor(currentIndex / GRID_SIZE );
      const newX = currentX + vector[0] * move;
      const newY = currentY + vector[1] * move;
      if (newX < 1  || newX > GRID_SIZE || newY < 1 || newY > GRID_SIZE) return false;
      const targetCellValue = slimeWarViewModel.gameMap[newY][newX];
      return targetCellValue === slimeWarViewModel.opponentID;
    });
    if (validHeroCards.length < 1) {
      setSystemMessage('영웅 행동을 할 수 있는 카드가 없습니다.');
      return;
    }
    setSystemMessage('영웅 행동 모드가 활성화되었습니다. 카드를 선택하세요.');
    setIsCardSelectMode('HERO');
  };
  
  const handleMove = () => {
    if (!slimeWarViewModel.isMyTurn) {
      setSystemMessage('지금은 당신의 턴이 아닙니다.');
      return;
    }
    
    setSystemMessage('이동 모드가 활성화되었습니다. 카드를 선택하세요.');
    setIsMoveMode(true);
  };
  
  const handlePass = () => {
    if (!slimeWarViewModel.isMyTurn) {
      setSystemMessage('지금은 당신의 턴이 아닙니다.');
      return;
    }
    
    setSystemMessage('턴을 패스합니다.');
    slimeWarWebSocketService.sendNextRoundEvent();
  };
  // 카드 클릭 핸들러
  const handleCardPress = (card: number) => {
    // Proceed only if either move mode or hero mode is active
    if (!isMoveMode && isCardSelectMode !== 'HERO') return;

    const cardInfo = cardData.find((c: { id: number }) => c.id === card);
    if (!cardInfo) {
      Alert.alert('오류', '유효하지 않은 카드입니다.');
      return;
    }

    const directionMap: { [key: number]: [number, number] } = {
      0: [-1, -1],
      1: [0, -1],
      2: [1, -1],
      3: [-1, 0],
      4: [1, 0],
      5: [-1, 1],
      6: [0, 1],
      7: [1, 1],
    };
    const vector = directionMap[cardInfo.direction];
    if (!vector) {
      Alert.alert('오류', '유효하지 않은 방향입니다.');
      setIsMoveMode(false);
      setIsCardSelectMode(null);
      return;
    }

    let currentIndex = slimeWarViewModel.kingIndex;
    let currentX = currentIndex % GRID_SIZE;
    let currentY = Math.floor(currentIndex / GRID_SIZE);
    if (currentX === 0) {
      currentX = GRID_SIZE;
      currentY -= 1;
    }
    let newX = currentX + (vector[0] * cardInfo.move);
    let newY = currentY + (vector[1] * cardInfo.move);
    // Check boundaries
    if (newX < 1 || newX > GRID_SIZE || newY < 1 || newY > GRID_SIZE) {
      setSystemMessage('사용 불가능한 카드입니다.');
      return;
    } else {
      const newIndex = newY * GRID_SIZE + newX; // 왕 좌표
      const targetCellValue = slimeWarViewModel.gameMap[newX][newY];
      if (isMoveMode) {
        // Move mode: allow move only if target cell is empty (0)
        if (targetCellValue !== 0) {
          setSystemMessage('사용 불가능한 카드입니다.');
          return;
        } else {

          slimeWarWebSocketService.sendMoveEvent(cardInfo.id, newIndex);
          slimeWarViewModel.setKingIndex(newIndex);
        }
        setIsMoveMode(false);
      } else if (isCardSelectMode === 'HERO') {
        // Hero mode: allow action only if target cell contains opponent's slime
        if (targetCellValue !== slimeWarViewModel.opponentID) {
          Alert.alert('영웅 행동 불가', '상대 슬라임이 존재하지 않습니다.');
        } else {
          // Remove the opponent slime and place player's slime
          slimeWarViewModel.gameMap[newX][newY] = slimeWarViewModel.userID;
          slimeWarWebSocketService.sendHeroEvent(cardInfo.id, newIndex);
          slimeWarViewModel.setKingIndex(newIndex);
        }
        setIsCardSelectMode(null);
      }
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/icons/slime-war/common/background.png')}
      style={{ flex: 1, width: '100%', height: '100%' }}
      resizeMode="cover"
    >
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
        <SlimeWarMultiHeader />
        <Text style={styles.title}>슬라임 전쟁</Text>
        
        {/* 타이머 바 */}
        <View style={{ marginHorizontal: 16, marginBottom: 8 }}>
          <View style={{ height: 16, backgroundColor: '#eee', borderRadius: 8, overflow: 'hidden' }}>
            <View style={{ width: `${(timer / TURN_TIME) * 100}%`, height: '100%', backgroundColor: timer <= 5 ? '#e74c3c' : '#4CAF50' }} />
          </View>
          <Text style={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', top: 0, fontSize: 12, color: '#333' }}>{timer}s</Text>
        </View>
        
        {/* 9x9 격자 */}
        <View style={styles.boardContainer}>
          {renderGrid()}
        </View>
        
        {/* 패 영역 */}
        <View style={styles.handsContainer}>
          {/* 상단: 남은 슬라임, 상대방 카드, 상대방 히어로 */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 }}>
            {/* 남은 슬라임수 */}
            <View style={{ alignItems: 'center', marginRight: 12 }}>
              <Image source={require('../../../assets/icons/slime-war/common/rest_slime.png')} style={{ width: 36, height: 36 }} />
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 2 }}>
                x {slimeWarViewModel.remainingSlime}
              </Text>
            </View>
            {/* 상대방 카드 스크롤 */}
            <ScrollView
              horizontal
              contentContainerStyle={[styles.handScrollView, { flexGrow: 1 }]}
              showsHorizontalScrollIndicator={false}
              style={{ flex: 1 }}
            >
              {opponentHand.map((item, index) => (
                <View key={`opponent-card-${item.id ?? index}`} style={styles.card}>
                  <Image
                    source={getCardImageSource(item.id ?? item)}
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                </View>
              ))}
            </ScrollView>
            {/* 상대방 히어로 카드 */}
            <View style={[styles.card, { marginLeft: 12, alignItems: 'center', justifyContent: 'center' }]}>
              <Image
                source={slimeWarViewModel.opponentColorType === 0 ? require('../../../assets/icons/slime-war/common/hero_blue.png') : require('../../../assets/icons/slime-war/common/hero_red.png')}
                style={styles.cardImage}
                resizeMode="contain"
              />
              <Text style={{
                position: 'absolute',
                right: 8,
                top: 4,
                fontSize: 16,
                fontWeight: 'bold',
                color: '#333',
                backgroundColor: 'rgba(255,255,255,0.7)',
                borderRadius: 8,
                paddingHorizontal: 4,
              }}>
                {slimeWarViewModel.opponentHeroCount ?? 0}
              </Text>
            </View>
          </View>

          {/* 하단: 내 카드, 내 히어로 */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 }}>
            {/* 내 카드 스크롤 */}
            <ScrollView
              horizontal
              contentContainerStyle={[styles.handScrollView, { flexGrow: 1 }]}
              showsHorizontalScrollIndicator={false}
              style={{ flex: 1 }}
            >
              {playerHand.map((item, index) => (
                <TouchableOpacity
                  key={`player-card-${item.id ?? index}`}
                  onPress={() => handleCardPress(item)}
                  disabled={!(slimeWarViewModel.isMyTurn && (isMoveMode || isCardSelectMode === 'HERO')) || (item.isUsable !== undefined && !item.isUsable)}
                  style={[
                    styles.card,
                    (isMoveMode || isCardSelectMode === 'HERO') && (item.isUsable === undefined || item.isUsable) && { borderColor: '#4CAF50', borderWidth: 2 }
                  ]}
                >
                  <Image
                    source={getCardImageSource(item.id ?? item)}
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
            {/* 내 히어로 카드 */}
            <View style={[styles.card, { marginLeft: 12, alignItems: 'center', justifyContent: 'center' }]}>
              <Image
                source={slimeWarViewModel.userColorType === 0 ? require('../../../assets/icons/slime-war/common/hero_blue.png') : require('../../../assets/icons/slime-war/common/hero_red.png')}
                style={styles.cardImage}
                resizeMode="contain"
              />
              <Text style={{
                position: 'absolute',
                right: 8,
                top: 4,
                fontSize: 16,
                fontWeight: 'bold',
                color: '#333',
                backgroundColor: 'rgba(255,255,255,0.7)',
                borderRadius: 8,
                paddingHorizontal: 4,
              }}>
                {slimeWarViewModel.userHeroCount ?? 0}
              </Text>
            </View>
          </View>
        </View>
        
        {/* 버튼 영역 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, !slimeWarViewModel.isMyTurn && { opacity: 0.5 }]} 
            onPress={handleGetCard} 
            disabled={!slimeWarViewModel.isMyTurn}
          >
            <Text style={[styles.buttonText, !slimeWarViewModel.isMyTurn && { color: '#999999' }]}>더미</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, !slimeWarViewModel.isMyTurn && { opacity: 0.5 }]} 
            onPress={handleHero} 
            disabled={!slimeWarViewModel.isMyTurn}
          >
            <Text style={[styles.buttonText, !slimeWarViewModel.isMyTurn && { color: '#999999' }]}>흡수</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, !slimeWarViewModel.isMyTurn && { opacity: 0.5 }]} 
            onPress={handleMove} 
            disabled={!slimeWarViewModel.isMyTurn}
          >
            <Text style={[styles.buttonText, !slimeWarViewModel.isMyTurn && { color: '#999999' }]}>이동</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, !slimeWarViewModel.isMyTurn && { opacity: 0.5 }]} 
            onPress={handlePass} 
            disabled={!slimeWarViewModel.isMyTurn}
          >
            <Text style={[styles.buttonText, !slimeWarViewModel.isMyTurn && { color: '#999999' }]}>패스</Text>
          </TouchableOpacity>
        </View>

        {systemMessage ? (
          <SystemMessage message={systemMessage} onHide={() => setSystemMessage('')} />
        ) : null}

        {/* 턴 상태 표시 */}
        <View style={styles.turnIndicator}>
          <Text style={styles.turnText}>
            {slimeWarViewModel.isMyTurn ? '내 턴입니다' : '상대방 턴입니다'}
          </Text>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
});

export default SlimeWarScreen;
