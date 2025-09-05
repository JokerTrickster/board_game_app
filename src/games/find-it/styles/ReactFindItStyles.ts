import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 414;
const guidelineBaseHeight = 736;

const scale = (size: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;

export const styles = StyleSheet.create({

    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#f4f4f4',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
        marginTop: verticalScale(-20),
    },

    timerText: {
        fontSize: scale(18),
        fontWeight: 'bold',
        color: 'black',
        textAlign: 'right'
    },
    // 기존 imageContainer 수정:
    normalImageContainer: {
        width: scale(400),
        height: scale(277),
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    abnormalImageContainer: {
        width: scale(400),
        height: scale(277),
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: verticalScale(-14),
    },
    gameContainer: {
        width: width * 0.98,    // 현재 화면 너비의 98%
        height: height * 0.715, // 현재 화면 높이의 74.2%
        borderWidth: scale(3),
        borderColor: '#FC9D99',
        zIndex: 1,
    },
    // image 스타일 수정:
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain', // 원본 비율 유지, 컨테이너에 맞춰 전체가 보임
    },

    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '94%',
        marginTop: verticalScale(-5),
        marginBottom: verticalScale(10),
        zIndex: 1,
    },
    timerImage: {
        width: scale(35),
        height: scale(35),
        marginLeft: scale(-10),
    },
    timerBar: {
        height: scale(15),
        borderRadius: scale(7.5),
        marginLeft: scale(-5),
    },
    correctCircle: {
        position: 'absolute',
        width: scale(30),
        height: scale(30),
        borderRadius: scale(15),
        borderWidth: scale(3),
        borderColor: 'green',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: scale(12),
        borderRadius: scale(15),
        width: '100%',
        alignSelf: 'center',
        marginBottom: verticalScale(10),
    },
    infoText: {
        fontSize: scale(15),
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        flex: 1,
    },
    infoButton: {
        backgroundColor: '#FFD700',
        paddingVertical: verticalScale(10),
        paddingHorizontal: scale(16),
        borderRadius: scale(10),
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        maxWidth: scale(100),
        marginHorizontal: scale(5),
        elevation: scale(3),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: verticalScale(2) },
        shadowOpacity: 0.2,
        shadowRadius: scale(4),
    },
    infoButtonText: {
        fontSize: scale(14),
        fontWeight: 'bold',
        color: 'black',
        textAlign: 'center',
    },
    wrongXContainer: {
        position: 'absolute',
        width: scale(30),
        height: scale(30),
        justifyContent: 'center',
        alignItems: 'center',
    },
    wrongXLine: {
        position: 'absolute',
        width: scale(30),
        height: verticalScale(5),
        backgroundColor: 'red',
    },
    hintCircle: {
        position: 'absolute',
        width: scale(44), // 터치 타겟 최소 크기 보장
        height: scale(44),
        borderRadius: scale(22),
        borderWidth: scale(4),
        borderColor: '#FF9800', // 오렌지색으로 변경 (더 높은 대비)
        backgroundColor: 'rgba(255, 152, 0, 0.2)',
        // 깜빡이는 애니메이션을 위한 스타일
        elevation: 5,
        shadowColor: '#FF9800',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.7,
        shadowRadius: 4,
    },
    wrongXRotate45: {
        transform: [{ rotate: '45deg' }]
    },
    wrongXRotate135: {
        transform: [{ rotate: '135deg' }]
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: scale(250),
        marginBottom: verticalScale(10),
        padding: scale(10),
        borderRadius: scale(10),
        backgroundColor: '#fff',
        elevation: scale(3),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: verticalScale(2) },
        shadowOpacity: 0.2,
        shadowRadius: scale(4),
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: scale(250),
        marginTop: verticalScale(10),
    },
    clearEffectContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        height: scale(160),
        width: scale(280),
        top: '50%',
        left: '40%',
        transform: [{ translateX: -scale(100) }, { translateY: -verticalScale(50) }],
        backgroundColor: '#FCF0CF',
        borderWidth: scale(2),
        borderColor: '#BFA276',
        borderRadius: scale(10),
        zIndex: 10,
    },
    clearIcon: {
        width: '100%',
        height: verticalScale(50),
        resizeMode: 'contain',
        marginTop: verticalScale(-20),
    },
    clearEffectRound: {
        fontSize: scale(30),
        fontWeight: 'bold',
        color: '#363010',
        textAlign: 'center',  
    },
    clearEffectText: {
        fontSize: scale(30),
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginTop: verticalScale(-10),

        textShadowColor: '#000000',
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 5,
    },
    clearEffectTextContainer: {
        width: scale(140),
        borderWidth: scale(1),
        borderRadius: scale(20),
        backgroundColor: '#F9E7AF',
        marginVertical: verticalScale(10),
        paddingVertical: verticalScale(5),
    },
    clearEffectMessage: {
        fontSize: scale(12),
        fontWeight: 'bold',
        color: '#363010',
        textAlign: 'center',  
    },
    failEffectContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        height: scale(160),
        width: scale(280),
        top: '50%',
        left: '40%',
        transform: [{ translateX: -scale(100) }, { translateY: -verticalScale(50) }],
        backgroundColor: '#FCF0CF',
        borderWidth: scale(2),
        borderColor: '#BFA276',
        borderRadius: scale(10),
        zIndex: 10,
    },
    failIcon: {
        width: '100%',
        height: verticalScale(50),
        resizeMode: 'contain',
        marginTop: verticalScale(-20),
    },
    failEffectRound: {
        fontSize: scale(30),
        fontWeight: 'bold',
        color: '#363010',
        textAlign: 'center',
    },
    failEffectText: {
        fontSize: scale(30),
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginTop: verticalScale(-10),

        textShadowColor: '#000000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,
    },
    failEffectTextContainer: {
        width: scale(140),
        borderWidth: scale(1),
        borderRadius: scale(20),
        backgroundColor: '#F9E7AF',
        marginVertical: verticalScale(10),
        paddingVertical: verticalScale(5),
    },
    failEffectMessage: {
        fontSize: scale(12),
        fontWeight: 'bold',
        color: '#363010',
        textAlign: 'center',
    },
    missedCircle: {
        position: 'absolute',
        width: scale(30),
        height: scale(30),
        borderRadius: scale(15),
        backgroundColor: 'rgba(255, 0, 0, 0.5)',
        borderWidth: scale(2),
        borderColor: 'red',
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
    movePanel: {
        alignItems: 'center',
        marginVertical: verticalScale(10),
    },
    moveRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    moveButton: {
        width: scale(50),
        height: scale(50),
        borderRadius: scale(25),
        backgroundColor: '#28A745',
        alignItems: 'center',
        justifyContent: 'center',
        margin: scale(5),
    },
    moveButtonText: {
        fontSize: scale(20),
        fontWeight: 'bold',
        color: '#fff',
    },
    background: {
        flex: 1,
        resizeMode: 'cover',
    },
    gameTitleImage: {
        width: scale(320),
        height: verticalScale(60),
        resizeMode: 'contain',
        alignSelf: 'center',
    },

    checkBoxContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: verticalScale(8),
    },
    checkBoxImage: {
        width: scale(17),
        height: scale(17),
        marginHorizontal: scale(8),
        resizeMode: 'contain',
    },

    // 유저1(내) 정답 원 스타일 - 접근성 개선
    correctCircleUser1: {
        position: 'absolute',
        width: scale(30),
        height: scale(30),
        borderRadius: scale(15),
        borderWidth: scale(4), // 더 두꺼운 테두리로 시각적 구분 강화
        borderColor: '#4CAF50', // 초록색
        borderStyle: 'solid', // 실선으로 구분
        backgroundColor: 'rgba(76, 175, 80, 0.3)', // 더 진한 배경으로 대비 향상
        // 패턴 추가를 위한 그림자
        elevation: 4,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
    },

    // 유저2(상대방) 정답 원 스타일 - 접근성 개선
    correctCircleUser2: {
        position: 'absolute',
        width: scale(30),
        height: scale(30),
        borderRadius: 0, // 다이아몬드 모양을 위해 원형 제거
        borderWidth: scale(4),
        borderColor: '#2196F3', // 파란색
        borderStyle: 'dashed', // 점선으로 구분
        backgroundColor: 'rgba(33, 150, 243, 0.3)',
        transform: [{ rotate: '45deg' }], // 다이아몬드 모양으로 회전
        // 패턴 추가를 위한 그림자
        elevation: 4,
        shadowColor: '#2196F3',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
    },

    // 유저1(내) 오답 X 컨테이너 스타일
    wrongXContainerUser1: {
        position: 'absolute',
        width: scale(30),
        height: scale(30),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(244, 67, 54, 0.1)', // 연한 빨간색 배경
    },

    // 유저2(상대방) 오답 X 컨테이너 스타일
    wrongXContainerUser2: {
        position: 'absolute',
        width: scale(30),
        height: scale(30),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(156, 39, 176, 0.1)', // 연한 보라색 배경
    },

    // 유저1(내) 오답 X 선 스타일 - 접근성 개선
    wrongXLineUser1: {
        position: 'absolute',
        width: scale(30),
        height: verticalScale(6), // 더 두꺼운 선으로 시각성 향상
        backgroundColor: '#F44336', // 빨간색
        borderRadius: verticalScale(3), // 둥근 모서리
        // 패턴 구분을 위한 그림자
        elevation: 3,
        shadowColor: '#F44336',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.6,
        shadowRadius: 2,
    },

    // 유저2(상대방) 오답 X 선 스타일 - 접근성 개선
    wrongXLineUser2: {
        position: 'absolute',
        width: scale(30),
        height: verticalScale(6), // 더 두꺼운 선
        backgroundColor: '#9C27B0', // 보라색
        borderRadius: verticalScale(3),
        // 점선 패턴 효과를 위한 스타일 (CSS에서는 불가능하므로 대안 적용)
        opacity: 0.8,
        // 패턴 구분을 위한 그림자
        elevation: 3,
        shadowColor: '#9C27B0',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.6,
        shadowRadius: 2,
    },
});
