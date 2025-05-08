import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
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
  timerBar: {
    width: '80%',
    height: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
  },
  timerProgress: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  timerText: {
    marginTop: 5,
    color: 'white',
    fontSize: 16,
  },
  boardContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 35,
    height: 35,
    borderWidth: 1,
    borderColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  chipImage: {
    width: 30,
    height: 30,
  },
  handContainer: {
    height: 120,
    padding: 10,
  },
  handScrollView: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    width: 80,
    height: 100,
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  turnIndicator: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 20,
  },
  turnText: {
    color: 'white',
    fontSize: 16,
  },
}); 