// LoadingScreenStyles.ts
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 414;
const guidelineBaseHeight = 736;

const scale = (size: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;

export const LoadingScreenStyles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: scale(20),
        marginTop: verticalScale(140),
    },
    progressBarContainer: {
        width: '80%',
        height: verticalScale(20),
        backgroundColor: 'white',
        borderRadius: scale(10),
        overflow: 'hidden',
        marginBottom: verticalScale(20),
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#F2BEBF',
    },
    messageText: {
        fontSize: scale(18),
        color: '#333',
        textAlign: 'center',
    },
});
