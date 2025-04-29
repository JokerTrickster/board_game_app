import SystemMessage from '../../../components/common/SystemMessage';
import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import styles from '../styles/SlimeWarStyles';
import { slimeWarService } from '../services/SlimeWarService';
import { slimeWarWebSocketService } from '../services/SlimeWarWebsocketService';
import { observer } from 'mobx-react-lite';
import { slimeWarViewModel } from '../services/SlimeWarViewModel';
import SlimeWarMultiHeader from '../../../components/SlimeWarMultiHeader';
import cardData from '../../../assets/data/cards.json';
const GRID_SIZE = 9;

const TURN_TIME = 30; // 턴당 제한 시간(초)

const SlimeWarScreen: React.FC = observer(() => {
  const [isCardSelectMode, setIsCardSelectMode] = React.useState<null | 'HERO' | 'MOVE'>(null);
  const [isMoveMode, setIsMoveMode] = useState(false);
  const [systemMessage, setSystemMessage] = useState<string>('');
  // kingIndex를 mobx 상태에서 가져옴
  const kingIndex = slimeWarViewModel.kingIndex;
  const kingRow = kingIndex !== null ? Math.floor(kingIndex /(GRID_SIZE-1)) : null;
  const kingCol = kingIndex !== null ? (kingIndex % (GRID_SIZE-1))-1 : null;
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
    for (let row = 0; row < GRID_SIZE; row++) {
      let cells = [];
      for (let col = 0; col < GRID_SIZE; col++) {
        const isKing = kingRow === row && kingCol === col;
        cells.push(
          <View key={`cell-${row}-${col}`} style={styles.cell}>
            {isKing && (
              <View style={styles.kingMark}>
                <Text style={styles.kingMarkText}>K</Text>
              </View>
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
      const currentX = currentIndex % GRID_SIZE;
      const currentY = Math.floor(currentIndex / GRID_SIZE);
      const newX = currentX + vector[0] * move;
      const newY = currentY + vector[1] * move;
      if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) return false;
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
    console.log('cardInfo', cardInfo);

    const GRID_SIZE = 9;
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

    const currentIndex = slimeWarViewModel.kingIndex;
    const currentX = currentIndex % GRID_SIZE;
    const currentY = Math.floor(currentIndex / GRID_SIZE);
    const newX = currentX + vector[0] * cardInfo.move;
    const newY = currentY + vector[1] * cardInfo.move;

    // Check boundaries
    if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
      setSystemMessage('사용 불가능한 카드입니다.');
      return;
    } else {
      const targetCellValue = slimeWarViewModel.gameMap[newY][newX];
      if (isMoveMode) {
        // Move mode: allow move only if target cell is empty (0)
        if (targetCellValue !== 0) {
          setSystemMessage('사용 불가능한 카드입니다.');
          return;
        } else {
          const newIndex = newY * GRID_SIZE + newX;
          slimeWarWebSocketService.sendMoveEvent(cardInfo.id);
          slimeWarViewModel.setKingIndex(newIndex);
        }
        setIsMoveMode(false);
      } else if (isCardSelectMode === 'HERO') {
        // Hero mode: allow action only if target cell contains opponent's slime
        if (targetCellValue !== slimeWarViewModel.opponentID) {
          Alert.alert('영웅 행동 불가', '상대 슬라임이 존재하지 않습니다.');
        } else {
          // Remove the opponent slime and place player's slime
          slimeWarViewModel.gameMap[newY][newX] = slimeWarViewModel.userID;
          const newIndex = newY * GRID_SIZE + newX;
          slimeWarWebSocketService.sendHeroEvent(cardInfo.id);
          slimeWarViewModel.setKingIndex(newIndex);
        }
        setIsCardSelectMode(null);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
        {/* 상대방 패 */}
        <View style={styles.opponentHandContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.remainingSlimeText}>남은 슬라임: {slimeWarViewModel.remainingSlime}</Text>
            <Text style={styles.handTitle}>상대방 패</Text>
          </View>
          <ScrollView horizontal contentContainerStyle={styles.handScrollView} showsHorizontalScrollIndicator={false}>
            {opponentHand.map((item, index) => (
              <View key={`opponent-card-${item.id ?? index}`} style={styles.card}>
                <Text style={styles.cardText}>S{item.id ?? item}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
        {/* 본인 패 */}
        <View style={styles.playerHandContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.handTitle}>본인 패</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, marginRight: 4 }}>🦸</Text>
              <Text style={{ fontSize: 16 }}>{heroCount}</Text>
            </View>
          </View>
          <ScrollView horizontal contentContainerStyle={styles.handScrollView} showsHorizontalScrollIndicator={false}>
            {playerHand.map((item, index) => (
              <TouchableOpacity
                key={`player-card-${item.id ?? index}`}
                onPress={() => handleCardPress(item)}
                disabled={!(slimeWarViewModel.isMyTurn && (isMoveMode || isCardSelectMode === 'HERO')) || (item.isUsable !== undefined && !item.isUsable)}
                style={[styles.card, (isMoveMode || isCardSelectMode === 'HERO') && (item.isUsable === undefined || item.isUsable) && { borderColor: '#4CAF50', borderWidth: 2 }]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={styles.cardText}>P{item.id ?? item}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, marginLeft: 4, color: heroCount > 0 ? '#222' : '#aaa' }}>🦸</Text>
                    <Text style={{ fontSize: 14, color: heroCount > 0 ? '#222' : '#aaa' }}>{heroCount}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
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

      {/* Render owned cards (assumed to be in slimeWarViewModel.cardList) */}
      <View style={styles.cardContainer}>
        {slimeWarViewModel.cardList.map((card: { id: number, direction: number; move: number; image: string }, index: number) => (
          <TouchableOpacity
            key={index}
            style={styles.cardItem}
            onPress={() => handleCardPress(card.id)}
          >
            <Image source={{ uri: card.image }} style={styles.cardImage} />
          </TouchableOpacity>
        ))}
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
  );
});

export default SlimeWarScreen;
