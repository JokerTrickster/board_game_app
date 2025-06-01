import { StyleSheet, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

// 보드 가로는 화면의 98%, 세로는 10x(셀 높이)로 맞춤
const BOARD_WIDTH = SCREEN_WIDTH * 0.98;
const CELL_WIDTH = BOARD_WIDTH / 10;
const CELL_HEIGHT = CELL_WIDTH * 1.35; // 세로를 더 길게(예: 1.35배, 필요시 더 조정)

const BOARD_HEIGHT = CELL_HEIGHT * 10;

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e', // 어두운 남색 계열, 카드와 어울림
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  timerContainer: {
    padding: 10,
    alignItems: 'center',
  },
  timerWrapper: {
    width: '100%',
    alignItems: 'center',
    zIndex: 20,
    marginTop:-20,
  },
  timerBar: {
    width: '50%',
    height: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 4,
  },
  timerProgress: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  timerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  boardContainer: {
    width: BOARD_WIDTH,
    height: BOARD_HEIGHT,
    backgroundColor: '#232946', // 보드 배경(남색/회색 계열)
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginVertical: 8,
    borderWidth: 2,
    marginLeft:5,
    borderColor: '#b8c1ec',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_WIDTH,
    height: CELL_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
    padding: 0,
    backgroundColor: '#f4f4f8',
    borderWidth: 1,
    borderColor: '#b8c1ec',
    overflow: 'hidden',
  },
  chipImage: {
    width: CELL_WIDTH * 0.6,
    height: CELL_WIDTH * 0.6,
    position: 'absolute',
    left: (CELL_WIDTH * 0.2),
    top: (CELL_HEIGHT * 0.2),
    zIndex: 10,
  },
  handContainer: {
    width: '70%',
    alignSelf: 'center',
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 5,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeHandContainer: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  handScrollView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  card: {
    width: 50,
    height: 60,
    elevation: 5,
    resizeMode: 'cover',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    backgroundColor: '#fff',
    borderWidth: 0,
  },
  turnIndicator: {
    position: 'absolute',
    top: -25,
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  turnIndicatorText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  validCell: {
    borderColor: '#FF9800',
    borderWidth: 3,
  },
  sequenceCell: {
    borderColor: 'rgb(255, 0, 0)',
    borderWidth: 4,
    zIndex: 10,
    width: 35,
    height: 50,
  },
  mySequenceCell: {
    borderColor: '#4CAF50',
    borderWidth: 3,
  },
  opponentSequenceCell: {
    borderColor: '#F44336',
    borderWidth: 3,
  },
  timerRowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: -20,
    marginBottom: 8,
    zIndex: 20,
    paddingHorizontal: 20,
  },
  lastCardsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lastCardWrapper: {
    width: 30,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 4,
    padding: 2,
  },
  lastCardImage: {
    width: 26,
    height: 36,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: '#222',
  },
  turnIndicatorFixed: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 18,
    zIndex: 100,
    alignSelf: 'center',
  },
  turnTextFixed: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
}); 