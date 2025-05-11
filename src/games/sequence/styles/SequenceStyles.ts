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
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cell: {
    width: 35,
    height: 50,
    borderWidth: 1,
    borderColor: '#666',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
  },
  chipImage: {
    width: 30,
    height: 30,
    zIndex: 10,
    position: 'absolute',
  },
  handContainer: {
    position: 'relative',
    bottom: 0,
    height: 100,
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
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
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
  validCell: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderColor: 'rgba(255, 0, 0, 1)',
    borderWidth: 2,
    zIndex: 10,
    width: 35,
    height: 50,
  },
}); 