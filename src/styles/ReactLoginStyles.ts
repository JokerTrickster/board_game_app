import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
// 기준 디자인 사이즈: 아이폰 8플러스 
// 실제 기기에서는 픽셀 대신 포인트 단위로 적용되므로, 이 값은 참고용입니다.
const guidelineBaseWidth = 414;
const guidelineBaseHeight = 736;

// 가로 크기에 따른 스케일 함수
const scale = (size: number) => (width / guidelineBaseWidth) * size;
// 세로 크기에 따른 스케일 함수
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;

export default StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingHorizontal: scale(24),
        paddingBottom: verticalScale(35),
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingVertical: verticalScale(12),
        borderRadius: scale(30),
        borderWidth: scale(1.5),
        borderColor: '#000',
        backgroundColor: '#FFF6EB',
        marginBottom: verticalScale(14),
    },
    googleButtonText: {
        fontSize: scale(16),
        color: '#000',
        marginLeft: scale(10),
        fontWeight: 'bold',
    },
    orContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(14),
        width: '100%',
    },
    orLine: {
        flex: 1,
        height: scale(1.5),
        backgroundColor: '#000',
    },
    orText: {
        color: '#000',
        marginHorizontal: scale(10),
        fontWeight: 'bold',
        fontSize: scale(16),
    },
    input: {
        width: '100%',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        borderRadius: scale(30),
        borderWidth: scale(1.5),
        borderColor: '#000',
        fontSize: scale(16),
        backgroundColor: '#FFF6EB',
        color: '#000',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    inputWrapper: {
        width: '100%',
        position: 'relative',
        marginBottom: verticalScale(10),
    },
    inputIcon: {
        position: 'absolute',
        left: scale(16),
        top: '50%',
        transform: [{ translateY: -scale(12) }],
        width: scale(20),
        height: scale(20),
        resizeMode: 'contain',
        zIndex: 1,
    },
    buttonIcon: {
        position: 'absolute',
        left: scale(16),
        width: scale(20),
        height: scale(20),
        resizeMode: 'contain',
    },
    loginButton: {
        width: '100%',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        borderRadius: scale(30),
        borderWidth: scale(1),
        borderColor: '#000',
        backgroundColor: '#FAC0BE',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: verticalScale(10),
    },
    loginButtonText: {
        fontSize: scale(16),
        color: '#000',
        fontWeight: 'bold',
    },
    signupText: {
        fontSize: scale(16),
        color: '#000',
        fontWeight: 'bold',
    },
    forgotPasswordText: {
        fontSize: scale(16),
        color: '#000',
        fontWeight: 'bold',
    },
    linkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: scale(20),
    },
    separator: {
        fontSize: scale(16),
        color: '#000',
        marginHorizontal: scale(8),
    },
});
