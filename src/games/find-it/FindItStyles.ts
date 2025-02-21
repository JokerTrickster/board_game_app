import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f4f4', paddingTop: 0 },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', width: '90%', position: 'absolute', top: 10 },
    roundText: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', flex: 1 },
    timerText: { fontSize: 18, fontWeight: 'bold', color: 'black', textAlign: 'right' },
    imageContainer: { position: 'relative' },
    image: { width: 400, height: 300, marginBottom: 5, borderWidth: 1, borderColor: 'black' },
    // ✅ 타이머 막대 스타일
    timerBarContainer: {
        width: '90%',
        height: 10,
        backgroundColor: '#ddd',
        borderRadius: 5,
        marginVertical: 10,
        overflow: 'hidden',
    },
    timerBar: {
        height: '100%',
        backgroundColor: 'red',
    },

    correctCircle: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 3,
        borderColor: 'green',
    },
    infoRow: {
        flexDirection: 'row', // 가로 정렬
        alignItems: 'center', // 세로 중앙 정렬
        justifyContent: 'center', // 요소 중앙 정렬
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // 반투명 검정 배경
        padding: 12, // 내부 패딩
        borderRadius: 15, // 둥근 테두리
        width: '100%', // 가로로 꽉 차게 설정
        alignSelf: 'center', // 중앙 정렬
        marginBottom: 10, // 아래 여백 추가
    },

    infoText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#fff', // 흰색 글씨 (가독성)
        textAlign: 'center',
        flex: 1, // 가로 공간 균등 분배
    },

    infoButton: {
        backgroundColor: '#FFD700', // 버튼 색상 (골드)
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10, // 둥근 버튼
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1, // 버튼도 가로 공간 균등 분배
        maxWidth: 100, // 버튼 크기 고정 (너무 커지지 않도록)
        marginHorizontal: 5, // 버튼 간 여백
        elevation: 3, // Android 그림자 효과
        shadowColor: '#000', // iOS 그림자 효과
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },

    infoButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'black',
        textAlign: 'center',
    },

    wrongXContainer: {
        position: 'absolute',
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },

    wrongXLine: {
        position: 'absolute',
        width: 30,
        height: 5,
        backgroundColor: 'red',
    },
    hintCircle: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 3,
        borderColor: 'black',
    },
    wrongXRotate45: { transform: [{ rotate: '45deg' }] },
    wrongXRotate135: { transform: [{ rotate: '135deg' }] },

    // ✅ 목숨(❤️) & 힌트(💡) 표시 컨테이너
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 250,
        marginBottom: 10,
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#fff',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
   
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 250,
        marginTop: 10,
    },
    clearEffectContainer: {
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: [{ translateX: -100 }, { translateY: -50 }],
        backgroundColor: 'rgba(0, 255, 0, 0.8)',
        padding: 20,
        borderRadius: 10,
        zIndex: 10,
    },
    clearEffectText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },

});