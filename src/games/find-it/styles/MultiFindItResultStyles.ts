import { StyleSheet, Dimensions } from 'react-native';
import { scale, verticalScale } from 'react-native-size-matters';

const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 414;
const guidelineBaseHeight = 736;

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
    resultContainer: {
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        width: '90%',
        borderWidth: scale(1),
        borderRadius: scale(10),
        marginBottom: verticalScale(80),
        backgroundColor: '#F5EDD8',
    },

    clearConatiner: {
        flexDirection: 'column',
        width: '100%',
        height: verticalScale(100),
        borderRadius: scale(10),
        alignItems: 'center',
    },
    clearIcon: {
        width: '100%',
        height: verticalScale(60),
        resizeMode: 'contain',
        marginBottom: verticalScale(10),
    },
    clearTextContainer: {
        width: scale(200),
        height: verticalScale(35),
        backgroundColor: '#C4C4C4',
        borderRadius: scale(20),
        borderWidth: scale(1.5),
        justifyContent: 'center',
    },
    // "클리어" 텍스트 스타일
    clearText: {
        fontSize: scale(20),
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#FFFFFF',
        textShadowColor: '#000000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
    },
    title: {
        fontSize: scale(32),
        fontWeight: 'bold',
        color: '#222',
        marginBottom: verticalScale(20),
    },
    // 최종 라운드 정보 스타일
    roundInfo: {
        flexDirection: 'column',
        width: '100%',
        paddingHorizontal: scale(23),
        paddingTop: verticalScale(10),
        paddingBottom: verticalScale(20),
        borderRadius: scale(8),
        alignItems: 'center',
    },
    roundTitle: {
        fontSize: scale(13),
        fontWeight: '600',
        color: '#444',
        borderWidth: scale(2),
        width: scale(100),
        textAlign: 'center',
        backgroundColor: '#BFA276',
        borderRadius: scale(5),
        top: verticalScale(10),
        zIndex: 1,
    },
    roundNumber: {
        backgroundColor: '#F0E3C3',
        width: scale(250),
        fontSize: scale(40),
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#fff',
        borderRadius: scale(10),
        borderWidth: scale(2),
        borderColor: '#BFA276',
    },
    profilesRootContainer: {
        width: '95%',
        marginBottom: verticalScale(50),
        },
    // 프로필 영역 컨테이너 (두 개 프로필 정보)
    profilesContainer: {
        backgroundColor: '#5F86C8',
        borderRadius: scale(10),
        zIndex: 1,
        marginTop: verticalScale(10),
    },
    // 각 프로필 정보 행
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        // paddingHorizontal: scale(10),
        // marginTop: verticalScale(2),
        // paddingVertical: verticalScale(6),
    },
    profileIconContainer: {
        width: scale(50),
        height: '100%',
        borderColor: '#FFF',
        backgroundColor: '#345B9C',
        opacity: 1,
        borderTopLeftRadius: scale(10),      // 왼쪽 상단 둥근 모서리
        borderBottomLeftRadius: scale(10),

    },
    profilesTwoContainer: {
        backgroundColor: '#C2617D',
        borderRadius: scale(10),
        zIndex: 1,
        marginTop: verticalScale(10),
    },
    
    profileTwoIconContainer: {
        width: scale(50),
        height: '100%',
        borderColor: '#FFF',
        backgroundColor: '#A53253',
        opacity: 1,
        borderTopLeftRadius: scale(10),      // 왼쪽 상단 둥근 모서리
        borderBottomLeftRadius: scale(10),

    },
    medalIcon: {
        marginVertical: scale(10),
        marginLeft: scale(5),
        zIndex: 2,
    },
    medalTwoIcon: {
        marginVertical: scale(10),
        marginLeft: scale(5),
        zIndex: 2,
    },
    profileImageContainer: {
        width: scale(50),
        height: scale(50),
        borderRadius: scale(10),
        borderWidth: scale(2),
        borderColor: '#FFF',
        backgroundColor: '#FFF',
        resizeMode: 'cover',
        marginVertical: verticalScale(5),
        marginLeft: scale(10),
    },
    profileImage: {
        width: scale(50),
        height: scale(50),
        borderRadius: scale(10),
        borderWidth: scale(1),
        borderColor: '#FFF',
        backgroundColor: '#FFF',
        resizeMode: 'cover',
        marginVertical: verticalScale(-2),
        marginLeft: scale(-2),
    },
    profileName: {
        marginLeft: scale(10),
        fontSize: scale(14),
        color: '#FFF',
        fontWeight: 'bold',
    },

    profileScoreContainer: {
        backgroundColor: '#345B9C',
        width: scale(80),
        borderColor: '#FFF',
        borderRadius: scale(5),
        marginLeft: 'auto',  // 오른쪽으로 고정
        marginRight: scale(20),
        flexDirection: 'row',
        borderTopLeftRadius: scale(10),
        borderBottomLeftRadius: scale(10),
    },
    profileTwoScoreContainer: {
        backgroundColor: '#A53253',
        width: scale(80),
        borderColor: '#FFF',
        borderRadius: scale(5),
        flexDirection: 'row',
        borderTopLeftRadius: scale(10),
        borderBottomLeftRadius: scale(10),
    },
    profileScoreIcon: {
        resizeMode: 'contain',
        zIndex: 2,
    },
    profileScore: {
        fontSize: scale(18),
        fontWeight: 'bold',
        color: '#FFD700',
        marginLeft: scale(10),// 금색
    },
    ResultButtonContainer: {
        width: '40%',
        height: verticalScale(45),
        bottom: verticalScale(50),
    },
    resultButton: {
        alignItems: 'center',
        borderWidth: scale(1),
        borderRadius: scale(30),
        backgroundColor: '#F4AEB0',
        width: '100%',
        height: verticalScale(40),
        justifyContent: 'center',
    },
    resultButtonText: {
        color: '#000',
        fontSize: scale(18),
        fontWeight: 'bold',
        textAlign: 'center',
        position: 'absolute',
    },
    homeButton: {
        marginTop: verticalScale(20),
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
    // 결과 점수 컨테이너
    resultScoreContainer: {
        width: '90%',
        backgroundColor: '#F0E3C3',
        borderRadius: scale(10),
        padding: scale(15),
        marginVertical: verticalScale(20),
        borderWidth: scale(2),
        borderColor: '#BFA276',
    },
    resultScoreTitle: {
        fontSize: scale(18),
        fontWeight: 'bold',
        color: '#444',
        textAlign: 'center',
        marginBottom: verticalScale(10),
    },
    resultScoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: verticalScale(8),
        borderBottomWidth: scale(1),
        borderBottomColor: '#BFA276',
    },
    resultScoreName: {
        fontSize: scale(16),
        fontWeight: '600',
        color: '#444',
    },
    resultScoreValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resultScoreValue: {
        fontSize: scale(16),
        fontWeight: 'bold',
        color: '#444',
        marginRight: scale(10),
    },
    winnerText: {
        fontSize: scale(14),
        fontWeight: 'bold',
        color: '#2ecc40',
        backgroundColor: '#fff',
        paddingHorizontal: scale(8),
        paddingVertical: scale(4),
        borderRadius: scale(5),
    },
});
