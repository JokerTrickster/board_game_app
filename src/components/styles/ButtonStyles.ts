import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 414;
const guidelineBaseHeight = 736;

const scale = (size: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;

export default StyleSheet.create({
    buttonContainer: {
        // 기본적으로 버튼 컨테이너에 필요한 margin/padding 등을 추가할 수 있습니다.
        flex:1,
        width: '100%',
        marginTop: verticalScale(-20),
    },

    text: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabled: {
        opacity: 0.5,
    },
});
