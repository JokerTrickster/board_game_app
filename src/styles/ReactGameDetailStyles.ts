import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 414;
const guidelineBaseHeight = 736;

const scale = (size:number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;

export default StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: scale(16),
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
        width: '100%',
        height: verticalScale(255), // 이미지 높이에 맞춰 부모 높이 설정
        marginBottom: verticalScale(10),
    },
    // --- 이미지 ---
    gameImage: {
        width: scale(200),
        height: '100%',
        resizeMode: 'contain',
        borderRadius: scale(10),
        backgroundColor: '#FBF4E7',
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
        backgroundColor: '#FFF',
        borderRadius: scale(15),
        justifyContent: 'center',
        borderWidth: scale(1.5),
        marginTop: verticalScale(10),
        overflow: 'hidden', // 추가: 컨테이너 범위 내에 이미지가 표시되도록
    },
    infoImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover', // 전체 영역 채우기
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
        borderWidth: scale(1),
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
        justifyContent: 'space-between',
        width: '90%',
        marginVertical: verticalScale(16),
    },
    matchButton: {
        flex: 1,
        paddingVertical: verticalScale(14),
        backgroundColor: '#FFB6C1',
        borderRadius: scale(30),
        borderWidth: scale(1),
        borderColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: scale(4),
    },
    togetherButton: {
        flex: 1,
        paddingVertical: verticalScale(14),
        backgroundColor: '#FFDDC1',
        borderRadius: scale(30),
        justifyContent: 'center',
        borderWidth: scale(1),
        borderColor: '#000',
        alignItems: 'center',
        marginHorizontal: scale(4),
    },
    buttonText: {
        fontSize: scale(16),
        fontWeight: '600',
        color: '#333',
    },
    summaryCard: {
        width: '90%',
        height: verticalScale(180),
        backgroundColor: '#FFF',
        borderRadius: scale(15),
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: verticalScale(8),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: verticalScale(3) },
        shadowOpacity: 0.1,
        shadowRadius: scale(4),
        elevation: scale(2),
    },
    summaryText: {
        fontSize: scale(18),
        color: '#555',
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
        height: '70%',
        backgroundColor: '#fff',
        borderRadius: scale(10),
        padding: scale(20),
    },
    modalDescriptionText: {
        fontSize: scale(16),
        color: '#333',
    },
    modalCloseButton: {
        marginTop: verticalScale(10),
        padding: scale(10),
        backgroundColor: '#ddd',
        borderRadius: scale(5),
        alignSelf: 'center',
    },
    modalCloseButtonText: {
        fontSize: scale(16),
        color: '#000',
    },
    youtubeWebView: {
        width: '100%',
    },
    gameTitleImage: {
        width: scale(320),
        height: verticalScale(60),
        resizeMode: 'contain',
        alignSelf: 'center',
    },
});
