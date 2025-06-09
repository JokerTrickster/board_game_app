import { StyleSheet } from 'react-native';

const CELL_SIZE = 36; // 한 칸 크기(px), 필요에 따라 조정

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 10,
  },

  boardContainer: {
    width: CELL_SIZE * 9,
    height: CELL_SIZE * 9,
    alignSelf: 'center', // 화면 중앙 정렬
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 12,
    overflow: 'visible',
    marginTop: 0,
  },
  row: {
    flexDirection: 'row',
  },
  cellEven: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: 'rgba(200,255,150,0.45)', // 연한 연두+투명
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellOdd: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: 'rgba(0,0,0,0.10)', // 연한 검정+투명
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  handsContainer: {
    marginBottom: 10,
  },
  opponentHandContainer: {
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.5)', // 빨간색에 50% 투명도 적용
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  playerHandContainer: {
    marginBottom: 5,
  },
  handTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  handScrollView: {
    alignItems: 'center',
  },
  userHandContainer: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 255, 0.5)', // 파란색에 50% 투명도 적용
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  card: {
    width: 50,
    height: 70,
    backgroundColor: '#fff',
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  opponentCard: {
    width: 40,
    height: 60,
    backgroundColor: '#fff',
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardText: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#35C7C6',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold'
  },
  kingMark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'gold',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kingMarkText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  remainingSlimeText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginRight: 8,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 10,
  },
  cardItem: {
    margin: 5,
    padding: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  opponentCardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  turnIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 5,
  },
  turnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  heroCardText: {
    position: 'absolute',
    right: 0,
    bottom:0,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  heroCardContainer: {
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  restSlimeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  timerContainer: {
    marginTop: -20,
    marginHorizontal: 90,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    zIndex:1,
  },
  timerBar: {
    height: 16,
    backgroundColor: '#eee',
    borderRadius: 8,
    overflow: 'hidden',
  },
  timerText: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    top: 0,
    fontSize: 12,
    color: '#333',
  },
  treeImage: {
    width: CELL_SIZE * 9,
    height: 48, // 이미지 높이에 맞게 조정
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  topContainer: {
    alignItems: 'center',
    marginTop:-20,
  },
  movableCard: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  moveModeCard: {
    borderColor: '#2196F3',
    borderWidth: 2,
  },
  movableIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    padding: 2,
    alignItems: 'center',
  },
  movableText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  heroCard: {
    borderColor: '#FF5722',
    borderWidth: 2,
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  heroModeCard: {
    borderColor: '#FF9800',
    borderWidth: 2,
  },
  heroIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 87, 34, 0.8)',
    padding: 2,
    alignItems: 'center',
  },
  heroText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  kingCell: {
    borderWidth: 2,
    borderColor: '#FFD600', // 노란색 테두리
    backgroundColor: 'rgba(255, 214, 0, 0.15)', // 연한 노란색 배경
    shadowColor: '#FFD600',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 2,
  },
  // 모달 스타일 추가
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalScore: {
    fontSize: 18,
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
