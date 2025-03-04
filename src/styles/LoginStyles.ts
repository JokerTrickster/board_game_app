import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover', // 이미지 크기를 화면에 맞게 조정
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end', // 아래쪽 정렬
        // 배경 이미지가 잘 보이도록 배경색을 제거하거나 투명하게 설정할 수 있습니다.
        paddingHorizontal: 24,
        paddingBottom: 75, // 하단 여백 추가
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingVertical: 12,
        borderRadius: 30,
        borderWidth: 1.5,
        borderColor: '#000',
        backgroundColor: '#FFF6EB',
        marginBottom: 14,
    },
    googleButtonText: {
        fontSize: 16,
        color: '#000',
        marginLeft: 10,
        fontWeight: 'bold',
    },
    orContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        width: '100%',
    },
    orLine: {
        flex: 1,
        height: 1.5,
        backgroundColor: '#000',
    },
    orText: {
        color: '#000',
        marginHorizontal: 10,
        fontWeight: 'bold',
        fontSize: 16,
    },
    input: {
        width: '100%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 30,
        borderWidth: 1.5,
        borderColor: '#000',
        fontSize: 16,
        backgroundColor: '#FFF6EB',
        color: '#000',
        textAlign: 'center', // 텍스트 가운데 정렬
        fontWeight: 'bold',
    },
   
    inputWrapper: {
        width: '100%',
        position: 'relative',
        marginBottom: 14,
    },
    inputIcon: {
        position: 'absolute',
        left: 16,
        top: '50%',
        transform: [{ translateY: -12 }],
        width: 20,
        height: 20,
        resizeMode: 'contain',
        zIndex: 1, // 아이콘을 텍스트 입력 위에 렌더링
    },
    buttonIcon: {
        position: 'absolute',
        left: 16,
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
    loginButton: {
        width: '100%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#000',
        backgroundColor: '#FAC0BE',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    loginButtonText: {
        fontSize: 16,
        color: '#000',
        fontWeight: 'bold',
    },
    signupText: {
        fontSize: 16,
        color: '#000',
        fontWeight: 'bold',
    },
    forgotPasswordText: {
        fontSize: 16,
        color: '#000',
        fontWeight: 'bold',
    },
    linkContainer: {
        flexDirection: 'row',
        justifyContent: 'center', // ✅ 가운데 정렬로 변경
        alignItems: 'center', // ✅ 수직 가운데 정렬 추가
        width: '100%',
        paddingHorizontal: 20,
    },
    separator: { // ✅ "|" 구분선 스타일
        fontSize: 16,
        color: '#000',
        marginHorizontal: 8,
    },
});
