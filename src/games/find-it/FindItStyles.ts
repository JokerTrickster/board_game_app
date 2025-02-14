import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f4f4', paddingTop: 40 },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', width: '90%', position: 'absolute', top: 10 },
    roundText: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', flex: 1 },
    timerText: { fontSize: 18, fontWeight: 'bold', color: 'black', textAlign: 'right' },
    imageContainer: { position: 'relative' },
    image: { width: 400, height: 300, marginBottom: 10, borderWidth: 1, borderColor: 'black' },

    correctCircle: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 3,
        borderColor: 'green',
    },
    infoRow: {
        flexDirection: 'row', // ✅ 가로 배치
        alignItems: 'center', // ✅ 세로 중앙 정렬
        justifyContent: 'space-around', // ✅ 요소 간 간격 균등 배분
        width: '100%', // ✅ 전체 너비 사용
        padding: 10, // ✅ 여백 추가
        backgroundColor: '#fff', // ✅ 배경색 추가
        borderRadius: 10, // ✅ 둥근 모서리
        elevation: 3, // ✅ Android 그림자 효과
        shadowColor: '#000', // ✅ iOS 그림자 효과
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
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
});