import { StyleSheet } from 'react-native';

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
    height: '50%',
    aspectRatio: 1, // 정사각형 격자
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    marginBottom: 4,
  },
  row: {
    flex: 1,
    flexDirection: 'row'
  },
  cell: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#ccc'
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
});
