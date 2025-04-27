import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import styles from '../styles/SlimeWarStyles';
import { slimeWarService } from '../services/SlimeWarService';
import { slimeWarWebSocketService } from '../services/SlimeWarWebsocketService';
import { observer } from 'mobx-react-lite';
import { slimeWarViewModel } from '../services/SlimeWarViewModel';
const GRID_SIZE = 9;

const SlimeWarScreen: React.FC = observer(() => {
  const [isCardSelectMode, setIsCardSelectMode] = React.useState<null | 'HERO' | 'MOVE'>(null);
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
    slimeWarWebSocketService.sendGetCardEvent();
  };
  const handleHero = () => {
    setIsCardSelectMode('HERO');
  };
  const handleMove = () => {
    setIsCardSelectMode('MOVE');
  };
  // 카드 클릭 핸들러
  const handleCardPress = (cardId: number) => {
    if (isCardSelectMode === 'HERO') {
      slimeWarWebSocketService.sendHeroEvent(cardId);
    } else if (isCardSelectMode === 'MOVE') {
      slimeWarWebSocketService.sendMoveEvent(cardId);
    }
    setIsCardSelectMode(null);
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
                onPress={() => handleCardPress(item.id ?? item)}
                disabled={!isCardSelectMode || (item.isUsable !== undefined && !item.isUsable)}
                style={[styles.card, isCardSelectMode && (item.isUsable === undefined || item.isUsable) && { borderColor: '#4CAF50', borderWidth: 2 }]}
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
      </View>
    </SafeAreaView>
  );
});

export default SlimeWarScreen;
