import { StyleSheet } from 'react-native';
import { responsive, ASPECT_RATIOS } from '../../utils';

export default StyleSheet.create({
    // 전체 랭킹 카드 바깥 컨테이너
    cardOuterContainer: {
        width: responsive.scale(380),
        aspectRatio: ASPECT_RATIOS.PHOTO,
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
        // Percentage-based positioning for better responsiveness
        top: '24%',
        left: '42%',
        width: responsive.scale(55),
        height: responsive.verticalScale(50),
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    goldProfileImage: {
        width: '100%',
        height: '100%',  // 컨테이너 대비 이미지 높이
        borderRadius: responsive.borderRadius(10),
        borderWidth: responsive.scale(2),
        resizeMode: 'cover',
    },
    goldNickname: {
        marginTop: responsive.verticalScale(2),
        fontSize: responsive.font(10),
        fontWeight: '900',
        color: '#000',
    },
    goldScore: {
        marginTop: responsive.verticalScale(22),
        fontSize: responsive.font(16),
        fontWeight: '900',
        color: '#fff',
    },
    rankingText: {
        position: 'absolute',
        top: '4%',
        alignSelf: 'center',
        fontSize: responsive.font(20),
        fontWeight: 'bold',
        color: '#000',
    },
    // 2등 (실버) 컨테이너
    silverContainer: {
        position: 'absolute',
        // Percentage-based positioning for better responsiveness
        top: '28%',
        left: '10%',
        width: responsive.scale(55),
        height: responsive.verticalScale(50),
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    silverProfileImage: {
        width: '100%',
        height: '100%',
        borderRadius: responsive.borderRadius(10),
        borderColor: '#000',
        borderWidth: responsive.scale(2.5),
        resizeMode: 'cover',
    },
    silverNickname: {
        marginTop: responsive.verticalScale(2),
        fontSize: responsive.font(10),
        fontWeight: '900',
        color: '#000',
    },
    silverScore: {
        marginTop: responsive.verticalScale(12),
        fontSize: responsive.font(16),
        fontWeight: '900',
        color: '#fff',
    },

    // 3등 (브론즈) 컨테이너
    bronzeContainer: {
        position: 'absolute',
        // Percentage-based positioning for better responsiveness
        top: '28%',
        right: '12%',
        width: responsive.scale(55),
        height: responsive.verticalScale(50),
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    bronzeProfileImage: {
        width: '100%',
        height: '100%',
        borderRadius: responsive.borderRadius(10),
        borderColor: '#000',
        borderWidth: responsive.scale(2.5),
        resizeMode: 'cover',
    },
    bronzeNickname: {
        marginTop: responsive.verticalScale(2),
        fontSize: responsive.font(10),
        fontWeight: '900',
        color: '#000',
    },
    bronzeScore: {
        marginTop: responsive.verticalScale(12),
        fontSize: responsive.font(16),
        fontWeight: '900',
        color: '#fff',
    },
});
