import { StyleSheet } from 'react-native';

export default StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#FBF4E7',
        paddingHorizontal: 16,
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
        marginVertical: 12,
    },
    gameTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 12,
        color: '#333',
    },
    // --- 상단 영역(이미지+오른쪽 카드) ---
    topRow: {
        flexDirection: 'row',
        width: '100%',
        // 이미지 높이(255)에 맞춰 부모 높이를 고정
        height: 255,
        marginBottom: 10,
    },
    // --- 이미지 ---
    gameImage: {
        width: 200,
        // 부모 높이를 전부 차지
        height: '100%',
        resizeMode: 'contain',
        borderRadius: 10,
        backgroundColor: '#FBF4E7',
    },
    // --- 오른쪽 영역 ---
    rightColumn: {
        flex: 1,
        marginLeft: 5,
        // 자식(infoCard)들을 위아래로 적절히 배치
        justifyContent: 'space-between',
    },
    // --- infoCard: 각각 부모 높이의 절반(대략) 차지 ---
    infoCard: {
        // 부모(topRow)의 남은 높이를 절반씩 사용 (2개 가정)
        height: '48%',
        backgroundColor: '#FFF',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        // 간격이 너무 좁다면 marginVertical을 조금만 주거나 제거
        marginVertical: 4,
        // ✅ 검은색 테두리 추가
        borderWidth: 1,
        borderColor: '#000',

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    infoText: {
        fontSize: 16,
        textAlign: 'center',
        margin:10,
        color: '#555',
    },
    // --- 아래쪽 컨텐츠 ---
    detailContainer: {
        alignItems: 'center',
    },
    actionCard: {
        width: '100%',
        padding: 50,
        backgroundColor: '#FFF',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
        shadowColor: '#000',
        borderWidth: 1,
        borderColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    actionText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#555',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
        marginVertical: 16,
    },
    matchButton: {
        flex: 1,
        paddingVertical: 14,
        backgroundColor: '#FFB6C1',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 4,
    },
    togetherButton: {
        flex: 1,
        paddingVertical: 14,
        backgroundColor: '#FFDDC1',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 4,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    summaryCard: {
        width: '90%',
        height: 180,
        backgroundColor: '#FFF',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    summaryText: {
        fontSize: 18,
        color: '#555',
    },
    infoContainer: {
        width: '90%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 8,
    },
});
