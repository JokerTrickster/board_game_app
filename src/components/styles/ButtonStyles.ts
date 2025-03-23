import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    buttonContainer: {
        // 기본적으로 버튼 컨테이너에 필요한 margin/padding 등을 추가할 수 있습니다.
    },
    imageBackground: {
        justifyContent: 'center',
        alignItems: 'center',
        // 버튼의 기본 크기를 설정하거나 부모에서 전달한 containerStyle에 따라 결정합니다.
        width: '100%',
        height: '100%',
    },
    imageStyle: {
        resizeMode: 'contain',
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
