import { StyleSheet } from 'react-native';

const CELL_SIZE = 32; // 한 칸 크기(px), 필요에 따라 조정

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 10
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10
  },
  boardContainer: {
    width: CELL_SIZE * 9,
    height: CELL_SIZE * 9,
    alignSelf: 'center', // 화면 중앙 정렬
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: '#000',
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
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
    marginBottom: 5,
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
  card: {
    width: 50,
    height: 70,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
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
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 5
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
    right: 8,
    top: 4,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 8,
    paddingHorizontal: 4,
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
    marginHorizontal: 16,
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
});
