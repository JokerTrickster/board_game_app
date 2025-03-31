import { StyleSheet, Dimensions } from 'react-native';
import { scale, verticalScale } from 'react-native-size-matters';

const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 414;
const guidelineBaseHeight = 736;

// const scale = (size: number) => (width / guidelineBaseWidth) * size;
// const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;

const styles = StyleSheet.create({
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
        justifyContent: 'center',
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
        marginTop: verticalScale(20),
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
        paddingVertical: verticalScale(19),
        paddingHorizontal: scale(23),
        borderRadius: scale(8),
        marginTop: verticalScale(10),
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
        fontSize: scale(18),
        color: '#222',
    },
    profileScore: {
        fontSize: scale(18),
        color: '#FFD700', // 금색
    },
    mainButton: {
        marginTop: 30,
        backgroundColor: '#007bff', // 파란색
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 10,
    },
    mainButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
});

export default styles;
