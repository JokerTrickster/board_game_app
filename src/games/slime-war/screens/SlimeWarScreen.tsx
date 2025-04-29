import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import styles from '../styles/SlimeWarStyles';
import { slimeWarService } from '../services/SlimeWarService';
import { slimeWarWebSocketService } from '../services/SlimeWarWebsocketService';
import { observer } from 'mobx-react-lite';
import { slimeWarViewModel } from '../services/SlimeWarViewModel';
const GRID_SIZE = 9;

const SlimeWarScreen: React.FC = observer(() => {
  const [isCardSelectMode, setIsCardSelectMode] = React.useState<null | 'HERO' | 'MOVE'>(null);
  const [isMoveMode, setIsMoveMode] = useState(false);
  // kingIndex를 mobx 상태에서 가져옴
  const kingIndex = slimeWarViewModel.kingIndex;
  const kingRow = kingIndex !== null ? Math.floor(kingIndex /(GRID_SIZE-1)) : null;
  const kingCol = kingIndex !== null ? (kingIndex % (GRID_SIZE-1))-1 : null;
  // 본인/상대방 카드 mobx 상태에서 가져오기
  const playerHand = slimeWarViewModel.cardList;
  const opponentHand = slimeWarViewModel.opponentCardList;

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
    if (slimeWarViewModel.cardList.length >= 5) {
      Alert.alert('카드 제한', '카드가 5장 이상 있습니다.');
      return;
    }
    (slimeWarWebSocketService as any).sendGetCardEvent();
  };
  const handleHero = () => {
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
      Alert.alert('영웅 행동 불가', '영웅 행동을 할 수 있는 카드가 없습니다.');
      return;
    }
    setIsCardSelectMode('HERO');
  };
  const handleMove = () => {
    setIsMoveMode(true);
  };
  const handlePass = () => {
    slimeWarWebSocketService.sendNextRoundEvent();
  };
  // 카드 클릭 핸들러
  const handleCardPress = (card: { id: number, direction: number; move: number; image: string }) => {
    // Proceed only if either move mode or hero mode is active
    if (!isMoveMode && isCardSelectMode !== 'HERO') return;

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
    const vector = directionMap[card.direction];
    if (!vector) {
      Alert.alert('오류', '유효하지 않은 방향입니다.');
      setIsMoveMode(false);
      setIsCardSelectMode(null);
      return;
    }

    const currentIndex = slimeWarViewModel.kingIndex;
    const currentX = currentIndex % GRID_SIZE;
    const currentY = Math.floor(currentIndex / GRID_SIZE);
    const newX = currentX + vector[0] * card.move;
    const newY = currentY + vector[1] * card.move;

    // Check boundaries
    if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
      Alert.alert('이동 불가', '해당 카드로는 이동할 수 없습니다.');
    } else {
      const targetCellValue = slimeWarViewModel.gameMap[newY][newX];
      if (isMoveMode) {
        // Move mode: allow move only if target cell is empty (0)
        if (targetCellValue !== 0) {
          Alert.alert('이동 불가', '빈 공간이 아닙니다.');
        } else {
          const newIndex = newY * GRID_SIZE + newX;
          slimeWarWebSocketService.sendMoveEvent(card.id);
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
          slimeWarWebSocketService.sendHeroEvent(card.id);
          slimeWarViewModel.setKingIndex(newIndex);
        }
        setIsCardSelectMode(null);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>슬라임 전쟁</Text>
      
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
          <Text style={styles.handTitle}>본인 패</Text>
          <ScrollView horizontal contentContainerStyle={styles.handScrollView} showsHorizontalScrollIndicator={false}>
            {playerHand.map((item, index) => (
              <TouchableOpacity
                key={`player-card-${item.id ?? index}`}
                onPress={() => handleCardPress(item)}
                disabled={!(isMoveMode || isCardSelectMode === 'HERO') || (item.isUsable !== undefined && !item.isUsable)}
                style={[styles.card, (isMoveMode || isCardSelectMode === 'HERO') && (item.isUsable === undefined || item.isUsable) && { borderColor: '#4CAF50', borderWidth: 2 }]}
              >
                <Text style={styles.cardText}>P{item.id ?? item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
      
      {/* 버튼 영역 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleGetCard}>
          <Text style={styles.buttonText}>더미</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleHero}>
          <Text style={styles.buttonText}>흡수</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleMove}>
          <Text style={styles.buttonText}>이동</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handlePass}>
          <Text style={styles.buttonText}>패스</Text>
        </TouchableOpacity>
      </View>

      {/* Render owned cards (assumed to be in slimeWarViewModel.cardList) */}
      <View style={styles.cardContainer}>
        {slimeWarViewModel.cardList.map((card: { id: number, direction: number; move: number; image: string }, index: number) => (
          <TouchableOpacity
            key={index}
            style={styles.cardItem}
            onPress={() => handleCardPress(card)}
          >
            <Image source={{ uri: card.image }} style={styles.cardImage} />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
});

export default SlimeWarScreen;
