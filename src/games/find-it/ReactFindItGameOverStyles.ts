import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 414;
const guidelineBaseHeight = 736;

const scale = (size:number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: scale(20),
    },
    gameOverTitle: {
        fontSize: scale(32),
        fontWeight: 'bold',
        color: '#dc3545',
        marginBottom: verticalScale(20),
    },
    gameOverText: {
        fontSize: scale(20),
        color: '#333',
        marginBottom: verticalScale(10),
    },
    mainButton: {
        marginTop: verticalScale(30),
        backgroundColor: '#007bff',
        paddingVertical: verticalScale(12),
        paddingHorizontal: scale(30),
        borderRadius: scale(10),
    },
    mainButtonText: {
        fontSize: scale(18),
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
});
