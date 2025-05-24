import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 414;
const guidelineBaseHeight = 736;

const scale = (size:number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;

export default StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: scale(18),
        justifyContent: 'flex-start',
        marginTop: verticalScale(-10),
    },
    backButton: {
        position: 'absolute',
        left: 0,
    },
    titleRow: {
        position: 'relative',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: verticalScale(12),
    },
    gameTitle: {
        fontSize: scale(28),
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: verticalScale(12),
        color: '#333',
    },
    // --- 상단 영역(이미지+오른쪽 카드) ---
    topRow: {
        flexDirection: 'row',
        width: '97%',
        height: verticalScale(200), // 이미지 높이에 맞춰 부모 높이 설정
        marginBottom: verticalScale(10),
        marginLeft: scale(4),
        borderWidth: scale(1),
        borderRadius: scale(10),
    },
    // --- 이미지 ---
    gameImage: {
        marginTop: verticalScale(8),
        width: scale(180),
        height: '92%',
        resizeMode: 'cover',
        marginLeft: scale(10),
        borderTopLeftRadius: scale(10), // 왼쪽 모서리 borderRadius 추가
        borderBottomLeftRadius: scale(10), // 왼쪽 모서리 borderRadius 추가
    },
    // --- 오른쪽 영역 ---
    rightColumn: {
        flex: 1,
        marginLeft: scale(10),
        justifyContent: 'space-between',
    },
    // --- infoCard: 부모(topRow)의 남은 높이를 절반씩 사용 (대략 48%) ---
    infoCard: {
        height: '48%',
        justifyContent: 'center',
        overflow: 'hidden', // 추가: 컨테이너 범위 내에 이미지가 표시되도록
    },
    infoTutorialImage: {
        marginTop: verticalScale(8),
        width: '95%',
        height: '90%',
        resizeMode: 'cover', // 전체 영역 채우기
        borderTopRightRadius: scale(10), // 왼쪽 모서리 borderRadius 추가
    },
    infoYoutubeImage: {
        marginBottom: verticalScale(8),
        width: '95%',
        height: '90%',
        resizeMode: 'cover', // 전체 영역 채우기
        borderBottomRightRadius: scale(10), // 왼쪽 모서리 borderRadius 추가

    },

    infoText: {
        fontSize: scale(16),
        textAlign: 'center',
        margin: scale(10),
        color: '#555',
    },
    // --- 아래쪽 컨텐츠 ---
    detailContainer: {
        alignItems: 'center',
    },
    actionCard: {
        width: '100%',
        padding: scale(50),
        backgroundColor: '#FFF',
        borderRadius: scale(15),
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: verticalScale(10),
        shadowColor: '#000',
        borderWidth: scale(2),
        borderColor: '#000',
        shadowOffset: { width: 0, height: verticalScale(3) },
        shadowOpacity: 0.1,
        shadowRadius: scale(4),
        elevation: scale(2),
    },
    actionText: {
        fontSize: scale(16),
        textAlign: 'center',
        color: '#555',
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '95%',
        height: verticalScale(40),
        justifyContent: 'center',
        marginVertical: verticalScale(20),
    },

    buttonText: {
        fontSize: scale(10),
        fontWeight: '900',
        color: '#000',
    },
   
    infoContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: verticalScale(8),
    },
    background: {
        flex: 1,
        resizeMode: 'cover',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',

    },
    modalContent: {
        width: '90%',
        height: '45%',
        backgroundColor: '#fff',
        borderRadius: scale(10),
        padding: scale(20),
    },
    modalDescriptionText: {
        fontSize: scale(16),
        color: '#333',
    },
    modalCloseButton: {
        padding: scale(15),
        borderRadius: scale(5),
        alignSelf: 'center',
        marginTop: verticalScale(-35),
    },
    modalCloseButtonText: {
        fontSize: scale(20),
        fontWeight:'bold',
        color: '#000',
    },
    youtubeWebView: {
        width: '100%',
    },
    gameTitleImage: {
        width: scale(260),
        height: verticalScale(60),
        resizeMode: 'contain',
        alignSelf: 'center',
    },
    // ReactGameDetailStyles.js (또는 관련 스타일 파일에 추가)
    aloneButton: {
        // 기존 matchButton과 유사한 스타일을 적용할 수도 있습니다.
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: scale(2),
        borderRadius: scale(30),
        backgroundColor: '#F4AEB0',
        marginBottom: verticalScale(15),
        marginLeft: scale(10),
    },
    soloButtonText: {
        color: '#000',
        fontSize: scale(20),
        fontWeight: '900',
        textAlign: 'center',
        position: 'absolute',
    },
    togetherButton: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: scale(2),
        borderRadius: scale(30),
        backgroundColor: '#F3CDB1',
        marginBottom: verticalScale(15),
        marginLeft: scale(20),
    },

    togetherButtonText: {
        color: '#000',
        fontSize: scale(20),
        fontWeight: '900',
        textAlign: 'center',
        position: 'absolute',

    },
    content: {
        flex: 1,
        marginBottom:   verticalScale(75),
    },
    // 함께하기 옵션 모달 스타일 추가
    togetherModalContent: {
        width: '90%',
        height:'30%',
        overflow: 'hidden',  // ensure children don't overflow the rounded corners
        // removed padding so image fills entire container
    },
    togetherModalImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    modalTitle: {
        fontSize: scale(18),
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    modalButton: {
        width: '55%',
        borderRadius: scale(30),
        marginLeft: scale(80),
        marginBottom: verticalScale(28),
        paddingBottom: verticalScale(15),
        marginTop: verticalScale(15),
    },
    modalRandomButtonText: {
        fontSize: scale(20),
        fontWeight: '600',
        textAlign: 'center',
    },
    modalTogetherButtonText: {
        fontSize: scale(20),
        fontWeight: '600',
        textAlign: 'center',
    },
    friendInput: {
        width: '100%',
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    generatedCodeText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 10,
        color: '#333',
    },
    // 추가 스타일 예시
    waitingModalContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: scale(10),
        padding: scale(20),
        alignItems: 'center',
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: verticalScale(10),
    },
    copyButton: {
        marginLeft: scale(10),
        paddingVertical: verticalScale(6),
        paddingHorizontal: scale(12),
        backgroundColor: '#FFB6C1',
        borderRadius: scale(20),
    },
    copyButtonText: {
        fontSize: scale(14),
        color: '#fff',
    },
    modalTitleStart: {
        fontSize: scale(14),
        color: '#333',
        textAlign: 'center',
        paddingTop:  verticalScale(20),
    },
    modalTitleRandom: {
        fontSize: scale(18),
        fontWeight: 'bold',
        marginTop: verticalScale(90),

    },
    modalTitleTogether: {
        top: verticalScale(30),  // 친구와 함께 이미지에 맞는 위치
        fontSize: scale(20),
        color: '#fff',
    },

    modalSubtitleRandom: {
        fontSize: scale(14),
        color: '#000',
        textAlign: 'center',
        marginTop: verticalScale(25),
    },
    modalCancelButton: {
        paddingVertical: verticalScale(12),
        borderRadius: scale(8),
    },
    modalCancelButtonText: {
        fontSize: scale(14),
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
    },

    waitingText: {
        fontSize: scale(16),
        color: '#555',
        textAlign: 'center',
        marginBottom: verticalScale(10),
    },
    cancelButton: {
        paddingVertical: verticalScale(10),
        paddingHorizontal: scale(20),
        backgroundColor: '#FF5722',
        borderRadius: scale(8),
        marginBottom: verticalScale(20),
    },
    cancelButtonText: {
        fontSize: scale(16),
        fontWeight: 'bold',
        color: '#fff',
    },
    createRoomButton: {
        marginTop: verticalScale(75),
        paddingVertical: verticalScale(11),
        paddingHorizontal: scale(90),
        borderRadius: scale(10),
        marginVertical: verticalScale(30),
        marginRight: scale(10),
    },
    createRoomButtonText: {
        fontSize: scale(18),
        fontWeight: 'bold',
        color: '#000',
        marginTop: verticalScale(5),
    },
    inviteCodeText: {
        fontSize: scale(18),
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    joinPromptText: {
        fontSize: scale(12),
        color: '#000',
        textAlign: 'center',
        marginTop: verticalScale(-10),
    },
    joinSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginTop: verticalScale(-10),
    },
    codeInput: {
        flex: 1,
        height: 40,
        borderRadius: scale(5),
        marginLeft: scale(50),
        marginTop:scale(10),
    },
    joinButton: {
        paddingHorizontal: scale(20),
        borderRadius: scale(8),
        marginRight: scale(55),
        marginTop: scale(5),
    },
    joinButtonText: {
        fontSize: scale(16),
        fontWeight: 'bold',
        color: '#000',

    },
    modalCloseIcon: {
        position: 'absolute',
        top: verticalScale(10),
        right: scale(40),
        width: scale(25),
        height: scale(25),
        zIndex: 10,
    },
    modalCloseIconImage: {
        width: 30,
        height: 30,
    },
    matchingUIContainer: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
