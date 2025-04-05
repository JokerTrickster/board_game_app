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
        width: scale(30),
        height: scale(30),
        borderRadius: scale(15),
        borderWidth: scale(3),
        borderColor: 'black',
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
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: [{ translateX: -scale(100) }, { translateY: -verticalScale(50) }],
        backgroundColor: 'rgba(0, 255, 0, 0.8)',
        padding: scale(20),
        borderRadius: scale(10),
        zIndex: 10,
    },
    clearEffectText: {
        fontSize: scale(24),
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    failEffectContainer: {
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: [{ translateX: -scale(100) }, { translateY: -verticalScale(50) }],
        backgroundColor: 'rgba(0, 255, 0, 0.8)',
        padding: scale(20),
        borderRadius: scale(10),
        zIndex: 10,
    },
    failEffectText: {
        fontSize: scale(24),
        fontWeight: 'bold',
        color: 'white',
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
});
