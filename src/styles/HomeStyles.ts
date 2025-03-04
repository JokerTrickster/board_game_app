import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
    },
    // 프로필
    profileContainer: {
        // 프로필 전체 영역 감싸는 컨테이너
        marginTop:20,
    },
    profileBorder: {
        width: 200,
        height: 80,
        flexDirection: 'row', // 내부에서 프로필 이미지와 텍스트를 가로로 배치
        alignItems: 'center',
        // 필요한 경우 paddingHorizontal, margin 조정
    },
    // ← 추가: ImageBackground 내부 실제 이미지 스타일
    profileBorderImg: {
        resizeMode: 'contain',
        // 'contain'은 비율을 유지하며 전체가 보이도록 함
        // 'cover'나 'stretch'로 바꿀 수도 있음 (원하는 표시 방식에 따라 조정)
    },
    profileImage: {
        // 실제 사용자 프로필 이미지
        width: 65,
        height: 65,
        marginLeft: 5,
        marginRight: 15,
    },
    profileInfo: {
        // 닉네임, 레벨 영역
        justifyContent: 'center',
    },
    nickname: {
        fontSize: 16,
        fontWeight: 'bold',
        paddingBottom:10,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },

    // 하트(코인) 영역
    hearts: {
        flexDirection: 'row',
        alignItems: 'center',
        // 필요하면 marginLeft나 marginRight로 간격 조절
        marginLeft:-10,
    },
    heartIcon: {
        width: 110,
        height: 100,
        marginRight: 5,
        resizeMode: 'contain',
    },
    heartCount: {
        fontSize: 16,
        color: '#000',
        fontWeight: 'bold',
        marginLeft:-60,
    },
    profile: { flexDirection: 'row', alignItems: 'center' },
    settingsIcon: { padding: 10 },
    gameContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', marginTop: 10 },
    gameCard: {
        width: '45%',
        height: 300,
        backgroundColor: '#fff',
        marginVertical: 10,
        borderRadius: 10,
        padding: 5,
        elevation: 6,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#000',
    },
    gameImage: { width: '90%', height: 225, borderRadius: 8, marginBottom:-10 },
    gameTitle: { marginTop: 10, fontWeight: 'bold', fontSize: 20},
    hashtagContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    hashtag: { marginHorizontal: 3, fontSize: 12, backgroundColor: '#eee', padding: 2, borderRadius: 5},
    matchButton: {
        backgroundColor: '#6f96ff',
        padding: 15,
        alignItems: 'center',
        borderRadius: 20,
        margin: 20,
    },
    categoryBorder: {
        height: 20,
        width:'40%',
        borderWidth: 1,
        borderColor: '#666', // 원하는 색상으로 변경
        borderRadius: 5,
        alignItems: 'center',
        marginRight:7,
    },
    hashtagBorder: {
        height: 20,
        width: '40%',
        borderWidth: 1,
        borderColor: '#666', // 원하는 색상으로 변경
        borderRadius: 5,
        alignItems: 'center',
    },
    imagePlaceholder: {
        width: 100,
        height: 100,
        backgroundColor: '#EAEAEA',
        borderRadius: 10,
        marginBottom: 10,
    },
    matchButtonText: { color: '#fff', fontSize: 18 },

    // ✅ 설정 모달 스타일 추가
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    settingItem: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
    },
    slider: {
        width: '80%',
    },
    
    modalButton: {
        padding: 10,
        width: '100%',
        alignItems: 'center',
        backgroundColor: '#FFF6EB',
        borderRadius: 10,
        marginVertical: 5,
    },
 
    closeButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#ddd',
        width: '100%',
        alignItems: 'center',
        borderRadius: 10,
    },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    categoryText: {
        fontSize: 12,
        color: '#000',
    },
    separator: {
        fontSize: 12,
        color: '#999',
        marginHorizontal: 5,
    },
    hashtagText: {
        fontSize: 12,
        color: '#000',
    },
    background: {
        flex: 1,
        resizeMode: 'cover', // 이미지 크기를 화면에 맞게 조정
    },
});
