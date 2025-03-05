import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 414;
const guidelineBaseHeight = 736;

// 가로, 세로 스케일 함수
const scale = (size:number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;

export default StyleSheet.create({
    container: {
        flex: 1,
        padding: scale(20),
        backgroundColor: '#fff',
    },
    goBack: {
        fontSize: scale(16),
        marginBottom: verticalScale(20),
        color: '#000',
    },
    section: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: verticalScale(10),
    },
    input: {
        flex: 1,
        borderWidth: scale(1),
        borderRadius: scale(8),
        padding: scale(10),
        borderColor: '#ccc',
        marginRight: scale(10),
        fontSize: scale(16),
    },
    button: {
        padding: scale(10),
        backgroundColor: '#4A90E2',
        borderRadius: scale(8),
    },
    buttonText: {
        color: '#fff',
        fontSize: scale(16),
    },
    submitButton: {
        marginTop: verticalScale(20),
        padding: scale(12),
        borderRadius: scale(8),
        backgroundColor: '#4A90E2',
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: scale(16),
    },
});
