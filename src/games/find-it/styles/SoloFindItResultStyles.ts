import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 414;
const guidelineBaseHeight = 736;

const scale = (size: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;

export default StyleSheet.create({
    // 전체 배경 이미지 스타일
    background: {
        flex: 1,
        resizeMode: 'cover',
    },
    backgroundImage: {
        resizeMode: 'cover',
    },
    // 컨테이너: 가운데 정렬
    container: {
        flex: 1,
        alignItems: 'center',
    },
    // 가운데 카드 이미지 스타일
    centerCard: {
        width: scale(350),
        height: verticalScale(400),
        alignItems: 'center',
        padding: scale(20),
    },
    centerCardImage: {
        resizeMode: 'contain',
    },
    // "클리어" 텍스트 스타일
    clearText: {
        fontSize: scale(28),
        fontWeight: 'bold',
        marginTop: verticalScale(105),
    },
    // 최종 라운드 정보 스타일
    roundInfo: {
        flexDirection: 'column',
        width: '100%',
        paddingVertical: verticalScale(19),
        paddingHorizontal: scale(23),
        borderRadius: scale(8),
        marginLeft: scale(190),
    },
    roundTitle: {
        fontSize: scale(16),
        fontWeight: '600',
        color: '#444',
    },
    roundNumber: {
        fontSize: scale(40),
        fontWeight: 'bold',
        color: '#222',
        marginLeft: scale(20),
    },
    // 프로필 영역 컨테이너 (두 개 프로필 정보)
    profilesContainer: {
        width: '100%',
    },
    // 각 프로필 정보 행
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(10),
        borderRadius: scale(8),
        marginTop: verticalScale(2),
        paddingVertical: verticalScale(6),
    },
    profileImage: {
        width: scale(50),
        height: scale(50),
        borderRadius: scale(10),
        borderWidth: scale(2),
        borderColor: '#FFF',
        backgroundColor: '#FFF',
        resizeMode: 'cover',
        marginLeft: scale(55),
    },
    profileName: {
        flex: 1,
        marginLeft: scale(10),
        fontSize: scale(16),
        fontWeight: '600',
        color: '#333',
    },
    plusScore: {
        fontSize: scale(16),
        fontWeight: 'bold',
        color: '#000',
        marginRight: scale(13),
    },
    // 홈으로 이동하는 버튼 스타일
    homeButton: {
        paddingVertical: verticalScale(10),
        paddingHorizontal: scale(30),
        backgroundColor: '#FC9D99',
        borderRadius: scale(10),
        alignSelf: 'center',
    },
    homeButtonText: {
        fontSize: scale(16),
        color: '#FFF',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
