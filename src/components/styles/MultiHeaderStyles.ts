import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 414;
const guidelineBaseHeight = 736;

const scale = (size: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;

export default StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },

    multiHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: '20%',
        paddingBottom: verticalScale(50),
        paddingLeft: scale(30),
        paddingRight: scale(30),
    },
    profileContainer: {
        marginTop: verticalScale(50),
    },
    profileBorder: {
        width: scale(200),
        height: verticalScale(80),
        flexDirection: 'row', // 내부에서 프로필 이미지와 텍스트를 가로로 배치
        alignItems: 'center',
    },
    profileBorderImg: {
        resizeMode: 'contain',
    },
    profileImage: {
        width: scale(63),
        height: verticalScale(52),
        marginLeft: scale(7),
        marginRight: scale(15),
        borderWidth: scale(2.5),
        marginTop: verticalScale(10),
        borderRadius: scale(10),
    },
    profileInfo: {
        justifyContent: 'center',
    },
    nickname: {
        fontSize: scale(16),
        fontWeight: 'bold',
        paddingBottom: verticalScale(5),
        textAlign: 'center',
    },
    // 가운데 영역 스타일
    centerContainer: {
        flex: 1,
        paddingLeft: scale(35),
        paddingTop: verticalScale(35),
    },
    roundText: {
        fontSize: scale(24),
        fontWeight: 'bold',
        color: '#000',
    },
    settingsIcon: {
        padding: scale(10),
        paddingTop: verticalScale(30),
    },
    gameContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        marginTop: verticalScale(10)
    },
    gameCard: {
        width: '45%',
        height: verticalScale(255),
        backgroundColor: '#fff',
        marginVertical: verticalScale(10),
        borderRadius: scale(10),
        padding: scale(5),
        elevation: scale(6),
        alignItems: 'center',
        borderWidth: scale(1),
        borderColor: '#000',
    },
    gameImage: {
        width: '90%',
        height: verticalScale(190),
        borderRadius: scale(10),
        borderWidth: scale(1),
        resizeMode: 'contain', // 이미지 전체가 보이도록 설정
        marginBottom: verticalScale(-10), // 음수 값을 제거 또는 양수로 조정
    },
    gameTitle: {
        marginTop: verticalScale(10),
        fontWeight: 'bold',
        fontSize: scale(20)
    },
    hashtagContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(5),
    },
    hashtag: {
        marginHorizontal: scale(3),
        fontSize: scale(12),
        backgroundColor: '#eee',
        padding: scale(2),
        borderRadius: scale(5)
    },
    matchButton: {
        backgroundColor: '#6f96ff',
        padding: scale(15),
        alignItems: 'center',
        borderRadius: scale(20),
        margin: scale(20),
    },
    categoryBorder: {
        height: verticalScale(20),
        width: '40%',
        borderWidth: scale(1),
        borderColor: '#666', // 원하는 색상으로 변경
        borderRadius: scale(5),
        alignItems: 'center',
        marginRight: scale(7),
    },
    hashtagBorder: {
        height: verticalScale(20),
        width: '40%',
        borderWidth: scale(1),
        borderColor: '#666', // 원하는 색상으로 변경
        borderRadius: scale(5),
        alignItems: 'center',
    },
    imagePlaceholder: {
        width: scale(100),
        height: verticalScale(100),
        backgroundColor: '#EAEAEA',
        borderRadius: scale(10),
        marginBottom: verticalScale(10),
    },
    matchButtonText: {
        color: '#fff',
        fontSize: scale(18)
    },
    // 모달 스타일
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        padding: scale(20),
        backgroundColor: '#fff',
        borderRadius: scale(10),
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: scale(18),
        fontWeight: 'bold',
        marginBottom: verticalScale(15),
    },
    settingItem: {
        width: '100%',
        alignItems: 'center',
        marginBottom: verticalScale(10),
    },
    slider: {
        width: '80%',
    },
    modalButton: {
        padding: scale(10),
        width: '100%',
        alignItems: 'center',
        backgroundColor: '#FFF6EB',
        borderRadius: scale(10),
        marginVertical: verticalScale(5),
    },
    closeButton: {
        marginTop: verticalScale(10),
        padding: scale(10),
        backgroundColor: '#ddd',
        width: '100%',
        alignItems: 'center',
        borderRadius: scale(10),
    },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(5),
    },
    categoryText: {
        fontSize: scale(12),
        color: '#000',
    },
    separator: {
        fontSize: scale(12),
        color: '#999',
        marginHorizontal: scale(5),
    },
    hashtagText: {
        fontSize: scale(12),
        color: '#000',
    },
    background: {
        flex: 1,
        resizeMode: 'cover',
    },
    
});
