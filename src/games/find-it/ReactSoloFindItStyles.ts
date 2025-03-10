import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 414;
const guidelineBaseHeight = 736;

const scale = (size: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;

export const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f4f4', paddingTop: 0 },
    gameScreen: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
    },
    roundText: {
        fontSize: 24,
        marginVertical: 10,
        textAlign: 'center',
    },
    imageWrapper: {
        width: '100%',
        alignItems: 'center',
    },
    imageContainer: {
        width: 400, // ✅ 이미지 크기 고정 (화면 크기에 따라 변경되지 않음)
        height: 255,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8, // ✅ 두 이미지 간격 최소화
    },
    
    image: {
        width: 400, // ✅ 고정된 너비 유지
        height: 255, // ✅ 고정된 높이 유지
        resizeMode: 'contain', // ✅ 원본 비율 유지하며 잘리지 않도록 설정
        borderWidth: 1,
        borderColor: '#ddd',
    },
    // 타이머 바 영역
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
    // 마커 기본 스타일 (절대 위치)
    marker: {
        position: 'absolute',
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // 정답(동그라미) 마커 스타일
    correctMarker: {
        // 추가적인 스타일(예: 테두리 등) 필요 시 수정
    },
    // 오답(엑스) 마커 스타일
    wrongMarker: {
        // 추가적인 스타일(예: 테두리 등) 필요 시 수정
    },
    markerText: {
        fontSize: 24,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 20,
        backgroundColor: '#f5f5f5',
    },
    item: {
        alignItems: 'center',
    },
    itemLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    itemCount: {
        fontSize: 16,
        marginVertical: 5,
    },
    controlPanel: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: verticalScale(10),
    },
    controlButton: {
        width: scale(50),
        height: scale(50),
        borderRadius: scale(25),
        backgroundColor: '#007BFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: scale(5),
    },
    controlButtonText: {
        fontSize: scale(24),
        fontWeight: 'bold',
        color: '#fff',
    },
});
