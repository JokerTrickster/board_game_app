import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 414;
const guidelineBaseHeight = 736;

// 반응형 사이즈 헬퍼 함수
const scale = (size: number) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;

export default StyleSheet.create({
    // 전체 랭킹 카드 바깥 컨테이너
    cardOuterContainer: {
        width: scale(380),
        height: verticalScale(250),
        overflow: 'hidden',
    },

    // rank_background.png 를 깔아주는 배경
    actionCardBackground: {
        flex: 1,
    },
    actionCardBackgroundImage: {
        // 이미지를 좌우로 늘리지 않고,
        // 세로/가로 비율을 유지하면서 컨테이너에 맞춤
        resizeMode: 'cover',
        height: '100%',
        width: '100%',
    },
    // 1등 (골드) 컨테이너
    goldContainer: {
        position: 'absolute',
        // ranking_background.png 에서 1등 영역의 위치로 조정
        top: verticalScale(60),
        left: scale(160),
        width: scale(55),
        height: verticalScale(50),
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    goldProfileImage: {
        width: '100%',
        height: '100%',  // 컨테이너 대비 이미지 높이
        borderRadius: scale(10),
        borderWidth: scale(2),
        resizeMode: 'cover',
    },
    goldNickname: {
        marginTop: verticalScale(2),
        fontSize: scale(12),
        fontWeight: '600',
        color: '#000',
    },
    rankingText: {
        position: 'absolute',
        top: verticalScale(12),
        alignSelf: 'center',
        fontSize: scale(20),
        fontWeight: 'bold',
        color: '#333',
    },
    // 2등 (실버) 컨테이너
    silverContainer: {
        position: 'absolute',
        // ranking_background.png 에서 2등 영역의 위치로 조정
        top: verticalScale(70),
        left: scale(40),
        width: scale(55),
        height: verticalScale(50),
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    silverProfileImage: {
        width: '100%',
        height: '100%',  // 컨테이너 대비 이미지 높이
        borderRadius: scale(10),
        borderColor: '#000',
        borderWidth: scale(2.5),
        resizeMode: 'cover',
    },
    silverNickname: {
        marginTop: verticalScale(2),
        fontSize: scale(11),
        fontWeight: '600',
        color: '#000',
    },

    // 3등 (브론즈) 컨테이너
    bronzeContainer: {
        position: 'absolute',
        // ranking_background.png 에서 3등 영역의 위치로 조정
        top: verticalScale(70),
        right: scale(45),
        width: scale(55),
        height: verticalScale(50),
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    bronzeProfileImage: {
        width: '100%',
        height: '100%',  // 컨테이너 대비 이미지 높이
        borderRadius: scale(10),
        borderColor: '#000',
        borderWidth: scale(2.5),
        resizeMode: 'cover',
    },
    bronzeNickname: {
        marginTop: verticalScale(2),
        fontSize: scale(11),
        fontWeight: '600',
        color: '#000',
    },
});
