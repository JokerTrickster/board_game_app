import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import styles from '../styles/SlimeWarStyles';
import { slimeWarService } from '../services/SlimeWarService';

const GRID_SIZE = 9;

const SlimeWarScreen: React.FC = () => {
  // 9x9 격자를 생성하는 함수
  const renderGrid = () => {
    let rows = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      let cells = [];
      for (let col = 0; col < GRID_SIZE; col++) {
        cells.push(
          <View key={`cell-${row}-${col}`} style={styles.cell} />
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

  // 임시 데이터: 상대방 패와 본인 패 (추후 실제 데이터를 연결)
  const opponentHand = [1, 2, 3, 4, 5];
  const playerHand = [1, 2, 3, 4, 5];

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
          <Text style={styles.handTitle}>상대방 패</Text>
          <ScrollView horizontal contentContainerStyle={styles.handScrollView} showsHorizontalScrollIndicator={false}>
            {opponentHand.map((item, index) => (
              <View key={`opponent-card-${index}`} style={styles.card}>
                <Text style={styles.cardText}>S{item}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
        {/* 본인 패 */}
        <View style={styles.playerHandContainer}>
          <Text style={styles.handTitle}>본인 패</Text>
          <ScrollView horizontal contentContainerStyle={styles.handScrollView} showsHorizontalScrollIndicator={false}>
            {playerHand.map((item, index) => (
              <View key={`player-card-${index}`} style={styles.card}>
                <Text style={styles.cardText}>P{item}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
      
      {/* 버튼 영역 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => console.log('더미 눌림')}>
          <Text style={styles.buttonText}>더미</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => console.log('이동 눌림')}>
          <Text style={styles.buttonText}>이동</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => console.log('흡수 눌림')}>
          <Text style={styles.buttonText}>흡수</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SlimeWarScreen;
