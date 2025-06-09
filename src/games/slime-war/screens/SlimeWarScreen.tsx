import SystemMessage from '../../../components/common/SystemMessage';
import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert, Image, ImageBackground, BackHandler, Modal, StyleSheet } from 'react-native';
import baseStyles from '../styles/SlimeWarStyles';
import { slimeWarService } from '../services/SlimeWarService';
import { slimeWarWebSocketService } from '../services/SlimeWarWebsocketService';
import { observer } from 'mobx-react-lite';
import { slimeWarViewModel } from '../services/SlimeWarViewModel';
import SlimeWarMultiHeader from '../../../components/SlimeWarMultiHeader';
import cardData from '../../../assets/data/cards.json';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/navigationTypes';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const GRID_SIZE = 9; // 0~8까지 9칸

const TURN_TIME = 30; // 턴당 제한 시간(초)

// 카드 이미지 매핑 (id: require)
const cardImageMap: { [key: number]: any } = {
  1: require('../../../assets/icons/slime-war/card/card01.png'),
  2: require('../../../assets/icons/slime-war/card/card01.png'),
  3: require('../../../assets/icons/slime-war/card/card02.png'),
  4: require('../../../assets/icons/slime-war/card/card02.png'),
  5: require('../../../assets/icons/slime-war/card/card03.png'),
  6: require('../../../assets/icons/slime-war/card/card03.png'),
  7: require('../../../assets/icons/slime-war/card/card11.png'),
  8: require('../../../assets/icons/slime-war/card/card11.png'),
  9: require('../../../assets/icons/slime-war/card/card12.png'),
  10: require('../../../assets/icons/slime-war/card/card12.png'),
  11: require('../../../assets/icons/slime-war/card/card13.png'),
  12: require('../../../assets/icons/slime-war/card/card13.png'),
  13: require('../../../assets/icons/slime-war/card/card21.png'),
  14: require('../../../assets/icons/slime-war/card/card21.png'),
  15: require('../../../assets/icons/slime-war/card/card22.png'),
  16: require('../../../assets/icons/slime-war/card/card22.png'),
  17: require('../../../assets/icons/slime-war/card/card23.png'),
  18: require('../../../assets/icons/slime-war/card/card23.png'),
  19: require('../../../assets/icons/slime-war/card/card31.png'),
  20: require('../../../assets/icons/slime-war/card/card31.png'),
  21: require('../../../assets/icons/slime-war/card/card32.png'),
  22: require('../../../assets/icons/slime-war/card/card32.png'),
  23: require('../../../assets/icons/slime-war/card/card33.png'),
  24: require('../../../assets/icons/slime-war/card/card33.png'),
  25: require('../../../assets/icons/slime-war/card/card41.png'),
  26: require('../../../assets/icons/slime-war/card/card41.png'),
  27: require('../../../assets/icons/slime-war/card/card42.png'),
  28: require('../../../assets/icons/slime-war/card/card42.png'),
  29: require('../../../assets/icons/slime-war/card/card43.png'),
  30: require('../../../assets/icons/slime-war/card/card43.png'),
  31: require('../../../assets/icons/slime-war/card/card51.png'),
  32: require('../../../assets/icons/slime-war/card/card51.png'),
  33: require('../../../assets/icons/slime-war/card/card52.png'),
  34: require('../../../assets/icons/slime-war/card/card52.png'),
  35: require('../../../assets/icons/slime-war/card/card53.png'),
  36: require('../../../assets/icons/slime-war/card/card53.png'),
  37: require('../../../assets/icons/slime-war/card/card61.png'),
  38: require('../../../assets/icons/slime-war/card/card61.png'),
  39: require('../../../assets/icons/slime-war/card/card62.png'),
  40: require('../../../assets/icons/slime-war/card/card62.png'),
  41: require('../../../assets/icons/slime-war/card/card63.png'),
  42: require('../../../assets/icons/slime-war/card/card63.png'),
  43: require('../../../assets/icons/slime-war/card/card71.png'),
  44: require('../../../assets/icons/slime-war/card/card71.png'),
  45: require('../../../assets/icons/slime-war/card/card72.png'),
  46: require('../../../assets/icons/slime-war/card/card72.png'),
  47: require('../../../assets/icons/slime-war/card/card73.png'),
  48: require('../../../assets/icons/slime-war/card/card73.png'),
};

// 카드 ID로 이미지 경로 반환
const getCardImageSource = (cardId: number) => {
  return cardImageMap[cardId] ?? null;
};

const getSlimeImage = (colorType: number) => {
  // 20% 확률로 액션 슬라임
  if (colorType === 0) {
    return require('../../../assets/icons/slime-war/common/blue_slime.png');
  }
  if (colorType === 1) {
    return require('../../../assets/icons/slime-war/common/red_slime.png');
  }
  return null;
};

const SlimeWarScreen: React.FC = observer(() => {
  const [isCardSelectMode, setIsCardSelectMode] = React.useState<null | 'HERO' | 'MOVE'>(null);
  const [isMoveMode, setIsMoveMode] = useState(false);
  const [systemMessage, setSystemMessage] = useState<string>('');
  // kingIndex를 mobx 상태에서 가져옴
  // 본인/상대방 카드 mobx 상태에서 가져오기
  const playerHand = slimeWarViewModel.cardList;
  const opponentHand = slimeWarViewModel.opponentCardList;
  const [timer, setTimer] = useState(TURN_TIME);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const [buttonCooldown, setButtonCooldown] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  // 타이머 관련 useEffect만 남기고, 타이머 UI는 삭제
  useEffect(() => {
    setTimer(TURN_TIME);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          if (slimeWarViewModel.isMyTurn) {
            slimeWarWebSocketService.sendTimeoutEvent();
          }
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
    if (slimeWarViewModel.myTurn === (slimeWarViewModel.round % 2)) {
      slimeWarViewModel.setIsMyTurn(true);
    } else {
      slimeWarViewModel.setIsMyTurn(false);
    }
  }, [slimeWarViewModel.round]);


  // 이동 가능한 카드 목록 계산
  const movableCards = React.useMemo(() => {
    if (!slimeWarViewModel.isMyTurn) return [];
    
    const directionMap: { [key: number]: [number, number] } = {
      0: [-1, -1], 1: [0, -1], 2: [1, -1],
      3: [-1, 0],  4: [1, 0],
      5: [-1, 1],  6: [0, 1],  7: [1, 1],
    };

    return playerHand.filter((cardId: number) => {
      const cardInfo = cardData.find((c: any) => c.id === cardId);
      if (!cardInfo) return false;
      
      const { direction, move } = cardInfo;
      const vector = directionMap[direction];
      if (!vector) return false;
      
      const currentIndex = slimeWarViewModel.kingIndex;
      let currentX = currentIndex % GRID_SIZE;
      let currentY = Math.floor(currentIndex / GRID_SIZE);
      if (currentX === 0) {
        currentX = GRID_SIZE;
        currentY -= 1;
      }

      const newX = currentX + (vector[0] * move);
      const newY = currentY + (vector[1] * move);
      
      if (newX < 1 || newX > GRID_SIZE || newY < 1 || newY > GRID_SIZE) return false;
      const targetCellValue = slimeWarViewModel.gameMap[newX][newY];
      return targetCellValue === 0; // 빈 칸인 경우만 이동 가능
    });
  }, [playerHand, slimeWarViewModel.isMyTurn, slimeWarViewModel.kingIndex, slimeWarViewModel.gameMap]);

  // 흡수 가능한 카드 목록 계산
  const heroCards = React.useMemo(() => {
    // 내 턴이 아니거나 히어로 카드가 없으면 빈 배열 반환
    if (!slimeWarViewModel.isMyTurn || (slimeWarViewModel.userHeroCount ?? 0) <= 0) return [];
    
    const directionMap: { [key: number]: [number, number] } = {
      0: [-1, -1], 1: [0, -1], 2: [1, -1],
      3: [-1, 0],  4: [1, 0],
      5: [-1, 1],  6: [0, 1],  7: [1, 1],
    };

    return playerHand.filter((cardId: number) => {
      const cardInfo = cardData.find((c: any) => c.id === cardId);
      if (!cardInfo) return false;
      
      const { direction, move } = cardInfo;
      const vector = directionMap[direction];
      if (!vector) return false;
      
      const currentIndex = slimeWarViewModel.kingIndex;
      let currentX = currentIndex % GRID_SIZE;
      let currentY = Math.floor(currentIndex / GRID_SIZE);
      if (currentX === 0) {
        currentX = GRID_SIZE;
        currentY -= 1;
      }

      const newX = currentX + (vector[0] * move);
      const newY = currentY + (vector[1] * move);
      
      if (newX < 1 || newX > GRID_SIZE || newY < 1 || newY > GRID_SIZE) return false;
      const targetCellValue = slimeWarViewModel.gameMap[newX][newY];
      return targetCellValue === slimeWarViewModel.opponentID;
    });
  }, [playerHand, slimeWarViewModel.isMyTurn, slimeWarViewModel.userHeroCount, slimeWarViewModel.kingIndex, slimeWarViewModel.gameMap, slimeWarViewModel.opponentID]);

  // 더미(카드 뽑기) 가능 여부
  const canDrawCard = React.useMemo(() => {
    return slimeWarViewModel.isMyTurn && playerHand.length < 5;
  }, [playerHand.length, slimeWarViewModel.isMyTurn]);

  // 자기 턴에 모든 버튼이 비활성화라면 자동 턴 넘김
  useEffect(() => {
    if (
      slimeWarViewModel.isMyTurn &&
      !canDrawCard &&
      !movableCards.length &&
      !heroCards.length
    ) {
      setSystemMessage('할 수 있는 행동이 없습니다. 상대방에게 턴을 넘깁니다.');
      slimeWarWebSocketService.sendNextRoundEvent(slimeWarViewModel.opponentCanMove);
    }
  }, [slimeWarViewModel.isMyTurn, canDrawCard, movableCards.length, heroCards.length]);

  // 백키 완전 차단
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        // 항상 true를 반환하여 백키 이벤트를 완전히 차단
        return true;
      }
    );

    // 컴포넌트가 언마운트될 때 이벤트 리스너 제거
    return () => backHandler.remove();
  }, []); // 의존성 배열이 비어있으므로 컴포넌트 마운트 시 한 번만 실행

  useEffect(() => {

  }, [slimeWarViewModel.round]);

  // 9x9 격자를 생성하는 함수
  const renderGrid = () => {
    let rows = [];
    for (let row = 1; row <= GRID_SIZE; row++) {
      let cells = [];
      for (let col = 1; col <= GRID_SIZE; col++) {
        // 홀짝 판별
        const isEven = (row + col) % 2 === 0;
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
          slimeImage = getSlimeImage(slimeColorType ?? 0);
        }
        cells.push(
          <View
            key={`cell-${col}-${row}`}
            style={[
              isEven ? baseStyles.cellEven : baseStyles.cellOdd,
              isKing && baseStyles.kingCell
            ]}
          >
            {isKing && (
              <>
                {slimeImage && (
                  <Image
                    source={slimeImage}
                    style={{ width: 32, height: 32, position: 'absolute' }}
                  />
                )}
                <Image
                  source={require('../../../assets/icons/slime-war/common/crown.png')}
                  style={{ width: 24, height: 18, position: 'absolute', top: -8, left: 4, zIndex: 10, overflow: 'visible'}}
                />
              </>
            )}
            {!isKing && slimeImage && (
              <Image source={slimeImage} style={{ width: 32, height: 32 }} />
            )}
          </View>
        );
      }
      rows.push(
        <View key={`row-${row}`} style={baseStyles.row}>
          {cells}
        </View>
      );
    }
    return rows;
  };

  const handleGetCard = () => {
    if (buttonCooldown) return;
    setButtonCooldown(true);
    setTimeout(() => setButtonCooldown(false), 1000);
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
  
  // 카드 클릭 핸들러 수정
  const handleCardPress = (cardId: number) => {
    if (!slimeWarViewModel.isMyTurn) return;
    // 이동 모드이거나 이동 가능한 카드인 경우
    if (movableCards.includes(cardId)) {
      const cardInfo = cardData.find((c: any) => c.id === cardId);
      if (!cardInfo) return;

      const directionMap: { [key: number]: [number, number] } = {
        0: [-1, -1], 1: [0, -1], 2: [1, -1],
        3: [-1, 0],  4: [1, 0],
        5: [-1, 1],  6: [0, 1],  7: [1, 1],
      };

      const vector = directionMap[cardInfo.direction];
      if (!vector) return;

      const currentIndex = slimeWarViewModel.kingIndex;
      let currentX = currentIndex % GRID_SIZE;
      let currentY = Math.floor(currentIndex / GRID_SIZE);
      if (currentX === 0) {
        currentX = GRID_SIZE;
        currentY -= 1;
      }
      const newX = currentX + (vector[0] * cardInfo.move);
      const newY = currentY + (vector[1] * cardInfo.move);
      if (newX < 1 || newX > GRID_SIZE || newY < 1 || newY > GRID_SIZE) {
        setSystemMessage('이동할 수 없는 위치입니다.');
        return;
      }

      const targetCellValue = slimeWarViewModel.gameMap[newX][newY];
      if (targetCellValue !== 0) {
        setSystemMessage('이미 슬라임이 있는 위치입니다.');
        return;
      }

      let newIndex = newY * GRID_SIZE + newX;
      slimeWarWebSocketService.sendMoveEvent(cardId, newIndex);
      slimeWarViewModel.setKingIndex(newIndex);
      setIsMoveMode(false);
    } else if ( heroCards.includes(cardId)) {
      const cardInfo = cardData.find((c: any) => c.id === cardId);
      if (!cardInfo) return;

      const directionMap: { [key: number]: [number, number] } = {
        0: [-1, -1], 1: [0, -1], 2: [1, -1],
        3: [-1, 0], 4: [1, 0],
        5: [-1, 1], 6: [0, 1], 7: [1, 1],
      };

      const vector = directionMap[cardInfo.direction];
      if (!vector) return;

      const currentIndex = slimeWarViewModel.kingIndex;
      let currentX = currentIndex % GRID_SIZE;
      let currentY = Math.floor(currentIndex / GRID_SIZE);
      if (currentX === 0) {
        currentX = GRID_SIZE;
        currentY -= 1;
      }
      const newX = currentX + (vector[0] * cardInfo.move);
      const newY = currentY + (vector[1] * cardInfo.move);

      if (newX < 1 || newX > GRID_SIZE || newY < 1 || newY > GRID_SIZE) {
        setSystemMessage('이동할 수 없는 위치입니다.');
        return;
      }

      let newIndex = newY * 9 + newX;
      slimeWarWebSocketService.sendHeroEvent(cardId, newIndex);
      slimeWarViewModel.setKingIndex(newIndex);
      setIsMoveMode(false);
    }
  };

  const handleGoToResult = () => {
    if (slimeWarViewModel.gameResult) {
      navigation.navigate('SlimeWarResult', slimeWarViewModel.gameResult);
      slimeWarViewModel.resetGameOver();
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/icons/slime-war/common/background.png')}
      style={baseStyles.container}
      resizeMode="cover"
    >
      <SafeAreaView style={[baseStyles.container, { backgroundColor: 'transparent' }]}>
        {/* 헤더에 timer 전달 */}
        <SlimeWarMultiHeader timer={timer} />

        {/* 나무 + 격자 */}
        <View style={baseStyles.topContainer}>
          
          <Image
            source={require('../../../assets/icons/slime-war/common/background_tree.png')}
            style={baseStyles.treeImage}
          />
          
          <View style={baseStyles.boardContainer}>
            {renderGrid()}
          </View>
        </View>
        
        {/* 패 영역 */}
        <View style={baseStyles.handsContainer}>
          {/* 상단: 남은 슬라임, 상대방 카드, 상대방 히어로 */}
          <View style={baseStyles.opponentHandContainer}>
            {/* 남은 슬라임수 */}
            <View style={{ alignItems: 'center', marginRight: 12 }}>
              <Image source={require('../../../assets/icons/slime-war/common/rest_slime.png')} style={{ width: 36, height: 36 }} />
              <Text style={baseStyles.restSlimeText}>
                x {slimeWarViewModel.remainingSlime}
              </Text>
            </View>
            {/* 상대방 카드 스크롤 */}
            <ScrollView
              horizontal
              contentContainerStyle={[baseStyles.handScrollView, { flexGrow: 1 }]}
              showsHorizontalScrollIndicator={false}
              style={{ flex: 1 }}
            >
              {opponentHand.map((item, index) => (
                <View key={`opponent-card-${item.id ?? index}`} style={baseStyles.opponentCard}>
                  <Image
                    source={getCardImageSource(item.id ?? item)}
                    style={baseStyles.opponentCardImage}
                    resizeMode="contain"
                  />
                </View>
              ))}
              {/* 상대방 히어로 카드 */}
              <View style={[baseStyles.opponentCard, baseStyles.heroCardContainer]}>
                <Image
                  source={slimeWarViewModel.opponentColorType === 0 ? require('../../../assets/icons/slime-war/common/hero_blue.png') : require('../../../assets/icons/slime-war/common/hero_red.png')}
                  style={baseStyles.cardImage}
                  resizeMode="contain"
                />
                <Text style={baseStyles.heroCardText}>
                  {slimeWarViewModel.opponentHeroCount ?? 0}
                </Text>
              </View>
            </ScrollView>
          </View>

          {/* 하단: 내 카드, 내 히어로 */}
          <View style={baseStyles.userHandContainer}>
            {/* 내 카드 스크롤 */}
            <ScrollView
              horizontal
              contentContainerStyle={[baseStyles.handScrollView, { flexGrow: 1 }]}
              showsHorizontalScrollIndicator={false}
              style={{ flex: 1 }}
            >
              {playerHand.map((cardId, index) => (
                <TouchableOpacity
                  key={`player-card-${cardId}`}
                  onPress={() => handleCardPress(cardId)}
                  disabled={!slimeWarViewModel.isMyTurn}
                  style={[
                    baseStyles.card,
                    movableCards.includes(cardId) && baseStyles.movableCard,
                    heroCards.includes(cardId) && baseStyles.heroCard,
                    isMoveMode && baseStyles.moveModeCard,
                    isCardSelectMode === 'HERO' && baseStyles.heroModeCard,
                  ]}
                >
                  <Image
                    source={getCardImageSource(cardId)}
                    style={baseStyles.cardImage}
                    resizeMode="contain"
                  />
                  {movableCards.includes(cardId) && (
                    <View style={baseStyles.movableIndicator}>
                      <Text style={baseStyles.movableText}>이동 가능</Text>
                    </View>
                  )}
                  {heroCards.includes(cardId) && (slimeWarViewModel.userHeroCount ?? 0) > 0 && (
                    <View style={baseStyles.heroIndicator}>
                      <Text style={baseStyles.heroText}>흡수 가능</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            {/* 내 히어로 카드 */}
            <View style={[baseStyles.card, baseStyles.heroCardContainer]}>
              <Image
                source={slimeWarViewModel.userColorType === 0 ? require('../../../assets/icons/slime-war/common/hero_blue.png') : require('../../../assets/icons/slime-war/common/hero_red.png')}
                style={baseStyles.cardImage}
                resizeMode="contain"
              />
              <Text style={baseStyles.heroCardText}>
                {slimeWarViewModel.userHeroCount ?? 0}
              </Text>
            </View>
          </View>
        </View>
        
        {/* 버튼 영역 */}
        <View style={baseStyles.buttonContainer}>
          <TouchableOpacity
            style={[baseStyles.button, !canDrawCard && { opacity: 0.5 }]}
            onPress={handleGetCard}
            disabled={!canDrawCard}
          >
            <Text style={[baseStyles.buttonText, !canDrawCard && { color: '#999999' }]}>더미</Text>
          </TouchableOpacity>
        </View>

        {systemMessage ? (
          <SystemMessage message={systemMessage} onHide={() => setSystemMessage('')} />
        ) : null}

        {/* 턴 상태 표시 */}
        <View style={baseStyles.turnIndicator}>
          <Text style={baseStyles.turnText}>
            {slimeWarViewModel.isMyTurn ? '내 턴입니다' : '상대방 턴입니다'}
          </Text>
        </View>

        {/* 게임 종료 모달 */}
        <Modal
          visible={slimeWarViewModel.isGameOver}
          transparent={true}
          animationType="fade"
        >
          <View style={baseStyles.modalOverlay}>
            <View style={baseStyles.modalContent}>
              <Text style={baseStyles.modalTitle}>
                {slimeWarViewModel.gameResult?.isSuccess ? '승리!' : '패배!'}
              </Text>
              <Text style={baseStyles.modalScore}>
                내 점수: {slimeWarViewModel.gameResult?.myScore}
              </Text>
              <Text style={baseStyles.modalScore}>
                상대방 점수: {slimeWarViewModel.gameResult?.opponentScore}
              </Text>
              <TouchableOpacity
                style={baseStyles.modalButton}
                onPress={handleGoToResult}
              >
                <Text style={baseStyles.modalButtonText}>결과 화면으로 이동</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
});

export default SlimeWarScreen;
